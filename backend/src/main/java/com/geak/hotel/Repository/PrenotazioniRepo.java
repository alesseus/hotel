package com.geak.hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.geak.hotel.Model.Prenotazione;

@Repository
public interface PrenotazioniRepo extends JpaRepository<Prenotazione, Long>{

}
