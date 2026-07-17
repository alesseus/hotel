package com.geak.hotel.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Prenotazione;
import com.geak.hotel.Repository.PrenotazioniRepo;

@Service
public class PrenotazioniSrv {

	@Autowired
	private PrenotazioniRepo PrenotazioneRepository;
	
	public List<Prenotazione> getAllPrenotazioni(){
		return PrenotazioneRepository.findAll();
	}
	
	public void addPrenotazione(Prenotazione nuovaPrenotazione) {
		PrenotazioneRepository.save(nuovaPrenotazione);
	}
	
	public void cancellaPrenotazione(Long idPre) {
		PrenotazioneRepository.deleteById(idPre);
	}
	
	public Optional<Prenotazione> vediPrenotazione(Long idPren) {
		Optional<Prenotazione> PrenotazioneLetta = PrenotazioneRepository.findById(idPren);
		return PrenotazioneLetta;
	}
	
	public void cambiaPrenotazione(Prenotazione cambiataPrenotazione) {
		PrenotazioneRepository.save(cambiataPrenotazione);
	}
	
	
}
