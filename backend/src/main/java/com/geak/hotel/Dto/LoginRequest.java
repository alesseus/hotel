package com.geak.hotel.Dto;

public class LoginRequest {
    private String email;
    private String password;

    public String getCodice() { return email; }
    public void setCodice(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}