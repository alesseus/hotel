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

import com.geak.hotel.Model.Servizio;
import com.geak.hotel.Services.ServiziSrv;

@RestController
@RequestMapping("/servizio/")
public class ServizioController {

    @Autowired
    private ServiziSrv serv;
    @GetMapping("elenco")
    public List<Servizio> elencoServizio() {
        return serv.getAllServizi();
    }
    @GetMapping("elenco/{IDSERVIZIO}")
    public Servizio tornaServ(@PathVariable Long IDSERVIZIO) {
        return serv.getAllServizi().stream()
                .filter(s -> s.getIDSERVIZIO() == IDSERVIZIO)
                .findFirst()
                .get();
    }
    @PostMapping("add")
    public List<Servizio> add(@RequestBody Servizio agg) {
        serv.addServizio(agg);
        return serv.getAllServizi();
    }
    @PutMapping("aggiorna")
    public List<Servizio> aggiorna(@RequestBody Servizio aggiornato) {
        serv.aggServizio(aggiornato);
        return serv.getAllServizi();
    }
    @DeleteMapping("elimina/{id}")
    public List<Servizio> elimina(@PathVariable Long id) {
        serv.delServ(id);
        return serv.getAllServizi();
    }
}