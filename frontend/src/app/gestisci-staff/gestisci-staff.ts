import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gestisci-staff',
  imports: [RouterLink],
  templateUrl: './gestisci-staff.html',
  styleUrl: './gestisci-staff.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestisciStaff {}
