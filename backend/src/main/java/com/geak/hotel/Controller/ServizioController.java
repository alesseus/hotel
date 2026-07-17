package com.geak.hotel.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.geak.hotel.Model.Servizio;
import com.geak.hotel.Services.ServiziSrv;

@RestController
@RequestMapping("/servizio/")
public class ServizioController {
	@Autowired
	private ServiziSrv serv;
	
	@GetMapping("elenco")
	public List<Servizio> elencoServizio(){
		return serv.getAllServizi();
	}
	
	@GetMapping("elenco/{IDSERVIZIO}")
	public Servizio tornaServ(@PathVariable Long IDSERVIZIO) {
		List<Servizio> sv = serv.getAllServizi();
		return sv.stream().filter(
				servLetto -> servLetto.getIDSERVIZIO() == IDSERVIZIO).findFirst().get();
	}
	
	// Aggiungo servizio
	@PostMapping("aggiungi")
	public ServiziSrv add(Servizio agg) {
		serv.addServizio(agg);
		return serv;
	}
	
	@RequestMapping(value = "cancella/{IDSERVIZIO}", method = RequestMethod.DELETE)
	public void cancella(@PathVariable Long idServCanc) {
		serv.delServ(idServCanc);
	}

}
