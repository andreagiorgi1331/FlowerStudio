# 🌸 FlowerStudio — Bouquet Builder

**FlowerStudio** è un'applicazione per la composizione interattiva di bouquet floreali.  
L'utente può scegliere fiori da un catalogo, trascinarli su una tela, personalizzare la confezione e condividere le proprie creazioni con la community. Include un chatbot AI (Fleur) per suggerimenti floreali.

---

## 📐 Architettura

| Componente     | Tecnologia           | Porta  |
| :------------- | :------------------- | :----: |
| **Frontend**   | React (Vite) + NGINX |  `80`  |
| **Backend**    | Node.js + Express    | `3000` |
| **Database**   | PostgreSQL 15        | `5432` |
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

## 🚀 Avvio Rapido (Docker)

> **Non è necessario installare Node.js, npm o PostgreSQL sul proprio computer.**  
> L'unico requisito è avere **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** installato e in esecuzione.

### 1. Configurare le variabili d'ambiente

Modificare il file `.env` con le variabili inviate via mail e caricare il file nella cartella principale.
Esempio env:

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

Entrare in Docker Desktop, aprire il terminale e posizionarsi nella cartella del progetto.
Per costruire le immagini e avviare tutti i servizi (Database + Backend), esegui il seguente comando:

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

## 🛡️ Sicurezza

- **Autenticazione JWT**: Token firmato con chiave segreta configurabile.
- **Hashing password**: Le password sono cifrate con `bcrypt` (salt round automatico).
- **Protezione IDOR**: Ogni risorsa è validata contro il `user_id` estratto dal token JWT.
- **Variabili d'ambiente**: Nessuna credenziale è hardcoded nel codice sorgente.

---

## 🧩 Funzionalità Principali

- **Composizione Drag & Drop**: Trascina fiori e foglie su una tela interattiva.
- **Personalizzazione**: Colore confezione, fiocco opzionale, ridimensionamento e specchiatura dei fiori.
- **Anteprima in tempo reale**: Screenshot automatico del bouquet al salvataggio.
- **Community**: Condividi i tuoi bouquet con gli altri utenti pubblicandoli da "I Miei Mazzi".
- **Catalogo Template**: Usa bouquet predefiniti nella pagina "Giardino" come punto di partenza.
- **Chatbot AI (Fleur)**: Assistente virtuale per consigli sulla scelta dei fiori.
- **Dashboard Admin**: Gestione globale dei bouquet e promozione a template di bouquet creati dagli utenti.
