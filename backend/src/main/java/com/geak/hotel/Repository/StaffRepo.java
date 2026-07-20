package com.geak.hotel.Repository;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.geak.hotel.Model.Staff;

public interface StaffRepo extends JpaRepository<Staff, Long>{
	Optional<Staff> findbyCODICE(String CODICE);
}
