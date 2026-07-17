package com.geak.hotel.Controller;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.geak.hotel.Model.Staff;
import com.geak.hotel.Services.StaffSrv;

@RestController
@RequestMapping("/staff/")
public class StaffController {
	@Autowired
	StaffSrv dipendenzastf;

	@GetMapping("lista")
	@ResponseBody
	public List<Staff> listaClienti() {
		return dipendenzastf.mostraStaff();
	}

	@PostMapping("aggiungi")
	public Staff addStaff(@RequestBody Staff nuovostf) {
		return dipendenzastf.addStaff(nuovostf);
	}

	@RequestMapping(value = "aggiorna", method = RequestMethod.PUT)
	public Staff aggStaff(@RequestBody Staff stfaggiornato) {
		return dipendenzastf.aggStaff(stfaggiornato);
	}

	@RequestMapping(value = "cancella/{idDaCancellare}", method = RequestMethod.DELETE)
	public void delStaff(@PathVariable Long idstaffcanc) {
		dipendenzastf.delStaff(idstaffcanc);
	}
}
