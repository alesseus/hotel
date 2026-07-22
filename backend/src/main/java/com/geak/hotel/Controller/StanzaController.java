package com.geak.hotel.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.geak.hotel.Model.Stanza;
import com.geak.hotel.Services.StanzeSrv;

@RestController
@RequestMapping("/stanza/")
public class StanzaController {
	
	@Autowired 
	 private StanzeSrv camera;
	
	@GetMapping("elenco")
	public List<Stanza> elencoStanze(){
		return camera.getAllStanza();
	}
	
	@GetMapping("elenco/{IDSTANZA}")
	public Stanza tornaStanza(@PathVariable Long IDSTANZA) {
		List<Stanza> tutte = camera.getAllStanza();
		return tutte.stream().filter(
				stanzaLetto -> stanzaLetto.getIDSTANZA() == IDSTANZA).findFirst().get();
	}
	@PostMapping("add")
	public List<Stanza> inserisci(@RequestBody Stanza nuova){
		camera.addStanza(nuova);
		return camera.getAllStanza();
	}
	@PutMapping("aggiorna")
	public List<Stanza> aggiorna(@RequestBody Stanza stanzaAggiornata){
		camera.aggStanza(stanzaAggiornata);
		return camera.getAllStanza();
	}
	@DeleteMapping("elimina/{IDSTANZA}")
	public List<Stanza> elimina(@PathVariable Long IDSTANZA){
		camera.delStanza(IDSTANZA);
		return camera.getAllStanza();
	}

}