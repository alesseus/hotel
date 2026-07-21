import { Component } from '@angular/core';

interface GalleryImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-storia',
  imports: [],
  templateUrl: './storia.html',
  styleUrl: './storia.css',
})
export class Storia {
  images: GalleryImage[] = [
    { src: '/assets/images/adventure-albania-4VBZJ2JV54U-unsplash.jpg', alt: 'Blue Horizon Hotel - 1' },
    { src: '/assets/images/antonio-araujo-V1Wjy0Xg5tA-unsplash.jpg', alt: 'Blue Horizon Hotel - 2' },
    { src: '/assets/images/evangelos-mpikakis-ionHF5Qcnz0-unsplash.jpg', alt: 'Blue Horizon Hotel - 3' },
    { src: '/assets/images/gabriel-ghnassia-A9h6OsAxTyQ-unsplash.jpg', alt: 'Blue Horizon Hotel - 4' },
  ];

  activeIndex = 0;

  get activeImage(): GalleryImage {
    return this.images[this.activeIndex];
  }

  setSlide(index: number): void {
    this.activeIndex = index;
  }

  prevSlide(): void {
    this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
  }

  nextSlide(): void {
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
  }
}