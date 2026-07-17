package com.geak.hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.geak.hotel.Model.Stanza;

@Repository
public interface StanzeRepo extends JpaRepository<Stanza, Long>{
}

