# Blue Horizon - Branding files

Contenuto aggiunto in branch `add/blue-horizon-branding`:

- `assets/branding/blue-horizon-wordmark.svg` — Wordmark (SVG, sfondo bianco, logo blu)
- `assets/branding/blue-horizon-emblem.svg` — Emblema circolare (SVG)

Nota importante
- Ho aggiunto gli SVG vettoriali. Non ho rasterizzato i PNG in questo commit perché il rendering PNG richiede un tool di conversione (Inkscape, rsvg-convert, ImageMagick, ecc.).

Comandi consigliati per generare PNG localmente (Inkscape):

```bash
# Wordmark large (1600x400)
inkscape assets/branding/blue-horizon-wordmark.svg --export-type=png --export-filename=assets/branding/blue-horizon-wordmark-1600x400.png --export-width=1600

# Emblem PNG (512x512)
inkscape assets/branding/blue-horizon-emblem.svg --export-type=png --export-filename=assets/branding/blue-horizon-emblem-512x512.png --export-width=512
```

Palette colore
- Primary blue: `#0B63B8`
- Darker blue: `#084E8C`
- Light blue: `#6FB3E6`
- Bianco: `#FFFFFF`

Se vuoi che generi anche i PNG nel repository, posso farlo in un commit successivo usando i tool esterni o convertendoli qui se mi autorizzi a includere file PNG codificati (base64).