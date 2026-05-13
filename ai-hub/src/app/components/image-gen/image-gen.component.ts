import { Component, signal } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-image-gen',
  templateUrl: './image-gen.component.html',
  styleUrl: './image-gen.component.scss'
})
export class ImageGenComponent {

  message = signal('');
  imageUrl = signal<any>('');
  loading = signal(false);

  constructor(
    private api: ApiService,
  ) { }

  updateInput(e: Event) {
    this.message.set((e.target as HTMLInputElement).value);
  }

  downloadImage() {
    const url = this.imageUrl();
    if (!url) return;

    const link = document.createElement('a');
    link.href = url as string;
    link.download = 'generated-image.png';
    link.click();
  }

  reset() {
    this.imageUrl.set('');
  }

  generateImage() {
    this.loading.set(true);

    this.api.image(this.message()).subscribe({
      next: (res: any) => {
        this.imageUrl.set(res.url);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}