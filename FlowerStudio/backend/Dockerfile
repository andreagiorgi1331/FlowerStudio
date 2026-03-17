# Usa una base leggera di Node.js
FROM node:20-alpine

# Imposta la cartella di lavoro dentro il container
WORKDIR /app

# Copia i file delle dipendenze (package.json e package-lock.json)
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice backend
COPY . .

# Espone la porta che Node.js userà
EXPOSE 3000

# Comando di avvio del server
CMD ["node", "server.js"]
