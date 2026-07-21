package com.geak.hotel.Services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.geak.hotel.Model.Prenotazione;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

@Service
public class EmailService {

    @Value("${resend.api.key}")
    private String apiKey;

    public void inviaConfermaPrenotazione(Prenotazione p) {
        try {
            OkHttpClient client = new OkHttpClient();

            String corpo = "<h2>Grazie per aver prenotato!</h2>"
                + "<p>Ecco il riepilogo della tua prenotazione:</p>"
                + "<table style='border-collapse:collapse;width:100%;font-family:sans-serif'>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee'><b>Intestatario</b></td><td style='padding:8px;border-bottom:1px solid #eee'>" + p.getNOME() + " " + p.getCOGNOME() + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee'><b>Email</b></td><td style='padding:8px;border-bottom:1px solid #eee'>" + p.getEMAIL() + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee'><b>Check-in</b></td><td style='padding:8px;border-bottom:1px solid #eee'>" + p.getCHECK_IN() + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee'><b>Check-out</b></td><td style='padding:8px;border-bottom:1px solid #eee'>" + p.getCHECK_OUT() + "</td></tr>"
                + "<tr><td style='padding:8px;border-bottom:1px solid #eee'><b>Totale</b></td><td style='padding:8px;border-bottom:1px solid #eee'>€" + p.getTOTALE() + "</td></tr>"
                + "<tr><td style='padding:8px'><b>Caparra</b></td><td style='padding:8px'>€" + p.getCAPARRA() + "</td></tr>"
                + "</table>"
                + "<p style='color:#888;font-size:0.85rem'>Per qualsiasi necessità rispondi a questa mail.</p>"
                + "<p>A presto!</p>";

            String json = "{\"from\":\"onboarding@resend.dev\","
                + "\"to\":\"" + p.getEMAIL() + "\","
                + "\"subject\":\"Conferma prenotazione\","
                + "\"html\":\"" + corpo.replace("\"", "\\\"") + "\"}";

            RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

            Request request = new Request.Builder()
                .url("https://api.resend.com/emails")
                .post(body)
                .addHeader("Authorization", "Bearer " + apiKey)
                .addHeader("Content-Type", "application/json")
                .build();

            try (Response response = client.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    System.err.println("Errore invio mail: " + response.body().string());
                }
            }

        } catch (Exception e) {
            System.err.println("Eccezione invio mail: " + e.getMessage());
        }
    }
}