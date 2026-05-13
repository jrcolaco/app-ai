import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ApiService } from './services/api';

interface WeatherResponse {
  location: string;
  temp: number;
  desc: string;
}

interface ChatResponse {
  response: string;
}

interface TtsResponse {
  audio: string;
}

interface AudioResponse {
  text: string;
}

interface ImageResponse {
  url: string;
}

type AppMode = 'chat' | 'image';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.html'
})
export class AppComponent implements OnInit {

  mode = signal<AppMode>('chat');

  message = signal<string>('');
  response = signal<string>('');
  imageUrl = signal<SafeUrl | string>('');
  lastResponse = signal<string>('');

  loading = signal<boolean>(false);

  locationName = signal<string>('');
  weatherInfo = signal<string>('');

  isRecording = signal<boolean>(false);
  mediaRecorder: MediaRecorder | null = null;
  chunks: BlobPart[] = [];

  constructor(
    private api: ApiService,
    private sanitizer: DomSanitizer
  ) { }
  ngOnInit(): void {
    this.getUserWeather();
  }

  updateInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.message.set(value);
  }

  setMode(mode: AppMode): void {
    this.mode.set(mode);
    this.response.set('');
    this.imageUrl.set('');
  }

  // ✅ NEW: auto weather
  getUserWeather(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      this.api.weatherCoords(lat, lon).subscribe((res: WeatherResponse) => {
        this.locationName.set(res.location);
        this.weatherInfo.set(`${res.temp}°C - ${res.desc}`);
      });
    });
  }

  // 💬 CHAT
  send(): void {
    if (!this.message().trim()) return;

    this.loading.set(true);

    this.api.chat(this.message()).subscribe({
      next: (res: ChatResponse) => {
        this.response.set(res.response);
        this.lastResponse.set(res.response);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  // 🔊 SPEAK
  speak(): void {
    if (!this.lastResponse()) return;

    this.api.tts(this.lastResponse()).subscribe((res: TtsResponse) => {
      new Audio(`data:audio/wav;base64,${res.audio}`).play();
    });
  }

  // 🎤 VOICE inside chat
  startRecording(): void {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.isRecording.set(true);
        this.chunks = [];

        this.mediaRecorder = new MediaRecorder(stream);

        this.mediaRecorder.ondataavailable = (e: BlobEvent) => this.chunks.push(e.data);

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
      next: (res: AudioResponse) => {
        this.message.set(res.text);
        this.send();
      },
      error: () => this.loading.set(false)
    });
  }

  // 🖼️ IMAGE
  generateImage(): void {
    this.loading.set(true);

    this.api.image(this.message()).subscribe({
      next: (res: ImageResponse) => {
        this.imageUrl.set(
          this.sanitizer.bypassSecurityTrustUrl(res.url)
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
