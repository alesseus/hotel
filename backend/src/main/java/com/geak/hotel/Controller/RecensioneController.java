package com.geak.hotel.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.geak.hotel.Model.Recensione;
import com.geak.hotel.Services.RecensioniSrv;

@RestController
@RequestMapping("/recensione/")
public class RecensioneController {
	
	@Autowired
	RecensioniSrv RecensioneDependency;
	
	@GetMapping("lista")
	public List<Recensione> veditutte(){
		return RecensioneDependency.getAllRecensioni();
	}
	
	@GetMapping("singolo/{IDRECE}")
	public Recensione vedisingola(@PathVariable long IDRECE) {
		Recensione r = RecensioneDependency.vediRecensione(IDRECE).get();
		return r;
	}
	
	@RequestMapping(value = "cancella/{IDRECEdel}", method = RequestMethod.DELETE)
	public RecensioniSrv cancella(@PathVariable long IDRECEdel) {
		RecensioneDependency.cancellaRecensione(IDRECEdel);
		return RecensioneDependency;
	}
	
	@PostMapping("add")
	public RecensioniSrv add(@RequestBody Recensione nuova) {
	    RecensioneDependency.addRecensione(nuova);
	    return RecensioneDependency;
	}
	
	@RequestMapping(value = "cambia")
	public RecensioniSrv cambia(@RequestBody Recensione cambiata) {
		RecensioneDependency.cambiaRecensione(cambiata);
		return RecensioneDependency;
	}






}
