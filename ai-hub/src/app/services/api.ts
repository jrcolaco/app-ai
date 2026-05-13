import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }

  chat(message: string) {
    return this.http.post<any>(`${this.baseUrl}/chat`, { message });
  }

  tts(text: string) {
    return this.http.post<any>(`${this.baseUrl}/tts`, { text });
  }

  image(prompt: string) {
    return this.http.post<any>(`${this.baseUrl}/image`, { prompt });
  }

  weather(location: string) {
    return this.http.get<any>(`${this.baseUrl}/weather?location=${location}`);
  }

  sendAudio(blob: Blob) {
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');

    return this.http.post<any>(`${this.baseUrl}/stt`, formData);
  }

  weatherCoords(lat: number, lon: number) {
    return this.http.get<any>(
      `${this.baseUrl}/weather-coords?lat=${lat}&lon=${lon}`
    );
  }
}