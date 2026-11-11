# Libreria Carte

![versione](https://img.shields.io/badge/versione-2.5.1-1d3a6b) ![tipo](https://img.shields.io/badge/app-PWA-7aa2ff) ![piattaforme](https://img.shields.io/badge/Android%20%7C%20PC-installabile-4f5b73)

App personale per gestire una collezione di carte **Magic: The Gathering** organizzata in scatole: sai sempre **se possiedi una carta, in quale stampa e in quale scatola si trova**, prepari i mazzi spuntando le carte man mano che le prendi e stampi le etichette per le scatole.

Funziona nel browser e si installa come app su Android e su PC. I dati restano sul dispositivo e si sincronizzano in automatico tra i dispositivi tramite il cloud.

---

## Indice

- [Funzioni](#funzioni)
- [Installazione](#installazione)
- [Primi passi](#primi-passi)
- [Sincronizzazione e backup](#sincronizzazione-e-backup)
- [Struttura del progetto](#struttura-del-progetto)
- [Aggiornare l'app](#aggiornare-lapp)
- [Risoluzione dei problemi](#risoluzione-dei-problemi)
- [Limiti noti](#limiti-noti)
- [Cronologia delle versioni](#cronologia-delle-versioni)
- [Crediti e avvertenze](#crediti-e-avvertenze)

---

## Funzioni

### Home
- Totale delle carte, stampe diverse, espansioni, scatole e carte senza posizione.
- Indicatore dello **spazio di archivio** usato sul dispositivo.
- Una **tessera per ogni scatola**, con numero, quantità e barra di riempimento: toccandola si apre la Collezione già filtrata su quella scatola.
- Accesso rapido alle **Etichette**, con il numero di scatole da stampare.

### Prelievo mazzo
- Incolli una lista nel formato delle app di mazzi, per esempio `4 Lightning Bolt` oppure `1 Thor, God of Thunder (MSH) 45`.
- Per ogni carta vedi se la possiedi e in quale scatola si trova. Le righe sono ordinate per posizione, così fai un solo giro.
- Se la lista indica **edizione e numero**, viene cercata quella stampa precisa; se non la possiedi, vedi le altre edizioni disponibili.
- Spunta **presa / da prendere**, con la riga che si colora.
- I nomi scritti in modo impreciso vengono riconosciuti tramite Scryfall.

### Collezione
- Una sola barra compatta: ricerca per nome, numero di collezione, **Filtri**, **Aggiungi**, **Altre azioni**.
- Filtri per espansione, categoria e posizione, raggruppamento per espansione, categoria o posizione.
- Vista **a griglia** con le immagini e la targhetta della scatola, oppure **a elenco** per correggere le posizioni a mano.
- **Selezione multipla**: selezioni decine o centinaia di carte e assegni la stessa scatola in un colpo solo.
- **Anteprima 3D** della carta: si gira entrando e si inclina seguendo il dito; le copie foil hanno un riflesso iridescente.
- Importazione del CSV di UrzaGatherer, esportazione e importazione di backup in JSON.

### Ricerca
- Una riga per ogni stampa posseduta, con espansione, numero, quantità e posizione.
- Campi per restringere per set e numero di collezione.

### Etichette per le scatole
- **Loghi 1 × 1 cm**: un simbolo per ogni espansione presente in una scatola, da attaccare fuori.
- **Separatori 4 × 0,9 cm**: simbolo e nome completo, uno per espansione dentro la scatola.
- L'app ricorda cosa hai già stampato e propone solo le scatole **nuove o cambiate**.
- Stampa su A4 adesivo o salvataggio in PDF, con guide di taglio.

### Cloud
- **Sincronizzazione automatica** tra i dispositivi: ogni carta è sincronizzata singolarmente, vince la modifica più recente.
- **Backup automatico giornaliero** nel cloud, con gli ultimi 7 giorni sempre disponibili per il ripristino.

### Aspetto e comodità
- Tema **chiaro, scuro o automatico**.
- Simboli delle espansioni (Keyrune) e icone dei tipi di carta (Mana).
- Sfondi decorativi diversi per ogni pagina, colorati con il tema.
- **Swipe** orizzontale per passare da una scheda all'altra.
- **Tasto indietro** del telefono: chiude anteprime e pannelli, poi torna alla scheda precedente.
- Funzionamento **offline** e pulsante **Installa** dove il browser lo consente.
- Numero di versione sempre visibile accanto al titolo.

---

## Installazione

L'app è pubblicata con **GitHub Pages**.

1. Apri l'indirizzo dell'app nel browser: `https://TUOUTENTE.github.io/libreria-carte/`.
2. Installala:
   - **Android (Chrome)**: menu ⋮ → *Installa app* oppure il pulsante **Installa** in alto.
   - **PC (Chrome / Edge)**: icona di installazione nella barra degli indirizzi oppure il pulsante **Installa**.
3. Dopo l'installazione l'app si apre a schermo intero, con la sua icona, e funziona anche senza connessione.

> Le immagini delle carte e i dati di Scryfall richiedono internet: offline si vedono solo quelli già scaricati.

---

## Primi passi

### Importare la collezione
In **Collezione → Altre azioni → Importa** carica l'esportazione **CSV** di UrzaGatherer. Le colonne usate sono:

| Colonna | Uso |
|---|---|
| `Scryfall ID` | identifica la stampa esatta |
| `Name (English)` / `Name` | nome della carta |
| `Count` | quantità |
| `Foil count`, `Special foil count` | copie foil |
| `Set code`, `Set` | codice e nome dell'espansione |
| `Number` | numero di collezione |
| `Type` | categoria (creatura, terra, istantaneo…) |

Le facce posteriori delle carte doppie vengono unite automaticamente alla faccia frontale. Reimportare il file aggiorna le quantità e **conserva le posizioni** già assegnate.

### Assegnare le posizioni
- **Una carta alla volta**: in vista elenco, scrivi la scatola nel campo della posizione.
- **Molte carte insieme**: filtra (per esempio un'espansione), *Seleziona tutte le filtrate*, scrivi la scatola nella barra in basso e premi *Assegna*.
- **Aggiungendo carte**: nel pannello *Aggiungi* la posizione resta compilata finché non passi alla scatola successiva.

---

## Sincronizzazione e backup

La sincronizzazione usa **Firebase Realtime Database** con accesso tramite **email e password**.

### Configurazione di Firebase (una volta sola)
1. Crea un progetto su [console.firebase.google.com](https://console.firebase.google.com).
2. **Realtime Database** → crea il database (regione Europa, modalità bloccata) e pubblica queste regole:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

3. **Authentication** → abilita *Email/Password* e crea il tuo utente.
4. **Impostazioni progetto → Le tue app → Web**: copia il blocco `firebaseConfig` e inseriscilo in `cloud.js` (costante `FBCFG`).

La configurazione web di Firebase non è un segreto: i dati sono protetti dalle regole e dal login. Ogni utente può leggere e scrivere solo i propri dati.

### Uso
- Nella scheda **Cloud** inserisci email e password e premi *Accedi e sincronizza*: le volte successive l'app si ricollega da sola.
- Al primo collegamento di un dispositivo che ha già dati diversi, l'app chiede quale versione tenere.
- **Backup**: una copia al giorno, al primo collegamento della giornata. Si tengono gli ultimi 7 giorni; *Ripristina* riporta la collezione a quella data su tutti i dispositivi. *Fai un backup adesso* è utile prima di operazioni grosse.

### Dove stanno i dati
| Dove | Cosa |
|---|---|
| Dispositivo (IndexedDB) | copia completa della collezione, salvata in background |
| Cloud: `users/<uid>/cards` | una riga per stampa, sincronizzata in tempo reale |
| Cloud: `users/<uid>/bk`, `bkidx` | backup giornalieri e relativo indice |
| Dispositivo (localStorage) | preferenze (tema, vista), stato delle etichette stampate, vecchia copia di riserva |

---

## Struttura del progetto

| File | Contenuto |
|---|---|
| `index.html` | struttura delle pagine |
| `style.css` | grafica, temi chiaro/scuro, animazioni, stampa delle etichette |
| `app.js` | nucleo: dati, archivio IndexedDB, navigazione, swipe, Scryfall |
| `home.js` | Home, statistiche, scatole, indicatore dello spazio |
| `prelievo.js` | lettura delle liste mazzo e stato presa / da prendere |
| `collezione.js` | Collezione, filtri, selezione multipla, importazione, anteprima 3D, pannelli |
| `ricerca.js` | ricerca per stampa |
| `etichette.js` | loghi e separatori per le scatole |
| `cloud.js` | sincronizzazione Firebase e backup |
| `ui.js` | tema, installazione, avvio |
| `sw.js` | copia offline (service worker) |
| `manifest.webmanifest` | dati per l'installazione come app |
| `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `libreria.ico` | icone |
| `bg-vetrata.png`, `bg-mana.png`, `bg-simbolo.png` | sfondi decorativi |

Il codice è JavaScript senza framework né passaggi di compilazione: i file si caricano così come sono.

---

## Aggiornare l'app

1. Carica su GitHub solo i file modificati, sostituendo quelli esistenti.
2. Attendi che il lavoro di pubblicazione in **Actions** sia completato (spunta verde).
3. Apri l'app: online scarica sempre la versione più recente. Controlla il numero accanto al titolo.

Se cambiano le **icone**, su Android e su PC serve disinstallare e reinstallare l'app; su Windows a volte anche un riavvio.

---

## Risoluzione dei problemi

| Problema | Soluzione |
|---|---|
| L'app resta ferma sul logo | apri l'indirizzo con `?reset=1`: cancella solo i dati di questa app sul dispositivo, che poi tornano dal cloud |
| Vuoi avviarla senza collegarti al cloud | apri l'indirizzo con `?safe=1` |
| Si vede ancora una versione vecchia | scheda **Cloud → Aggiorna l'app** oppure ricarica forzata (`Ctrl + Maiusc + R` su PC) |
| Compare una striscia rossa in basso | è il messaggio di errore: copialo per capire la causa |
| L'accesso non va a buon fine | controlla email e password in Firebase → Authentication e che le regole siano pubblicate |

---

## Limiti noti

- Le espansioni molto recenti possono non avere ancora il simbolo in Keyrune: nelle etichette al suo posto viene stampato il codice del set.
- Le etichette vanno stampate **al 100%**, senza adattamento alla pagina, altrimenti le misure cambiano.
- Lo stato "già stampato" delle etichette è salvato sul singolo dispositivo.
- La griglia mostra fino a 600 carte alla volta, l'elenco fino a 1.000: per vedere le altre si usano filtri o raggruppamenti.
- Rimuovere un'importazione CSV non elimina le carte non più presenti nel file.

---

## Cronologia delle versioni

| Versione | Novità principali |
|---|---|
| 1.0 – 1.2 | prime schede Prelievo, Collezione e Ricerca; importazione CSV; filtri, categorie e anteprime da Scryfall |
| 1.3 – 1.5 | installazione come app (PWA), icone, numero di collezione, ricerca fissa, selezione multipla |
| 1.6 – 1.13 | sincronizzazione Firebase; correzioni di prestazioni e di avvio; ripristino con `?reset=1` e `?safe=1` |
| 1.7 – 1.8 | restyling blu chiaro/scuro, Home con le scatole, simboli delle espansioni, anteprima 3D, animazioni |
| 1.14 – 1.15 | indicatore della memoria, tasto indietro, anteprima centrata sul telefono, pulsante Installa |
| 2.0 | codice diviso in più file |
| 2.1 | etichette per le scatole |
| 2.2 | archivio locale IndexedDB e backup automatici nel cloud |
| 2.3 | Collezione compatta con pannelli a scomparsa |
| 2.4 | sfondi decorativi per pagina |
| 2.5 – 2.5.1 | swipe tra le schede e animazioni di passaggio più pulite |

---

## Crediti e avvertenze

- **Dati e immagini delle carte**: [Scryfall](https://scryfall.com), tramite la sua API pubblica.
- **Simboli delle espansioni**: [Keyrune](https://keyrune.andrewgioia.com/) di Andrew Gioia.
- **Simboli del mana e dei tipi**: [Mana](https://mana.andrewgioia.com/) di Andrew Gioia.
- **Caratteri**: Cinzel e Inter, tramite Google Fonts.
- **Cloud**: Firebase di Google.
- Per le licenze di font e librerie si rimanda ai rispettivi progetti.

Questo è un progetto personale e non ufficiale, non affiliato né approvato da Wizards of the Coast. *Magic: The Gathering*, i simboli del mana e delle espansioni e le immagini delle carte sono proprietà di Wizards of the Coast.
