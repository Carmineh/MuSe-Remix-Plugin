# Usa Node.js come immagine base
FROM node:20.19.0-alpine


# Crea la directory principale
WORKDIR /app


# Installa mkcert e certutil
RUN apk add --no-cache nss-tools


# Installa mkcert
RUN wget -q -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-arm64 && \
    chmod +x /usr/local/bin/mkcert


# Copia tutto il codice
COPY . .

# Installa dipendenze per entrambi i progetti
RUN npm install --prefix MuSe
RUN npm install --prefix MuSe-Remix-Plugin


# Copia lo script entrypoint e rendilo eseguibile
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Espone la porta di Vite (5173)
EXPOSE 5173
EXPOSE 3001

# Comando per avviare il plugin in dev (React + Express)
#CMD ["npm", "run", "dev:both"]

ENTRYPOINT ["/start.sh"]

