package com.geak.hotel.Controller;

import com.geak.hotel.Dto.LoginRequest;
import com.geak.hotel.Dto.LoginResponse;
import com.geak.hotel.Model.Cliente;
import com.geak.hotel.Repository.ClientiRepo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth/")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {

    @Autowired
    private ClientiRepo clientiRepository;

    @PostMapping("login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest request) {

        Optional<Cliente> optional = clientiRepository.findByMAILIgnoreCase(request.getCodice());

        if (optional.isEmpty()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide");
        }

        Cliente cliente = optional.get();

        if (!cliente.getPASS().equals(request.getPassword())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide");
        }

        LoginResponse response = new LoginResponse(
                String.valueOf(cliente.getIDCLIENTE()),
                cliente.getMAIL(),
                cliente.getADMIN()
        );

        return ResponseEntity.ok(response);
    }
}