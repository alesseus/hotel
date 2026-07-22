export interface prenotazione {
    "IDPRE": number,
    "NOME": string,
    "COGNOME": string,
    "EMAIL": string,
    "TELEFONO": string,
    "DATANASCITA": Date,
    "IDSTANZA"?: number,
    "IDSERVIZIO"?: number,
    "TOTALE": number,
    "SPA"?: boolean,
    "NOTE": string,
    "CHECK_IN": Date,
    "CHECK_OUT": Date,
    "STATO"?: string,
    "CAPARRA": number,
    "OSPITI"?: string
}


