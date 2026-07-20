package com.geak.hotel.Model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="STAFF")
public class Staff {
	private String CODICE;
	private String PASS;
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDSTAFF;
	
	public Staff () {}

	public String getCODICE() {
		return CODICE;
	}

	public void setCODICE(String cODICE) {
		CODICE = cODICE;
	}

	public String getPASS() {
		return PASS;
	}

	public void setPASS(String pASS) {
		PASS = pASS;
	}

	public long getIDSTAFF() {
		return IDSTAFF;
	}

	public void setIDSTAFF(long iDSTAFF) {
		IDSTAFF = iDSTAFF;
	}	
}