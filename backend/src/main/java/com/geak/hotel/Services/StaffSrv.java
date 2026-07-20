package com.geak.hotel.Services;
import java.util.List;
import com.geak.hotel.Repository.StaffRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.geak.hotel.Dto.LoginResponse;
import com.geak.hotel.Model.Staff;

@Service
public class StaffSrv {
	@Autowired
	private StaffRepo stfrepo;

	// funzione che fa select dello staff
	
		public List<Staff> mostraStaff() {
			return stfrepo.findAll();
		}

		// aggiungi uno allo staff

		public Staff addStaff(Staff newStaff) {
			return stfrepo.save(newStaff);
		}

		// aggiorna uno delll staff

		public Staff aggStaff(Staff updStaff) {
			return stfrepo.save(updStaff);
		}

		// cancella uno dello staff
		public void delStaff(Long id_staff_canc) {
			stfrepo.deleteById(id_staff_canc);
		}
		
		public LoginResponse loginManuale(String codice, String password) {
		    Staff staff = stfrepo.findbyCODICE(codice)
		        .orElseThrow(() -> new RuntimeException("Codice staff non trovato"));

		    if (staff.getPASS().equals(password)) {
		        String tokenFinto = "TOKEN-" + staff.getIDSTAFF();
		        return new LoginResponse(tokenFinto, staff.getCODICE()); 
		    }
		    throw new RuntimeException("Password errata");
		}
		
		
}