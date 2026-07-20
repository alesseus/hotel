package com.geak.hotel.Dto;

public class LoginRequest {
	private String codice;
    private String password;
    public String getCodice() { return codice; }
    public void setCodice(String codice) { this.codice = codice; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
