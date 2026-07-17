package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="SERVIZI")
public class Servizio {
	private String note;
	private double costo;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDSERVIZIO;
	
	public Servizio(String note,double costo,long IDSERVIZIO) {
		setNote(note);
		setCosto(costo);
		setIDSERVIZIO(IDSERVIZIO);
	}
	
	public Servizio() {
		
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public double getCosto() {
		return costo;
	}

	public void setCosto(double costo) {
		this.costo = costo;
	}

	public long getIDSERVIZIO() {
		return IDSERVIZIO;
	}

	public void setIDSERVIZIO(long iDSERVIZIO) {
		IDSERVIZIO = iDSERVIZIO;
	}
	
	
}
