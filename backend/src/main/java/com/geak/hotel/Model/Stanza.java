package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "STANZE")
public class Stanza {
	private String NOTE;
	private String DIMENSIONE;
	private int CAPACITA;
	private double COSTO;
	private String DESCRIZIONE;
	private String STATO;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDSTANZA;

	public Stanza(String NOTE, String DIMENSIONE, int CAPACITA, double COSTO, String DESCRIZIONE, String STATO,
			long IDSTANZA) {
		setNOTE(NOTE);
		setDIMENSIONE(DIMENSIONE);
		setCAPACITA(CAPACITA);
		setCOSTO(COSTO);
		setDESCRIZIONE(DESCRIZIONE);
		setSTATO(STATO);
		setIDSTANZA(IDSTANZA);
	}

	public Stanza() {
	}

	public String getNOTE() {
		return NOTE;
	}

	public void setNOTE(String NOTE) {
		this.NOTE = NOTE;
	}

	public String getDIMENSIONE() {
		return DIMENSIONE;
	}

	public void setDIMENSIONE(String DIMENSIONE) {
		this.DIMENSIONE = DIMENSIONE;
	}

	public int getCAPACITA() {
		return CAPACITA;
	}

	public void setCAPACITA(int CAPACITA) {
		this.CAPACITA = CAPACITA;
	}

	public double getCOSTO() {
		return COSTO;
	}

	public void setCOSTO(double COSTO) {
		this.COSTO = COSTO;
	}

	public String getDESCRIZIONE() {
		return DESCRIZIONE;
	}

	public void setDESCRIZIONE(String DESCRIZIONE) {
		this.DESCRIZIONE = DESCRIZIONE;
	}

	public String getSTATO() {
		return STATO;
	}

	public void setSTATO(String STATO) {
		this.STATO = STATO;
	}

	public long getIDSTANZA() {
		return IDSTANZA;
	}

	public void setIDSTANZA(long iDSTANZA) {
		IDSTANZA = iDSTANZA;
	}

}
