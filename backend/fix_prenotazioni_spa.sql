-- ============================================================================
-- Fix: prenotazione "solo SPA" -> errore in fase di conferma/pagamento
-- ============================================================================
-- Una prenotazione "solo SPA" non ha stanza nE date di soggiorno, quindi il
-- frontend invia IDSTANZA, CHECK_IN e CHECK_OUT valorizzati a NULL.
-- Se nella tabella PRENOTAZIONI queste colonne sono NOT NULL, l'INSERT viene
-- rifiutato dal database (mentre una prenotazione con stanza funziona) e il
-- pagamento restituisce errore.
--
-- Questo script rende NULL-abili le colonne interessate. E' idempotente:
-- eseguirlo quando le colonne sono giA nullable non produce alcun effetto.
--
-- Eseguire sul database (schema "railway"):
--     mysql ... railway < fix_prenotazioni_spa.sql
-- ============================================================================

ALTER TABLE `PRENOTAZIONI` MODIFY `IDSTANZA`   int  DEFAULT NULL;
ALTER TABLE `PRENOTAZIONI` MODIFY `IDSERVIZIO` int  DEFAULT NULL;
ALTER TABLE `PRENOTAZIONI` MODIFY `CHECK_IN`   date DEFAULT NULL;
ALTER TABLE `PRENOTAZIONI` MODIFY `CHECK_OUT`  date DEFAULT NULL;
