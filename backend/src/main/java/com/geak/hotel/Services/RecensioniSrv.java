package com.geak.hotel.Services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Recensione;
import com.geak.hotel.Repository.RecensioniRepo;

@Service
public class RecensioniSrv {

	@Autowired
	private RecensioniRepo RecensioniRepository;
	
	public List<Recensione> getAllRecensioni(){
		return RecensioniRepository.findAll();
	}
	
	public void addRecensione(Recensione nuovaRecensione) {
		RecensioniRepository.save(nuovaRecensione);
	}
	
	public void cambiaRecensione(Recensione cambiataRecensione) {
		RecensioniRepository.save(cambiataRecensione);
	}
	
	public void cancellaRecensione(Long idRec) {
		RecensioniRepository.deleteById(idRec);
	}
	
	public Optional<Recensione> vediRecensione(Long idRecensione){
		Optional<Recensione> RecensioneLetta = RecensioniRepository.findById(idRecensione);
		return RecensioneLetta;
	}
	
}
