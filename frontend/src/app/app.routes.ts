import { Routes } from '@angular/router';
import { Servizi } from './servizi/servizi';
import { Storia } from './storia/storia';
import { Dovesiamo } from './dovesiamo/dovesiamo';
import { Prenotazione } from './prenotazione/prenotazione';

export const routes: Routes = [
    {
        path: 'servizi',
        component: Servizi,
    },
    {
        path: 'storia',
        component: Storia,
    },
    {
        path: 'dovesiamo',
        component: Dovesiamo,
    },

     {
        path: 'prenotazione',
        component: Prenotazione,
    },

    


];
