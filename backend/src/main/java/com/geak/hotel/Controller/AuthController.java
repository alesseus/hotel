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

/**
 * Gestisce l'autenticazione.
 * Endpoint: POST /auth/login
 *
 * NOTA SICUREZZA: In produzione le password vanno salvate con BCrypt.
 * Sostituire il confronto diretto con:
 *   passwordEncoder.matches(request.getPass(), cliente.getPASS())
 * e usare Spring Security con BCryptPasswordEncoder.
 */
@RestController
@RequestMapping("/auth/")
@CrossOrigin(origins = "http://localhost:4200")   // adatta all'URL del tuo frontend
public class AuthController {

    @Autowired
    private ClientiRepo clientiRepository;

    @PostMapping("login")
    public ResponseEntity<?> login(@Validated @RequestBody LoginRequest request) {

        // 1. Cerca il cliente per email
        Optional<Cliente> optional = clientiRepository.findByMAILIgnoreCase(request.getMail());

        if (optional.isEmpty()) {
            // Non rivelare se è l'email o la password a essere sbagliata
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide");
        }

        Cliente cliente = optional.get();

        // 2. Verifica la password
        //    TODO: sostituire con BCrypt quando le password saranno hashate
        if (!cliente.getPASS().equals(request.getPass())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Credenziali non valide");
        }

        // 3. Login OK → restituisci i dati (senza password)
        LoginResponse response = new LoginResponse(
                cliente.getIDCLIENTE(),
                cliente.getMAIL(),
                cliente.isADMIN()
        );

        return ResponseEntity.ok(response);
    }
}