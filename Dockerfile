# Usa Node.js come immagine base
FROM node:20.19.0-alpine


# Crea la directory principale
WORKDIR /app

# Copia tutto il codice
COPY . .

# Installa dipendenze per entrambi i progetti
RUN npm install --prefix MuSe
RUN npm install --prefix MuSe-Remix-Plugin


# Espone la porta di Vite (5173)

EXPOSE 3001

# Comando per avviare il plugin in dev (React + Express)
CMD ["node", "MuSe-Remix-Plugin/server.js"]


