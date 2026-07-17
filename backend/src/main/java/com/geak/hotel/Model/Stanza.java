package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "STANZE")
public class Stanza {
	private String note;
	private String dimensione;
	private int capacità;
	private double costo;
	private String descrizione;
	private String stato;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDSTANZA;

	public Stanza(String note, String dimensione, int capacità, double costo, String descrizione, String stato,
			long IDSTANZA) {
		setNote(note);
		setDimensione(dimensione);
		setCapacità(capacità);
		setCosto(costo);
		setDescrizione(descrizione);
		setStato(stato);
		setIDSTANZA(IDSTANZA);
	}

	public Stanza() {
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public String getDimensione() {
		return dimensione;
	}

	public void setDimensione(String dimensione) {
		this.dimensione = dimensione;
	}

	public int getCapacità() {
		return capacità;
	}

	public void setCapacità(int capacità) {
		this.capacità = capacità;
	}

	public double getCosto() {
		return costo;
	}

	public void setCosto(double costo) {
		this.costo = costo;
	}

	public String getDescrizione() {
		return descrizione;
	}

	public void setDescrizione(String descrizione) {
		this.descrizione = descrizione;
	}

	public String getStato() {
		return stato;
	}

	public void setStato(String stato) {
		this.stato = stato;
	}

	public long getIDSTANZA() {
		return IDSTANZA;
	}

	public void setIDSTANZA(long iDSTANZA) {
		IDSTANZA = iDSTANZA;
	}

}
