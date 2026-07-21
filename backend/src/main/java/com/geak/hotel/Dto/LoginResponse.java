package com.geak.hotel.Dto;

public class LoginResponse {
    private String token;
    private String codiceRuolo;
    private boolean admin;

    public LoginResponse(String token, String codiceRuolo, boolean admin) {
        this.token = token;
        this.codiceRuolo = codiceRuolo;
        this.admin = admin;
    }

    public String getToken() { return token; }
    public String getCodiceRuolo() { return codiceRuolo; }
    public boolean isAdmin() { return admin; }
}