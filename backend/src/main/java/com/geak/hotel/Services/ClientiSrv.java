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
	public List<Cliente> mostraClienti() {
		return cliRepo.findAll();
	}

	public Cliente addCliente(Cliente newCliente) {
		return cliRepo.save(newCliente);
	}

	public Cliente aggCliente(Cliente updCliente) {
		return cliRepo.save(updCliente);
	}
	public void delCliente(Long id_cliente_canc) {
		cliRepo.deleteById(id_cliente_canc);
	}

}