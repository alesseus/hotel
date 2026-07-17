package com.geak.hotel.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Stanza;
import com.geak.hotel.Repository.StanzeRepo;

@Service
public class StanzeSrv {
	@Autowired
	private StanzeRepo stanzaRepo;
	
	public List<Stanza> getAllStanza(){
		return stanzaRepo.findAll();
	}
	
	public void addStanza(Stanza nuovaStanza) {
		stanzaRepo.save(nuovaStanza);
	}
	
	public Optional<Stanza> vediStanza(Long idVedi){
		Optional<Stanza> stanzaV = stanzaRepo.findById(idVedi);
		return stanzaV;
	}

}
