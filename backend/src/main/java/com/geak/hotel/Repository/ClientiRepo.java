package com.geak.hotel.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.geak.hotel.Model.Cliente;

public interface ClientiRepo extends JpaRepository<Cliente, Long> {}