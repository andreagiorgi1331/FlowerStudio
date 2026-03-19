# 🌸 FlowerStudio — Bouquet Builder

**FlowerStudio** è un'applicazione per la composizione interattiva di bouquet floreali.  
L'utente può scegliere fiori da un catalogo, trascinarli su una tela, personalizzare la confezione e condividere le proprie creazioni con la community. Include un chatbot AI (Fleur) per suggerimenti floreali.

---

## Architettura

| Componente     | Tecnologia           | Porta  |
| :------------- | :------------------- | :----: |
| **Frontend**   | React (Vite) + NGINX |  `80`  |
| **Backend**    | Node.js + Express    | `3000` |
| **Database**   | PostgreSQL 18        | `5432` |
| **Chatbot AI** | Groq API (LLM)       |   —    |

```
FlowerStudio/
├── frontend/          # App React (Vite)
│   ├── Dockerfile     # Multi-stage: build Node → serve NGINX
│   ├── nginx.conf     # Configurazione NGINX (SPA routing)
│   └── src/           # Codice sorgente React
├── backend/           # API REST Node.js
│   ├── Dockerfile     # Container Node.js
│   ├── server.js      # Entry point Express
│   ├── config/        # Connessione DB
│   ├── controllers/   # Logica business
│   ├── middleware/     # Autenticazione JWT
│   ├── models/        # Query SQL
│   ├── routes/        # Route API
│   └── services/      # Servizi esterni (AI)
├── db-init/           # Script SQL di inizializzazione
│   └── init.sql       # Creazione tabelle e dati iniziali
├── docker-compose.yml # Orchestrazione dei 3 servizi
├── .env.example       # Template variabili d'ambiente
└── README.md
```

---

## Avvio Rapido (Docker)

> **Non è necessario installare Node.js, npm o PostgreSQL sul proprio computer.**  
> L'unico requisito è avere **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installato e in esecuzione.

### 1. Configurare le variabili d'ambiente

Modificare il file `.env` con le credenziali reali:

```env
PORT=3000
DB_USER=postgres
DB_PASSWORD=<la_propria_password>
DB_PORT=5432
DB_NAME=FlowerStudio
JWT_SECRET=<la_propria_chiave_segreta>
BOT_NAME=Fleur
GROQ_API_KEY=<la_propria_api_key_groq>
```

### 2. Avviare l'applicazione

Un singolo comando costruisce e avvia tutto:

```bash
docker-compose up --build
```

Al primo avvio Docker:

1. **Costruisce** le immagini del frontend e del backend.
2. **Avvia** il database PostgreSQL e ne inizializza lo schema tramite `db-init/init.sql`.
3. **Avvia** il backend Express che si collega al DB.
4. **Compila** il frontend React e lo serve tramite NGINX.

### 3. Accedere all'applicazione

| Servizio                          | URL                                            |
| :-------------------------------- | :--------------------------------------------- |
| **Frontend** (interfaccia utente) | [http://localhost](http://localhost)           |
| **Backend** (API REST)            | [http://localhost:3000](http://localhost:3000) |

### 4. Arrestare l'applicazione

```bash
docker-compose down
```

Per eliminare anche i dati persistenti del database:

```bash
docker-compose down -v
```

## Istruzioni di Test

I test delle API REST sono stati configurati utilizzando **Bruno** (un'alternativa open-source a Postman).
Nella cartella `backend/flowerstudio-api/` è presente la collection completa.

1. Scarica e installa [Bruno](https://www.usebruno.com/).
2. Apri Bruno e seleziona "Open Collection".
3. Seleziona la cartella `backend/flowerstudio-api/`.
4. Assicurati che l'applicazione sia in esecuzione tramite Docker e lancia le richieste preconfigurate (Creazione bouquet, Login, ecc.) per testare gli endpoint.

---

## Scelte Progettuali e Motivazioni Tecniche

L'architettura dell'applicazione segue i principi **Cloud-Native**, rendendola facilmente scalabile e deployabile su qualsiasi provider cloud grazie alla containerizzazione.

- **Frontend (React + Vite + NGINX):** Si è scelto React per la sua architettura a componenti, ideale per gestire un'interfaccia interattiva come la tela drag & drop dei fiori. NGINX è stato inserito nel Dockerfile in un processo multi-stage per servire i file statici compilati in modo estremamente leggero e performante, fungendo anche da reverse proxy.
- **Backend (Node.js + Express):** Scelto per la sua natura asincrona (event-driven), perfetta per gestire le API RESTful e le chiamate di rete parallele (ad esempio verso il DB e l'API di Groq contemporaneamente).
- **Database (PostgreSQL 18):** Si è optato per un database relazionale robusto per garantire l'integrità dei dati tra Utenti, Bouquet e Catalogo Fiori.
- **Containerizzazione (Docker):** Garantisce che l'applicazione funzioni in modo identico sia nell'ambiente di sviluppo locale che in produzione, isolando le dipendenze di ogni servizio.

---

## Librerie Esterne e utilizzo AI

Nel rispetto delle regole d'esame, si dichiara quanto segue:

- **Servizi AI Esterni:** L'applicazione integra l'API pubblica di **Groq** per alimentare il Chatbot "Fleur" (presente nel file `chatController.js` e `chatService.js`). Il funzionamento dell'integrazione (tramite chiamate REST asincrone) è completamente compreso e documentato.
- **Strumenti di Assistenza allo Sviluppo:** Durante la stesura del codice potrebbero essere stati impiegati strumenti di AI generativa (es. GitHub Copilot, ChatGPT) esclusivamente come supporto alla scrittura (ad esempio per boilerplate o formattazione CSS). Tutto il codice generato è stato revisionato, testato e compreso appieno dallo sviluppatore, e rispecchia l'architettura logica pensata per l'esame.

## Sicurezza

- **Autenticazione JWT**: Token firmato con chiave segreta configurabile.
- **Hashing password**: Le password sono cifrate con `bcrypt` (salt round automatico).
- **Protezione IDOR**: Ogni risorsa è validata contro il `user_id` estratto dal token JWT.
- **Variabili d'ambiente**: Nessuna credenziale è hardcoded nel codice sorgente.

---

## Funzionalità Principali

- **Composizione Drag & Drop**: Trascina fiori e foglie su una tela interattiva.
- **Personalizzazione**: Colore confezione, fiocco opzionale, ridimensionamento e specchiatura dei fiori.
- **Anteprima in tempo reale**: Screenshot automatico del bouquet alla creazione.
- **Community**: Condividi i tuoi bouquet con gli altri utenti.
- **Catalogo Template**: Usa bouquet predefiniti come punto di partenza.
- **Chatbot AI (Fleur)**: Assistente virtuale per consigli sulla scelta dei fiori.
- **Dashboard Admin**: Gestione globale dei bouquet e promozione a template.
