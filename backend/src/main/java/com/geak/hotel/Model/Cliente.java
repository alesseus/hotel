package com.geak.hotel.Model;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name="clienti")
public class Cliente {
	private String nome;
	private String cognome;
	private String email;
	private String password;
	private String telefono;
	private String data_nascita;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long IDCLIENTE;
	
	public Cliente () {}

	public String getNome() {
		return nome;
	}

	public void setNome(String nome) {
		this.nome = nome;
	}

	public String getCognome() {
		return cognome;
	}

	public void setCognome(String cognome) {
		this.cognome = cognome;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getTelefono() {
		return telefono;
	}

	public void setTelefono(String telefono) {
		this.telefono = telefono;
	}

	public String getData_nascita() {
		return data_nascita;
	}

	public void setData_nascita(String data_nascita) {
		this.data_nascita = data_nascita;
	}

	public long getIDCLIENTE() {
		return IDCLIENTE;
	}

	public void setIDCLIENTE(long iDCLIENTE) {
		IDCLIENTE = iDCLIENTE;
	}
}