package com.geak.hotel.Controller;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.geak.hotel.Dto.LoginRequest;
import com.geak.hotel.Dto.LoginResponse;
import com.geak.hotel.Dto.RegisterRequest;
import com.geak.hotel.Model.Cliente;
import com.geak.hotel.Repository.ClientiRepo;

@RestController
@RequestMapping("/auth/")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private ClientiRepo clientiRepository;

    @PostMapping("login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest request) {
        Optional<Cliente> optional = clientiRepository.findByMAILIgnoreCase(request.getEmail());

        if (optional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenziali non valide");
        }

        Cliente cliente = optional.get();

        if (!cliente.getPASS().equals(request.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenziali non valide");
        }

        LoginResponse response = new LoginResponse(
                String.valueOf(cliente.getIDCLIENTE()),
                cliente.getMAIL(),
                cliente.getADMIN());

        return ResponseEntity.ok(response);
    }

    @PostMapping("register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (clientiRepository.findByMAILIgnoreCase(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email già registrata");
        }

        Cliente cliente = new Cliente();
        cliente.setNOME(request.getNome());
        cliente.setCOGNOME(request.getCognome());
        cliente.setMAIL(request.getEmail());
        cliente.setPASS(request.getPasswordHash());
        cliente.setTELEFONO(request.getTelefono());
        cliente.setDATANASCITA(LocalDate.parse(request.getDataNascita()));
        cliente.setADMIN(false);

        clientiRepository.save(cliente);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Registrazione completata"));
    }
}