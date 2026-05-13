import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatComponent } from './components/chat/chat.component';
import { ImageGenComponent } from './components/image-gen/image-gen.component';
import { VisionAiComponent } from './components/vision-ai/vision-ai.component';
import { WeatherComponent } from './components/weather/weather.component';

type AppMode = 'chat' | 'image' | 'vision';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    ChatComponent,
    ImageGenComponent,
    VisionAiComponent,
    WeatherComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {

  mode = signal<AppMode>('chat');

  setMode(mode: AppMode) {
    this.mode.set(mode);
  }
}