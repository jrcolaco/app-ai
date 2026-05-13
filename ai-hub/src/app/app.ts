import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiService } from './services/api';

type AppMode = 'chat' | 'image' | 'vision';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {

  mode = signal<AppMode>('chat');

  message = signal('');
  response = signal('');
  imageUrl = signal<SafeUrl | string>('');
  lastResponse = signal('');

  loading = signal(false);

  locationName = signal('');
  weatherInfo = signal('');

  isRecording = signal(false);

  visionImage = signal('');
  visionFaces = signal(0);
  visionSmiling = signal(false);
  visionCountdown = signal(0);

  visionInterval: any = null;
  countdownTimer: any = null;

  audioCtx: AudioContext | null = null;

  mediaRecorder: MediaRecorder | null = null;
  chunks: BlobPart[] = [];

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.getUserWeather();
  }

  ngOnDestroy(): void {
    this.stopVision();
  }

  setMode(mode: AppMode): void {
    this.stopVision();
    this.mode.set(mode);
    this.response.set('');
    this.imageUrl.set('');
  }

  handleVisionMode(): void {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    this.audioCtx.resume();
    this.setMode('vision');
    this.startVision();
  }

  getUserWeather(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      this.api.weatherCoords(lat, lon).subscribe((res: any) => {
        this.locationName.set(res.location);
        this.weatherInfo.set(`${res.temp}°C - ${res.desc}`);
      });
    });
  }

  send(): void {
    if (!this.message().trim()) return;

    this.loading.set(true);

    this.api.chat(this.message()).subscribe({
      next: (res: any) => {
        this.response.set(res.response);
        this.lastResponse.set(res.response);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  speak(): void {
    if (!this.lastResponse()) return;

    this.api.tts(this.lastResponse()).subscribe((res: any) => {
      new Audio(`data:audio/wav;base64,${res.audio}`).play();
    });
  }

  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.isRecording.set(true);
      this.chunks = [];

      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e: BlobEvent) => {
        this.chunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.sendAudio(blob);
        this.isRecording.set(false);
      };

      this.mediaRecorder.start();
    });
  }

  stopRecording(): void {
    this.mediaRecorder?.stop();
  }

  sendAudio(blob: Blob): void {
    this.loading.set(true);

    this.api.sendAudio(blob).subscribe({
      next: (res: any) => {
        this.message.set(res.text);
        this.send();
      },
      error: () => this.loading.set(false)
    });
  }

  updateInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.message.set(value);
  }

  generateImage(): void {
    this.loading.set(true);

    this.api.image(this.message()).subscribe({
      next: (res: any) => {
        this.imageUrl.set(
          this.sanitizer.bypassSecurityTrustUrl(res.url)
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  startVision(): void {

    // ✅ stop any previous stream / interval
    this.stopVision();

    // ✅ reset captured image
    this.visionImage.set('');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {

        const video = this.videoRef?.nativeElement;
        if (!video) return;

        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
          this.pollVision();
        };

      })
      .catch(err => {
        console.error('Camera error:', err);
      });
  }


  pollVision(): void {
    if (this.visionInterval) {
      clearInterval(this.visionInterval);
    }

    this.visionInterval = setInterval(() => {

      const video = this.videoRef?.nativeElement;
      const canvas = this.canvasRef?.nativeElement;

      if (!video || !canvas || video.videoWidth === 0) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      const image = canvas.toDataURL('image/jpeg', 0.8);

      this.api.sendFrame(image).subscribe({
        next: (res) => {
          this.visionFaces.set(res.faces);
          this.visionSmiling.set(res.smiling);

          this.drawOverlay(res.boxes);
          this.handleCountdown(res.smiling);
        },
        error: (err) => {
          console.error("Vision API error:", err);
        }
      });

    }, 300);
  }

  drawOverlay(boxes: number[][]): void {

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;

    boxes?.forEach(([x, y, w, h]) => {
      ctx.strokeRect(x, y, w, h);
    });

    if (this.visionCountdown() > 0) {
      ctx.fillStyle = 'red';
      ctx.font = 'bold 60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.visionCountdown().toString(),
        canvas.width / 2,
        canvas.height / 2
      );
    }
  }

  handleCountdown(smiling: boolean): void {

    if (smiling && !this.countdownTimer) {

      let count = 3;
      this.visionCountdown.set(count);

      this.countdownTimer = setInterval(() => {

        count--;
        this.visionCountdown.set(count);

        if (count <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;

          setTimeout(() => {
            this.captureImage();
            this.stopVision();
          }, 0);
        }

      }, 1000);
    }

    if (!smiling && this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.visionCountdown.set(0);
    }
  }

  captureImage(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;

    if (!video || !canvas || video.videoWidth === 0) return;

    this.playBeep();

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0);

    this.visionImage.set(canvas.toDataURL('image/png'));
  }

  playBeep(): void {
    try {
      if (!this.audioCtx) return;

      const oscillator = this.audioCtx.createOscillator();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, this.audioCtx.currentTime);

      oscillator.connect(this.audioCtx.destination);
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
      }, 100);

    } catch (e) {
      console.warn('Beep failed:', e);
    }
  }

  // ✅ STOP EVERYTHING
  stopVision(): void {

    if (this.visionInterval) {
      clearInterval(this.visionInterval);
      this.visionInterval = null;
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    try {
      const stream = this.videoRef?.nativeElement?.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    } catch { }

    this.visionFaces.set(0);
    this.visionSmiling.set(false);
    this.visionCountdown.set(0);
  }
}
