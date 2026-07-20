package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="SERVIZI")
public class Servizio {
	private String NOTE;
	private double COSTO;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long IDSERVIZIO;
	
	public Servizio(String NOTE,double COSTO,Long IDSERVIZIO) {
		setNOTE(NOTE);
		setCOSTO(COSTO);
		setIDSERVIZIO(IDSERVIZIO);
	}
	
	public Servizio() {
		
	}

	public String getNOTE() {
		return NOTE;
	}

	public void setNOTE(String NOTE) {
		this.NOTE = NOTE;
	}

	public double getCOSTO() {
		return COSTO;
	}

	public void setCOSTO(double COSTO) {
		this.COSTO = COSTO;
	}

	public Long getIDSERVIZIO() {
		return IDSERVIZIO;
	}

	public void setIDSERVIZIO(Long iDSERVIZIO) {
		IDSERVIZIO = iDSERVIZIO;
	}
	
	
}
