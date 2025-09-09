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

RUN npm install -g ganache

# Installa Foundry (Forge)
RUN curl -L https://foundry.paradigm.xyz | bash \
    && /root/.foundry/bin/foundryup

# Aggiungi Foundry al PATH globale
ENV PATH="/root/.foundry/bin:$PATH"

# Crea directory del progetto
WORKDIR /app

# Copia tutto il progetto
COPY . .

# Installa dipendenze del progetto MuSe
RUN npm install --prefix MuSe

# Dipendenza per Hardhat
RUN npm install --prefix MuSe @nomicfoundation/hardhat-toolbox

# Dipendenza per Truffle
RUN npm install --prefix MuSe --save-dev @openzeppelin/test-helpers

# Dipendenza per Foundry
RUN cd MuSe && forge install foundry-rs/forge-std

# Installa dipendenze dell'API service
RUN npm install --prefix muse-api-service

# Crea directory necessarie per templates
RUN mkdir -p muse-api-service/src/utils/templates

# Espone porta per Express
EXPOSE 3001

# Run npm start when container launches
WORKDIR "/app/muse-api-service"
CMD ["npm", "start"]