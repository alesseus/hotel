package com.geak.hotel.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Prenotazione;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void inviaConfermaPrenotazione(Prenotazione p) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("nouseacc98@gmail.com");
            msg.setTo(p.getEMAIL());
            msg.setSubject("Conferma prenotazione");
            msg.setText(
                "Grazie per aver prenotato!\n\n" +
                "Riepilogo prenotazione:\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n" +
                "Intestatario: " + p.getNOME() + " " + p.getCOGNOME() + "\n" +
                "Email:        " + p.getEMAIL() + "\n" +
                "Check-in:     " + p.getCHECK_IN() + "\n" +
                "Check-out:    " + p.getCHECK_OUT() + "\n" +
                "Totale:       €" + p.getTOTALE() + "\n" +
                "Caparra:      €" + p.getCAPARRA() + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Per qualsiasi necessità contattaci.\n\n" +
                "A presto!"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            System.err.println("Errore invio mail: " + e.getMessage());
        }
    }
}