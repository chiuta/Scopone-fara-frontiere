# Changelog — Scopone fără frontiere

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH. Istoricul versiunilor 1.x se află în secțiunea „Istoric / Changelog” din `README.ro.md`.

## 2.1.0 — 2026-11-15

- New: accessibility on every screen — the “Aa” button (text size, high contrast, no animations, readable text, underlined links, read aloud), a “Back to top” arrow and “Skip to content”; the window always fits the screen; the magnifier zoom and “fit screen” controls now sit on the left edge (fff-kit 1.6.0).

## 2.0.9 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.0.2 — 2026-11-03

Turneu și clasament Elo local (motor comun de jocuri), rezultate notate de mână

## 2.0.1 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.0.1 — 2026-10-27
Doar texte și documentație; codul de joc nu s-a schimbat.
- README: secțiunile **Stare** și **Offline**; notă despre versiune.
- Recenzia din 2026-10-27 a apreciat **sugestiile** (💡 / tasta H, existente de la v1.x) și nu a cerut funcții noi pentru această aplicație: statisticile locale și antrenorul de strategie (v2.0.0) există deja.
- „Mod multiplayer local unificat” între jocurile de cărți: **planificat**, nu implementat.
- Versiunea afișată în aplicație, `app.json`, service worker și hash-urile CSP ale scripturilor inline au fost actualizate.

## 2.0.0 — 2026-10-26
- Antrenor de strategie (verdict după fiecare mutare, revizuirea mâinii).
