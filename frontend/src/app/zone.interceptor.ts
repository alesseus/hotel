import { HttpInterceptorFn } from '@angular/common/http';
import { inject, NgZone } from '@angular/core';
import { Observable } from 'rxjs';

export const zoneInterceptor: HttpInterceptorFn = (req, next) => {
  const ngZone = inject(NgZone);

  return new Observable(observer => {
    const sub = next(req).subscribe({
      next: (event) => ngZone.run(() => observer.next(event)),
      error: (err) => ngZone.run(() => observer.error(err)),
      complete: () => ngZone.run(() => observer.complete()),
    });
    return () => sub.unsubscribe();
  });
};