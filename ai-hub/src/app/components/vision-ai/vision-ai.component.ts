import {
  signal,
  ViewChild,
  OnDestroy,
  Component,
  AfterViewInit,
  ElementRef
} from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-vision-ai',
  templateUrl: './vision-ai.component.html',
  styleUrl: './vision-ai.component.scss'
})
export class VisionAiComponent implements AfterViewInit, OnDestroy {

  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  visionImage = signal('');
  visionFaces = signal(0);
  visionSmiling = signal(false);
  visionCountdown = signal(0);

  flash = signal(false);
  capturing = signal(false);
  zoom = signal(false);

  animationFrameId: any = null;
  countdownTimer: any = null;

  audioCtx: AudioContext | null = null;

  lastApiCall = 0;

  smoothedBoxes: number[][] = [];
  previousBoxes: number[][] = [];

  countdownActive = false;

  hasCaptured = true;

  constructor(private api: ApiService) { }

  ngAfterViewInit(): void {
    this.startVision();
  }

  ngOnDestroy(): void {
    this.stopVision();
  }

  startVision(): void {
    this.stopVision();
    this.visionImage.set('');

    this.hasCaptured = false;
    this.countdownActive = false;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }

    this.audioCtx.resume();

    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        const video = this.videoRef.nativeElement;
        video.srcObject = stream;

        video.onloadedmetadata = () => {
          video.play();
          this.pollVision();
        };
      })
      .catch(() => { });
  }

  pollVision(): void {
    if (!this.videoRef || !this.canvasRef) return;

    const loop = () => {

      const video = this.videoRef?.nativeElement;
      const canvas = this.canvasRef?.nativeElement;

      if (!video || !canvas || video.videoWidth === 0) {
        this.animationFrameId = requestAnimationFrame(loop);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const now = performance.now();

      if (now - this.lastApiCall > 300) {

        ctx.drawImage(video, 0, 0);
        const image = canvas.toDataURL('image/jpeg', 0.7);

        this.api.sendFrame(image).subscribe({
          next: (res) => {
            this.updateBoxes(res.boxes);
            this.visionFaces.set(res.faces);
            this.visionSmiling.set(res.smiling);
            this.handleCountdown(res.smiling);
          }
        });

        this.lastApiCall = now;
      }

      this.drawOverlay(this.smoothedBoxes);

      this.animationFrameId = requestAnimationFrame(loop);
    };

    loop();
  }

  updateBoxes(newBoxes: number[][]) {

    if (!this.previousBoxes.length) {
      this.previousBoxes = newBoxes;
      this.smoothedBoxes = newBoxes;
      return;
    }

    this.smoothedBoxes = newBoxes.map((box, i) => {
      const prev = this.previousBoxes[i] || box;

      return [
        prev[0] * 0.7 + box[0] * 0.3,
        prev[1] * 0.7 + box[1] * 0.3,
        prev[2] * 0.7 + box[2] * 0.3,
        prev[3] * 0.7 + box[3] * 0.3
      ];
    });

    this.previousBoxes = this.smoothedBoxes;
  }

  drawOverlay(boxes: number[][]): void {

    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 3;

    boxes?.forEach(([x, y, w, h]) => {
      ctx.strokeRect(x, y, w, h);
    });

    if (this.visionCountdown() > 0) {
      ctx.fillStyle = 'red';
      ctx.font = 'bold 80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        this.visionCountdown().toString(),
        canvas.width / 2,
        canvas.height / 2
      );
    }
  }

  handleCountdown(smiling: boolean): void {

    if (this.hasCaptured) return;

    if (smiling && !this.countdownActive) {

      this.countdownActive = true;

      let count = 3;
      this.visionCountdown.set(count);

      this.playBeep();

      this.countdownTimer = setInterval(() => {

        if (!this.countdownActive || this.hasCaptured) return;

        count--;

        if (count <= 0) {

          this.countdownActive = false;

          clearInterval(this.countdownTimer);
          this.countdownTimer = null;

          this.captureImage();
          this.stopVision();
          return;
        }

        this.visionCountdown.set(count);
        this.playBeep();

      }, 1000);
    }

    if (!smiling && this.countdownActive) {
      this.countdownActive = false;

      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
      this.visionCountdown.set(0);
    }
  }

  captureImage(): void {

    const videoEl = this.videoRef?.nativeElement;
    const canvasEl = this.canvasRef?.nativeElement;

    if (!videoEl || !canvasEl || videoEl.videoWidth === 0) return;

    this.hasCaptured = true;

    canvasEl.width = videoEl.videoWidth;
    canvasEl.height = videoEl.videoHeight;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoEl, 0, 0);

    const image = canvasEl.toDataURL('image/png');

    this.capturing.set(true);
    this.zoom.set(true);

    setTimeout(() => {

      this.playShutter();
      this.triggerFlash();

      setTimeout(() => {
        this.visionImage.set(image);
        this.capturing.set(false);
        this.zoom.set(false);
      }, 120);

    }, 80);
  }

  triggerFlash(): void {
    this.flash.set(true);

    setTimeout(() => this.flash.set(false), 150);
  }

  playShutter(): void {
    new Audio('/ai/assets/shutter.mp3').play().catch(() => { });
  }

  playBeep(): void {
    try {
      if (!this.audioCtx) return;

      const o = this.audioCtx.createOscillator();
      o.frequency.value = 800;
      o.connect(this.audioCtx.destination);
      o.start();
      setTimeout(() => o.stop(), 100);

    } catch { }
  }

  stopVision(): void {

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }

    try {
      const videoEl = this.videoRef?.nativeElement;

      if (videoEl && videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        videoEl.srcObject = null;
      }

    } catch { }

    this.visionFaces.set(0);
    this.visionSmiling.set(false);
    this.visionCountdown.set(0);
  }

  downloadImage() {
    const url = this.visionImage();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = 'capture.png';
    link.click();
  }

  reset() {
    this.visionImage.set('');
    this.startVision();
  }
}
