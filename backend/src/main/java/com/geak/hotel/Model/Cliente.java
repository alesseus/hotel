package com.geak.hotel.Model;
import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="CLIENTI")
public class Cliente {
	private String NOME;
	private String COGNOME;
	private String MAIL;
	private String PASS;
	private String TELEFONO;
	private LocalDate DATANASCITA;
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long IDCLIENTE;
	
	public Cliente () {}

	

	public String getNOME() {
		return NOME;
	}



	public void setNOME(String nOME) {
		NOME = nOME;
	}



	public String getCOGNOME() {
		return COGNOME;
	}



	public void setCOGNOME(String cOGNOME) {
		COGNOME = cOGNOME;
	}



	public String getMAIL() {
		return MAIL;
	}



	public void setMAIL(String mAIL) {
		MAIL = mAIL;
	}



	public String getPASS() {
		return PASS;
	}



	public void setPASS(String pASS) {
		PASS = pASS;
	}



	public String getTELEFONO() {
		return TELEFONO;
	}



	public void setTELEFONO(String tELEFONO) {
		TELEFONO = tELEFONO;
	}



	public LocalDate getDATANASCITA() {
		return DATANASCITA;
	}



	public void setDATANASCITA(LocalDate dATANASCITA) {
		DATANASCITA = dATANASCITA;
	}



	public long getIDCLIENTE() {
		return IDCLIENTE;
	}

	public void setIDCLIENTE(long iDCLIENTE) {
		IDCLIENTE = iDCLIENTE;
	}
}