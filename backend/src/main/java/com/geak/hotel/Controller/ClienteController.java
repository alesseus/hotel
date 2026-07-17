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
import com.geak.hotel.Services.ClientiSrv;
import com.geak.hotel.Model.Cliente;

@RestController
@RequestMapping("/cliente/")
public class ClienteController {

	@Autowired
	ClientiSrv dipendenzacli;

	@GetMapping("lista")
	public List<Cliente> listaClienti() {
		return dipendenzacli.mostraClienti();
	}

	@PostMapping("aggiungi")
	public Cliente addCliente(@RequestBody Cliente nuovoCli) {
		return dipendenzacli.addCliente(nuovoCli);
	}

	@RequestMapping(value = "aggiorna", method = RequestMethod.PUT)
	public Cliente aggCliente(@RequestBody Cliente cliaggiornato) {
		return dipendenzacli.aggCliente(cliaggiornato);
	}

	@RequestMapping(value = "cancella/{idDaCancellare}", method = RequestMethod.DELETE)
	public void cancella(@PathVariable Long idclientecanc) {
		dipendenzacli.delCliente(idclientecanc);
	}

}