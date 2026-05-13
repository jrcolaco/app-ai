import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {

  message = signal('');
  response = signal('');
  lastResponse = signal('');
  loading = signal(false);
  isRecording = signal(false);
  isSpeaking = signal(false);

  mediaRecorder: MediaRecorder | null = null;
  chunks: BlobPart[] = [];

  constructor(private api: ApiService) { }

  send() {
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

  speak() {
    if (!this.lastResponse()) return;
    this.isSpeaking.set(true);
    this.api.tts(this.lastResponse()).subscribe((res: any) => {
      const audio = new Audio(`data:audio/wav;base64,${res.audio}`);
      audio.onended = () => this.isSpeaking.set(false);
      audio.play();
    });
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.isRecording.set(true);
      this.chunks = [];

      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.sendAudio(blob);
        this.isRecording.set(false);
      };

      this.mediaRecorder.start();
    });
  }

  stopRecording() {
    this.mediaRecorder?.stop();
  }

  sendAudio(blob: Blob) {
    this.loading.set(true);

    this.api.sendAudio(blob).subscribe({
      next: (res: any) => {
        this.message.set(res.text);
        this.send();
      },
      error: () => this.loading.set(false)
    });
  }

  updateInput(e: Event) {
    this.message.set((e.target as HTMLInputElement).value);
  }
}