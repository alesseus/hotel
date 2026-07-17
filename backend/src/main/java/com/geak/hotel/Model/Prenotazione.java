package com.geak.hotel.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "PRENOTAZIONE")
public class Prenotazione {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDPRE;
	private String NOME;
	private String COGNOME;
	private String EMAIL;
	private String TELEFONO;
	private String DATANASCITA;
	private long IDSTANZA;
	private long IDSERVIZIO;
	private double TOTALE;
	private boolean SPA;
	private String NOTE;
	private String CHECK_IN;
	private String CHECK_OUT;
	private String STATO;

	public Prenotazione() {}

	public Prenotazione(long IDPRE, String NOME, String COGNOME, String EMAIL, String TELEFONO, String DATANASCITA,
			long IDSTANZA, long IDSERVIZIO, double TOTALE, boolean SPA, String NOTE, String CHECK_IN, String CHECK_OUT,
			String STATO) {
		setIDPRE(IDPRE);
		setNOME(COGNOME);
		setCOGNOME(COGNOME);
		setEMAIL(EMAIL);
		setTELEFONO(TELEFONO);
		setDATANASCITA(DATANASCITA);
		setIDSTANZA(IDSTANZA);
		setIDSERVIZIO(IDSERVIZIO);
		setTOTALE(TOTALE);
		setSPA(SPA);
		setNOTE(NOTE);
		setCHECK_IN(CHECK_IN);
		setCHECK_OUT(CHECK_OUT);
		setSTATO(STATO);
		
	}

	public long getIDPRE() {
		return IDPRE;
	}

	public void setIDPRE(long iDPRE) {
		IDPRE = iDPRE;
	}

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

	public String getEMAIL() {
		return EMAIL;
	}

	public void setEMAIL(String eMAIL) {
		EMAIL = eMAIL;
	}

	public String getTELEFONO() {
		return TELEFONO;
	}

	public void setTELEFONO(String tELEFONO) {
		TELEFONO = tELEFONO;
	}

	public String getDATANASCITA() {
		return DATANASCITA;
	}

	public void setDATANASCITA(String dATANASCITA) {
		DATANASCITA = dATANASCITA;
	}

	public long getIDSTANZA() {
		return IDSTANZA;
	}

	public void setIDSTANZA(long iDSTANZA) {
		IDSTANZA = iDSTANZA;
	}

	public long getIDSERVIZIO() {
		return IDSERVIZIO;
	}

	public void setIDSERVIZIO(long iDSERVIZIO) {
		IDSERVIZIO = iDSERVIZIO;
	}

	public double getTOTALE() {
		return TOTALE;
	}

	public void setTOTALE(double tOTALE) {
		TOTALE = tOTALE;
	}

	public boolean isSPA() {
		return SPA;
	}

	public void setSPA(boolean sPA) {
		SPA = sPA;
	}

	public String getNOTE() {
		return NOTE;
	}

	public void setNOTE(String nOTE) {
		NOTE = nOTE;
	}

	public String getCHECK_IN() {
		return CHECK_IN;
	}

	public void setCHECK_IN(String cHECK_IN) {
		CHECK_IN = cHECK_IN;
	}

	public String getCHECK_OUT() {
		return CHECK_OUT;
	}

	public void setCHECK_OUT(String cHECK_OUT) {
		CHECK_OUT = cHECK_OUT;
	}

	public String getSTATO() {
		return STATO;
	}

	public void setSTATO(String sTATO) {
		STATO = sTATO;
	}

}
