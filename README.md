<p align="center">
<img src="MuSe-Remix-Plugin/public/logo.png" alt="MuSe logo" style="width:25%;"/>
</p>

# MuSe - MUtation SEeding tool Plugin for Remix IDE

A mutation-based tool for generating benchmarks by injecting vulnerabilities into smart contracts. It features 6 mutation operators to inject vulnerabilities. [MuSe](https://github.com/GerardoIuliano/MuSe) is based on a mutation testing Tool called [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator).

## Table of Contents

- [Requirements](#requirements)
- [Installation](#rocket-installation)
  - [Option 1 – Docker](#wrench-option-1--docker)
  - [Option 2 – Local Setup](#computer-option-2--local-setup)
- [Connect to Remix IDE](#jigsaw-connect-to-remix-ide)
- [Usage](#hammer-and-wrench-usage)
- [Support](#envelope-support)

## Requirements

- **Docker** >= v20.0.X (for docker installation)
- **Node** >= 20.19.0 (for local installation)

<h2 id="rocket-installation">🚀 Installation</h2>

<h3 id="wrench-option-1--docker">🔧 Option 1 – Docker</h3>

```bash
# Pull the image from DockerHub
docker pull danielecarangelo/muse-remix-plugin

# Run the container
docker run --rm -p 3001:3001 danielecarangelo/muse-remix-plugin
```

<h3 id="computer-option-2--local-setup">💻 Option 2 – Local Setup</h3>

```bash
# Clone the repository
git clone https://github.com/Carmineh/MuSe-Remix-Plugin.git
cd MuSe-Remix-Plugin

# Install dependencies for MuSe
cd MuSe
npm install

# Install dependencies for the plugin
cd MuSe-Remix-Plugin
npm install

# Start the server
cd MuSe-Remix-Plugin
node server.js
```

<h2 id="jigsaw-connect-to-remix-ide">🧩 Connect to Remix IDE</h2>

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Go to the **Plugin Manager**
3. Click on **Connect to a Local Plugin**
4. Enter the following:
   ```yaml
    Plugin Name: Muse
    Display Name: Muse
    Url: https://carmineh.github.io/MuSe-Remix-Plugin/
    ```
6. Activate the plugin

<p align="center">
<img width="800" height="640" alt="InstallationRemix" src="https://github.com/user-attachments/assets/6170e5ac-1f9a-46b6-92a4-71d658c11c12" />
</p>

<h2 id="hammer-and-wrench-usage">🛠️ Usage</h2>

Once the plugin is installed:

1. Make sure the local server at `http://localhost:3001/` is **running** (view [Installation](#rocket-installation))
2. You will see the **MuSe Plugin tab** in the Remix sidebar

<h3>💻 Interface Overview</h3>

The MuSe Plugin UI includes:

1. **Contract Selector**
   - Lists all compiled contracts in Remix under the `contracts/` folder

2. **Mutant Selectors**
   - Each dropdown shows available mutation operators (mutants)

3. **Execute Button**  
   - Click to run mutation using selected contract and mutants
   - The mutated contract will be automatically added to Remix under the `MuSe/` folder

4. **Console**  
   - A console that will show operations results and errors
<p align="center">
<img width="702" height="965" alt="PluginUI" src="https://github.com/user-attachments/assets/9b22fa8f-75e2-46ea-b8d1-cd892a0559a6" />
</p>
<h2 id="envelope-support">📬 Support</h2>

If you encounter any bugs, have questions, or want to request new features, please open an [Issue](https://github.com/Carmineh/MuSe-Remix-Plugin/issues) in this repository.

When opening an issue, please provide:

- A clear and descriptive title
- Detailed steps to reproduce the problem (if applicable)
- Expected and actual behavior
- Any relevant screenshots or logs
- Your environment details (e.g., OS, Node version, Docker version)

  
