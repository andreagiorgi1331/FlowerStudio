# ============================================================
# FASE 1: BUILD — Compilazione dell'app React con Vite
# ============================================================
FROM node:24-alpine AS build

WORKDIR /app

# Copia i file delle dipendenze e installa
COPY package*.json ./
RUN npm install

# Copia il resto del codice sorgente e compila
COPY . .

# Variabile d'ambiente per l'URL del backend (iniettata al build)
# In Docker, il frontend usa /api che NGINX inoltra al container backend
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ============================================================
# FASE 2: PRODUZIONE — Web Server NGINX ultra-leggero
# ============================================================
FROM nginx:alpine

# Copia i file compilati dalla Fase 1 dentro la cartella pubblica di NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Copia la configurazione personalizzata di NGINX
# (gestisce il routing SPA di React con try_files)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
