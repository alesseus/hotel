package com.geak.hotel.Dto;

public class LoginRequest {
	private String EMAIL;
    private String PASS;
    private boolean ADMIN;
    public String getCodice() { return EMAIL; }
    public void setCodice(String EMAIL) { this.EMAIL = EMAIL; }
    public String getPassword() { return PASS; }
    public void setPassword(String PASS) { this.PASS = PASS; }
    public boolean getAdmin() { return ADMIN; }
    public void setAdmin(boolean ADMIN) {this.ADMIN = ADMIN; }
}
