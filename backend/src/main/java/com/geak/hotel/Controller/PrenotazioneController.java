package com.geak.hotel.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.geak.hotel.Model.Prenotazione;
import com.geak.hotel.Services.EmailService;
import com.geak.hotel.Services.PrenotazioniSrv;

@RestController
@RequestMapping("/prenotazione/")
public class PrenotazioneController {

	@Autowired
	PrenotazioniSrv PrenotazioneDependency;
	EmailService emailService;
	
	@GetMapping("lista")
	public List<Prenotazione> veditutti() {
		return PrenotazioneDependency.getAllPrenotazioni();
	}

	@GetMapping("singolo/{IDPRE}")
	public Prenotazione vedisingolo(@PathVariable long IDPRE) {
		Prenotazione p = PrenotazioneDependency.vediPrenotazione(IDPRE).get();
		return p;
	}

	@RequestMapping(value = "cancella/{IDPREdel}", method = RequestMethod.DELETE)
	public PrenotazioniSrv cancella(@PathVariable long IDPREdel) {
		PrenotazioneDependency.cancellaPrenotazione(IDPREdel);
		return PrenotazioneDependency;
	}

	@RequestMapping(value = "add", method = RequestMethod.POST)
	public PrenotazioniSrv add(@RequestBody Prenotazione nuova) {
		PrenotazioneDependency.addPrenotazione(nuova);
		emailService.inviaConfermaPrenotazione(nuova);
		return PrenotazioneDependency;
	}

	@RequestMapping(value = "cambia", method = RequestMethod.PUT)
	public PrenotazioniSrv cambia(@RequestBody Prenotazione cambiata) {
		PrenotazioneDependency.cambiaPrenotazione(cambiata);
		return PrenotazioneDependency;
	}

	@GetMapping("mail/{email}")
	public List<Prenotazione> vediPerMail(@PathVariable String email) {
		return PrenotazioneDependency.getAllPrenotazioni()
				.stream()
				.filter(p -> p.getEMAIL().equalsIgnoreCase(email))
				.collect(java.util.stream.Collectors.toList());
	}

}
