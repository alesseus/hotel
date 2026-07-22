import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { GestisciPrenotazioneServices } from './Services/services';
import { prenotazione } from '../prenotazione/interfacce/prenotazione_i';
import { stanza } from '../gestisci-stanza/interfacce/stanza_i';
import { servizio } from './interfacce/servizio_i';
import { ServizioByIdPipe } from './pipes/servizio-by-id.pipe';

@Component({
  selector: 'app-gestisci-prenotazione',
  imports: [RouterLink, FormsModule, DecimalPipe, ServizioByIdPipe],
  templateUrl: './gestisci-prenotazione.html',
  styleUrl: './gestisci-prenotazione.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GestisciPrenotazioneServices]
})
export class GestisciPrenotazione implements OnInit {

  private readonly srv = inject(GestisciPrenotazioneServices);

  prenotazioni = signal<prenotazione[]>([]);
  stanze       = signal<stanza[]>([]);
  servizi      = signal<servizio[]>([]);

  caricamento       = signal(true);
  erroreCaricamento = signal('');

  ricerca = signal('');

  get prenotazioniFiltrate(): prenotazione[] {
    const q = this.ricerca().trim().toLowerCase();
    if (!q) return this.prenotazioni();
    return this.prenotazioni().filter(p =>
      (p.NOME    ?? '').toLowerCase().includes(q) ||
      (p.COGNOME ?? '').toLowerCase().includes(q) ||
      (p.EMAIL   ?? '').toLowerCase().includes(q) ||
      String(p.IDPRE).includes(q)
    );
  }

  modaleAperto = signal(false);
  modalita     = signal<'crea' | 'modifica'>('crea');
  formError    = signal('');
  invio        = signal(false);

  form: Partial<prenotazione> = this.vuota();

  stanzaSelezionata  = signal<stanza | null>(null);
  servizioSelezionato = signal<servizio | null>(null);

  serviziSelezionati = signal<number[]>([]);

  ospiti = signal<{ nome: string; cognome: string }[]>([]);

  aggiungiOspite(): void { this.ospiti.update(l => [...l, { nome: '', cognome: '' }]); }
  rimuoviOspite(index: number): void { this.ospiti.update(l => l.filter((_, i) => i !== index)); }
  aggiornaOspiteNome(index: number, val: string): void {
    this.ospiti.update(l => { const c = [...l]; c[index] = { ...c[index], nome: val }; return c; });
  }
  aggiornaOspiteCognome(index: number, val: string): void {
    this.ospiti.update(l => { const c = [...l]; c[index] = { ...c[index], cognome: val }; return c; });
  }

  private parseOspiti(ospiti: string | undefined): { nome: string; cognome: string }[] {
    if (!ospiti) return [];
    return ospiti.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(full => {
        const parti = full.split(' ');
        return { nome: parti[0] ?? '', cognome: parti.slice(1).join(' ') };
      });
  }

  private buildOspiti(): string {
    return this.ospiti()
      .map(o => `${o.nome} ${o.cognome}`.trim())
      .filter(s => s.length > 0)
      .join(', ');
  }

  get checkOutMin(): string {
    const ci = this.form.CHECK_IN;
    if (!ci) return '';
    const d = new Date(ci as any);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  get stanzeFiltrate(): stanza[] {
    const ci = this.form.CHECK_IN ? new Date(this.form.CHECK_IN as any) : null;
    const co = this.form.CHECK_OUT ? new Date(this.form.CHECK_OUT as any) : null;
.
    const idStanzaCorrente = this.modalita() === 'modifica' ? this.form.IDSTANZA : null;

    if (!ci || !co || co <= ci) {
      return this.stanze().filter(s =>
        s.IDSTANZA === idStanzaCorrente || s.STATO?.toLowerCase() !== 'manutenzione'
      );
    }

    const prenotazioniAttive = this.prenotazioni().filter(p =>
      (p.STATO?.toLowerCase() !== 'cancellata') &&
      (this.modalita() === 'modifica' ? p.IDPRE !== this.form.IDPRE : true)
    );

    return this.stanze().filter(s => {
      if (s.IDSTANZA === idStanzaCorrente) return true;

      if (s.STATO?.toLowerCase() === 'manutenzione') return false;
      if (s.STATO?.toLowerCase() === 'occupata') return false;
      const conflitto = prenotazioniAttive.some(p => {
        if (p.IDSTANZA !== s.IDSTANZA) return false;
        const pCi = p.CHECK_IN  ? new Date(p.CHECK_IN)  : null;
        const pCo = p.CHECK_OUT ? new Date(p.CHECK_OUT) : null;
        if (!pCi || !pCo) return false;
        return ci < pCo && co > pCi;
      });
      return !conflitto;
    });
  }

  get totaleCalcolato(): number {
    const stanza   = this.stanzaSelezionata();
    const checkIn  = this.form.CHECK_IN  ? new Date(this.form.CHECK_IN  as any) : null;
    const checkOut = this.form.CHECK_OUT ? new Date(this.form.CHECK_OUT as any) : null;

    let notti = 0;
    if (checkIn && checkOut && checkOut > checkIn) {
      notti = Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    }

    const costoStanza = stanza ? (stanza.COSTO ?? 0) * notti : 0;

    const costoServizi = this.serviziSelezionati().reduce((acc, id) => {
      const sv = this.servizi().find(s => s.IDSERVIZIO === id);
      return acc + (sv ? (sv.COSTO ?? 0) : 0);
    }, 0);

    return costoStanza + costoServizi;
  }

  aggiungiServizio():                             void { this.serviziSelezionati.update(l => [...l, null as any]); }
  rimuoviServizio(index: number):                void { this.serviziSelezionati.update(l => l.filter((_, i) => i !== index)); }
  aggiornaServizio(index: number, id: number | null): void {
    this.serviziSelezionati.update(l => { const c = [...l]; c[index] = id as any; return c; });
  }

  get serviziRows(): { index: number; idServizio: number | null }[] {
    return this.serviziSelezionati().map((id, i) => ({ index: i, idServizio: id }));
  }

  eliminaTarget   = signal<prenotazione | null>(null);
  eliminaInCorso  = signal(false);

  ngOnInit(): void { this.caricaTutto(); }

  caricaTutto(): void {
    this.caricamento.set(true);
    this.erroreCaricamento.set('');

    this.srv.getPrenotazioni().subscribe({
      next: (data) => { this.prenotazioni.set(data); this.caricamento.set(false); },
      error: (err)  => {
        console.error('Errore caricamento prenotazioni', err);
        this.erroreCaricamento.set('Impossibile caricare le prenotazioni. Riprova più tardi.');
        this.caricamento.set(false);
      }
    });

    this.srv.getStanze().subscribe({
      next:  (data) => this.stanze.set(data),
      error: (err)  => console.error('Errore caricamento stanze', err)
    });

    this.srv.getServizi().subscribe({
      next:  (data) => this.servizi.set(data),
      error: (err)  => console.error('Errore caricamento servizi', err)
    });
  }

  onStanzaChange(id: number | null): void {
    this.stanzaSelezionata.set(id ? (this.stanze().find(s => s.IDSTANZA === +id) ?? null) : null);
    this.aggiornaFormTotale();
  }

  onServizioChange(id: number | null): void {
    this.servizioSelezionato.set(id ? (this.servizi().find(s => s.IDSERVIZIO === +id) ?? null) : null);
  }

  onCheckInChange(): void {
    if (this.form.CHECK_OUT && this.form.CHECK_IN && this.form.CHECK_OUT <= this.form.CHECK_IN) {
      this.form.CHECK_OUT = '' as any;
      this.stanzaSelezionata.set(null);
      this.form.IDSTANZA = null as any;
    }
    this.aggiornaFormTotale();
  }

  onDataChange():      void { this.aggiornaFormTotale(); }
  aggiornaFormTotale(): void { setTimeout(() => { this.form.TOTALE = this.totaleCalcolato; }, 0); }

  apriModaleCreazione(): void {
    this.modalita.set('crea');
    this.form = this.vuota();
    this.stanzaSelezionata.set(null);
    this.servizioSelezionato.set(null);
    this.serviziSelezionati.set([]);
    this.ospiti.set([]);
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  apriModaleModifica(p: prenotazione): void {

    this.modalita.set('modifica');
    this.form = {
      ...p,
      DATANASCITA: this.toDateInputString(p.DATANASCITA),
      CHECK_IN:    this.toDateInputString(p.CHECK_IN),
      CHECK_OUT:   this.toDateInputString(p.CHECK_OUT),
    } as any;
    this.stanzaSelezionata.set(this.stanze().find(s => s.IDSTANZA === p.IDSTANZA) ?? null);
    this.servizioSelezionato.set(this.servizi().find(s => s.IDSERVIZIO === p.IDSERVIZIO) ?? null);
    this.serviziSelezionati.set(p.IDSERVIZIO ? [p.IDSERVIZIO] : []);
    this.ospiti.set(this.parseOspiti(p.OSPITI));
    this.formError.set('');
    this.modaleAperto.set(true);
  }

  chiudiModale(): void {
    this.modaleAperto.set(false);
    this.form = this.vuota();
    this.stanzaSelezionata.set(null);
    this.servizioSelezionato.set(null);
    this.serviziSelezionati.set([]);
    this.ospiti.set([]);
    this.formError.set('');
  }


  salva(ngForm: NgForm): void {
    this.formError.set('');

    if (ngForm.invalid) {
      this.formError.set('Compila tutti i campi obbligatori.');
      return;
    }
    if (this.form.CHECK_IN && this.form.CHECK_OUT && this.form.CHECK_OUT <= this.form.CHECK_IN) {
      this.formError.set('La data di check-out deve essere successiva al check-in.');
      return;
    }

    this.invio.set(true);

    const totale   = this.totaleCalcolato;
    const caparra  = +(totale * 0.10).toFixed(2);
    const idServizioFirst = this.serviziSelezionati().find(id => id != null) ?? null;

    const payload: Partial<prenotazione> = {
      IDPRE:       this.form.IDPRE ?? 0,
      NOME:        this.form.NOME        ?? '',
      COGNOME:     this.form.COGNOME     ?? '',
      EMAIL:       this.form.EMAIL       ?? '',
      TELEFONO:    this.form.TELEFONO    ?? null as any,
      DATANASCITA: this.form.DATANASCITA && String(this.form.DATANASCITA).length === 10
                     ? new Date(this.form.DATANASCITA as any)
                     : null as any,
      IDSTANZA:    this.form.IDSTANZA    ?? null as any,
      IDSERVIZIO:  idServizioFirst       ?? null as any,
      TOTALE:      totale,
      CAPARRA:     caparra,
      SPA:         this.form.SPA         ?? false,
      NOTE:        this.form.NOTE        ?? null as any,
      CHECK_IN:    this.form.CHECK_IN    ? new Date(this.form.CHECK_IN  as any) : null as any,
      CHECK_OUT:   this.form.CHECK_OUT   ? new Date(this.form.CHECK_OUT as any) : null as any,
      STATO:       this.form.STATO       ?? 'In attesa',
      OSPITI:      this.buildOspiti(),
    };


    const obs = this.modalita() === 'crea'
      ? this.srv.addPrenotazione(payload)
      : this.srv.cambiaPrenotazione(payload as prenotazione);

    obs.subscribe({
      next: () => {
        this.invio.set(false);
        this.chiudiModale();
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore salvataggio', err);
        this.formError.set('Errore durante il salvataggio. Riprova.');
        this.invio.set(false);
      }
    });
  }

  cambiaStatoInCorso = signal<number | null>(null);

  confermaPrenotazione(p: prenotazione): void { this.cambiaStato(p, 'Confermata'); }
  rifiutaPrenotazione(p: prenotazione):  void { this.cambiaStato(p, 'Cancellata'); }

  private cambiaStato(p: prenotazione, nuovoStato: string): void {
    this.cambiaStatoInCorso.set(p.IDPRE);
    const aggiornata: prenotazione = { ...p, STATO: nuovoStato };
    this.srv.cambiaPrenotazione(aggiornata).subscribe({
      next: () => {
        this.cambiaStatoInCorso.set(null);
        this.prenotazioni.update(list =>
          list.map(x => x.IDPRE === p.IDPRE ? aggiornata : x)
        );
      },
      error: (err) => {
        console.error('Errore cambio stato', err);
        this.cambiaStatoInCorso.set(null);
        this.erroreCaricamento.set("Errore durante l'aggiornamento dello stato. Riprova.");
      }
    });
  }

  apriConfermaEliminazione(p: prenotazione): void { this.eliminaTarget.set(p); }

  annullaEliminazione():                     void { this.eliminaTarget.set(null); }

  confermaEliminazione(): void {
    const target = this.eliminaTarget();
    if (!target) return;
    this.eliminaInCorso.set(true);

    this.srv.cancellaPrenotazione(target.IDPRE).subscribe({
      next: () => {
        this.eliminaInCorso.set(false);
        this.eliminaTarget.set(null);
        this.caricaTutto();
      },
      error: (err) => {
        console.error('Errore eliminazione', err);
        this.eliminaInCorso.set(false);
        this.eliminaTarget.set(null);
        this.erroreCaricamento.set("Errore durante l'eliminazione. Riprova.");
      }
    });
  }

  vuota(): Partial<prenotazione> {
    return {
      NOME: '', COGNOME: '', EMAIL: '', TELEFONO: '',
      DATANASCITA: null as any,
      IDSTANZA:    null as any,
      IDSERVIZIO:  null as any,
      TOTALE:      null as any,
      CAPARRA:     null as any,
      SPA:         false,
      NOTE:        '',
      CHECK_IN:    null as any,
      CHECK_OUT:   null as any,
      STATO:       'In attesa'
    };
  }

  calcolaNotti(checkIn: any, checkOut: any): number {
    if (!checkIn || !checkOut) return 0;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (co <= ci) return 0;
    return Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24));
  }

  formatData(d: string | Date | undefined): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('it-IT');
  }

  private toDateInputString(d: string | Date | undefined): string {
    if (!d) return '';
    return new Date(d).toISOString().slice(0, 10);
  }
}
