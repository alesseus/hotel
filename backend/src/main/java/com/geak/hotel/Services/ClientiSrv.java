package com.geak.hotel.Services;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.geak.hotel.Model.Cliente;
import com.geak.hotel.Repository.ClientiRepo;

@Service
public class ClientiSrv {
	@Autowired
	private ClientiRepo cliRepo;

	// funzione che fa select clienti
	public List<Cliente> mostraClienti() {
		return cliRepo.findAll();
	}

	// aggiungi cliente

	public Cliente addCliente(Cliente newCliente) {
		return cliRepo.save(newCliente);
	}

	// aggiorna cliente

	public Cliente aggCliente(Cliente updCliente) {
		return cliRepo.save(updCliente);
	}

	// cancella il cliente
	public void delCliente(Long id_cliente_canc) {
		cliRepo.deleteById(id_cliente_canc);
	}

}