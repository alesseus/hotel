import { Routes } from '@angular/router';
import { Servizi } from './servizi/servizi';
import { Storia } from './storia/storia';
import { Dovesiamo } from './dovesiamo/dovesiamo';
import { Prenotazione } from './prenotazione/prenotazione';
import { Amministrazione } from './amministrazione/amministrazione';
import { GestisciStaff } from './gestisci-staff/gestisci-staff';
import { GestisciStanza } from './gestisci-stanza/gestisci-stanza';
import {GestisciPrenotazione } from './gestisci-prenotazione/gestisci-prenotazione';
import { GestisciServizi } from './gestisci-servizi/gestisci-servizi';
import {Home} from './home/home';
import { Login } from './login/login';

export const routes: Routes = [
  { path: 'servizi', component: Servizi },
  { path: 'storia', component: Storia },
  { path: 'dovesiamo', component: Dovesiamo },
  { path: 'prenotazione', component: Prenotazione },
  { path: 'login', component: Login },
  { path: '', component: Home },
  {
    path: 'amministrazione',
    children: [
      { path: '', component: Amministrazione },
      { path: 'gestiscistaff', component: GestisciStaff },
      { path: 'gestiscistanza', component: GestisciStanza },
      { path: 'gestisciprenotazione', component: GestisciPrenotazione },
      { path: 'gestisciservizi', component: GestisciServizi },
    ]
  },
];