export interface prenotazione {
    "IDPRE": number,
    "NOME": string,
    "COGNOME": string,
    "EMAIL": string,
    "TELEFONO": string,
    "DATANASCITA": Date | null,
    "IDSTANZA": number | null,
    "IDSERVIZIO": number | null,
    "TOTALE": number,
    "SPA": boolean,
    "NOTE": string,
    "CHECK_IN": Date | null,
    "CHECK_OUT": Date | null,
    "STATO": string,
    "CAPARRA": number,
    "OSPITI": string
}


