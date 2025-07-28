<div style="text-align:center">
<img src="MuSe-Remix-Plugin/public/logo.png" alt="MuSe logo" style="width:25%;"/>
</div>

# MuSe - MUtation SEeding tool Plugin for Remix IDE
A mutation-based tool for generating benchmarks by injecting vulnerabilities into smart contracts. It features 6 mutation operators to inject vulnerabilities.
MuSe is based on a mutation testing Tool called [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator).

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
  - [Docker](#docker)
  - [Local](#local)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)


## Requirements

- Docker >= v20.0.X (for docker installation)
- Node >= 20.19.0 (for local installation)

## Installation

### Docker

```bash
# Pull the Docker image from DockerHub
docker pull danielecarangelo/muse-remix-plugin

# Run the container
docker run --rm -p 3001:3001 danielecarangelo/muse-remix-plugin
```

### Local
```bash
# Clone thje repository
git clone https://github.com/Carmineh/MuSe-Remix-Plugin.git
cd MuSe-Remix-Plugin

# Install dependencies for both Muse Remix Plugin and Muse
cd MuSe
npm install

cd MuSe-Remix-Plugin
npm install

# Run the server locally
cd MuSe-Remix-Plugin
node server.js
```

## Usage
```

```
