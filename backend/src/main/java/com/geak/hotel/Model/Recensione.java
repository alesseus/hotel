package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="RECENSIONI")
public class Recensione {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDRECE;
	private String DESCRIZIONE;
	private int RATING;
	private int IDCLIENTE;
	
	public long getIDRECE() {
		return IDRECE;
	}
	public void setIDRECE(long iDRECE) {
		IDRECE = iDRECE;
	}
	public String getDESCRIZIONE() {
		return DESCRIZIONE;
	}
	public void setDESCRIZIONE(String dESCRIZIONE) {
		DESCRIZIONE = dESCRIZIONE;
	}
	public int getRATING() {
		return RATING;
	}
	public void setRATING(int rATING) {
		RATING = rATING;
	}
	public int getIDCLIENTE() {
		return IDCLIENTE;
	}
	public void setIDCLIENTE(int iDCLIENTE) {
		IDCLIENTE = iDCLIENTE;
	}
	
	

}
