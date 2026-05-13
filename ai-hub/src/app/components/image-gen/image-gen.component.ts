import { Component, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
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
    private sanitizer: DomSanitizer
  ) { }

  updateInput(e: Event) {
    this.message.set((e.target as HTMLInputElement).value);
  }

  generateImage() {
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
}