#!/bin/sh

set -ex

CERT_DIR=/app/MuSe-Remix-Plugin/certs
KEY_FILE=$CERT_DIR/localhost-key.pem
CERT_FILE=$CERT_DIR/localhost.pem

# Crea la cartella certs se non esiste
mkdir -p $CERT_DIR

# Genera certificati se non esistono
if [ ! -f "$KEY_FILE" ] || [ ! -f "$CERT_FILE" ]; then
  echo "Generazione certificati mkcert per localhost..."
  mkcert -key-file "$KEY_FILE" -cert-file "$CERT_FILE" localhost 127.0.0.1 ::1
  echo "Certificati creati in $CERT_DIR"
else
  echo "Certificati già presenti"
fi

# Avvia server vite e node
cd /app/MuSe-Remix-Plugin
npm run dev:both