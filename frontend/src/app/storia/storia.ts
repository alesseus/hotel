import { Component, OnDestroy, OnInit } from '@angular/core';

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
export class Storia implements OnInit, OnDestroy {
  images: GalleryImage[] = [
    { src: '/assets/images/adventure-albania-4VBZJ2JV54U-unsplash.jpg', alt: 'Blue Horizon Hotel - 1' },
    { src: '/assets/images/antonio-araujo-V1Wjy0Xg5tA-unsplash.jpg', alt: 'Blue Horizon Hotel - 2' },
    { src: '/assets/images/evangelos-mpikakis-ionHF5Qcnz0-unsplash.jpg', alt: 'Blue Horizon Hotel - 3' },
    { src: '/assets/images/gabriel-ghnassia-A9h6OsAxTyQ-unsplash.jpg', alt: 'Blue Horizon Hotel - 4' },
  ];

  activeIndex = 0;

  private readonly autoplayDelay = 4000; // ms
  private autoplayTimer: ReturnType<typeof setInterval> | null = null;

  get activeImage(): GalleryImage {
    return this.images[this.activeIndex];
  }

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  setSlide(index: number): void {
    this.activeIndex = index;
    this.restartAutoplay();
  }

  prevSlide(): void {
    this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
    this.restartAutoplay();
  }

  nextSlide(): void {
    this.activeIndex = (this.activeIndex + 1) % this.images.length;
    this.restartAutoplay();
  }

  pauseAutoplay(): void {
    this.stopAutoplay();
  }

  resumeAutoplay(): void {
    this.startAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    this.autoplayTimer = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.images.length;
    }, this.autoplayDelay);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  }

  private restartAutoplay(): void {
    this.startAutoplay();
  }
}