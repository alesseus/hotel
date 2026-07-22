package com.geak.hotel.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Stanza;
import com.geak.hotel.Repository.StanzeRepo;

@Service
public class StanzeSrv {
	@Autowired
	private StanzeRepo stanzaRepo;
	
	// lista stanze
	public List<Stanza> getAllStanza(){
		return stanzaRepo.findAll();
	}
	
	// aggiungi stanza
	public void addStanza(Stanza nuovaStanza) {
		stanzaRepo.save(nuovaStanza);
	}

	// aggiorna stanza (save fa update se IDSTANZA esiste già)
	public void aggStanza(Stanza stanzaAggiornata) {
		stanzaRepo.save(stanzaAggiornata);
	}

	// elimina stanza
	public void delStanza(Long id) {
		stanzaRepo.deleteById(id);
	}

}