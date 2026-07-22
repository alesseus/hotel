import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-amministrazione',
  imports: [RouterLink],
  templateUrl: './amministrazione.html',
  styleUrl: './amministrazione.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Amministrazione {}