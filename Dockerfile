# Base leggera e compatibile
FROM python:3.11-slim

# Install tools di sistema + Node.js + Foundry dipendenze
RUN apt-get update && apt-get install -y \
    curl \
    git \
    make \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    pkg-config \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Installa Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get update && apt-get install -y nodejs

# Installa Truffle e Hardhat
RUN npm install -g truffle hardhat

# Installa Brownie
RUN pip install --upgrade pip \
    && pip install eth-brownie

# Installa Foundry (Forge)
RUN curl -L https://foundry.paradigm.xyz | bash \
    && /root/.foundry/bin/foundryup

# Aggiungi Foundry al PATH globale
ENV PATH="/root/.foundry/bin:$PATH"

# Crea directory del progetto
WORKDIR /app

# Copia tutto il progetto
COPY . .

# Installa dipendenze dei progetti Node
RUN npm install --prefix MuSe

# Dipendenza per Hardhat
RUN npm install --prefix MuSe @nomicfoundation/hardhat-toolbox

# Dipendenza per Truffle
RUN npm install --prefix MuSe --save-dev @openzeppelin/test-helpers

# Dipendenza per Foundry
RUN cd MuSe
RUN forge install foundry-rs/forge-std 

RUN npm install --prefix MuSe-Remix-Plugin

# Espone porta per Express o Vite
EXPOSE 3001

# Comando di avvio
CMD ["node", "MuSe-Remix-Plugin/server.js"]
