package com.geak.hotel.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Servizio;
import com.geak.hotel.Repository.ServiziRepo;

@Service
public class ServiziSrv {
	@Autowired
	private ServiziRepo servRepo;
	public List<Servizio> getAllServizi(){
		return servRepo.findAll();
	}
	public void addServizio(Servizio nuovoServ) {
		servRepo.save(nuovoServ);
	}
	public void aggServizio(Servizio aggServ) {
		servRepo.save(aggServ);
	}
	public void delServ(Long IdCanc) {
		servRepo.deleteById(IdCanc);
	}

}
