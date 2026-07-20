package com.geak.hotel.Dto;

public class LoginResponse {
	private String token;
    private String codiceRuolo;
    public LoginResponse(String token, String codiceRuolo) {
        this.token = token;
        this.codiceRuolo = codiceRuolo;
    }
    public String getToken() { return token; }
    public String getCodiceRuolo() { return codiceRuolo; }
}
