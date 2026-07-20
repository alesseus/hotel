import { Component, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

import { Contatti } from './contatti/contatti';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink,Contatti],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('hotel');
}
