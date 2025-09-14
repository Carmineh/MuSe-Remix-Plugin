<p align="center">
<img src="MuSe-Remix-Plugin/public/logo.png" alt="MuSe logo" style="width:25%;"/>
</p>

![License](https://img.shields.io/github/license/Carmineh/MuSe-Remix-Plugin)
[![Deploy app to GitHub Pages](https://github.com/Carmineh/MuSe-Remix-Plugin/actions/workflows/pages.yml/badge.svg)](https://github.com/Carmineh/MuSe-Remix-Plugin/actions/workflows/pages.yml)
[![CI/CD Pipeline](https://github.com/Carmineh/MuSe-Remix-Plugin/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Carmineh/MuSe-Remix-Plugin/actions/workflows/ci-cd.yml)
![Docker Image Version](https://img.shields.io/docker/v/danielecarangelo/muse-remix-plugin)


# MuSe - MUtation SEeding tool Plugin for Remix IDE
**[MuSe](https://github.com/GerardoIuliano/MuSe)** is a mutation testing tool for Solidity Smart Contracts. It was designed to run mutation testing on Solidity projects. It can run test using Hardhat, Brownie and Forge, hybrid test suites, and custom test scripts.

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

<h3 id="wrench-option-1--docker">🔧 Option 1 – Docker (Recommended)</h3>

```bash
# Pull the image from DockerHub
docker pull danielecarangelo/muse-remix-plugin

# Run the container
docker run --rm -p 3001:3001 danielecarangelo/muse-remix-plugin
```

<h3 id="computer-option-2--local-setup">💻 Option 2 – Local Setup (Only Linus-Based OS)</h3>

```bash
# Clone the repository
git clone --recurse-submodules https://github.com/Carmineh/MuSe-Remix-Plugin.git
cd MuSe-Remix-Plugin

# Install dependencies for MuSe
cd MuSe
npm install
# For the Framework installation make sure to check MuSe and SuMo repositories 
# Framework are mandatory to run tests

# Install dependencies for the plugin
cd ../MuSe-Remix-Plugin
npm install

# Install dependencies for API Service
cd ../muse-api-service
npm install

# Start the server inside MuSe-Remix-Plugin
node server.js
```

<h2 id="jigsaw-connect-to-remix-ide">🧩 Connect to Remix IDE</h2>

1. Open [Remix IDE](https://remix.ethereum.org/)
2. Go to the **Plugin Manager**
3. Click on **Connect to a Local Plugin**
4. Enter the following:
   ```yaml
   Plugin Name: MuSe
   Display Name: MuSe
   Url: https://carmineh.github.io/MuSe-Remix-Plugin/
   ```
5. Activate the plugin

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

3. **Mutate button**
   - Click to run mutation using selected contract and mutants
   - The mutated contract will be automatically added to Remix under the `MuSe/`
4. **Test Button**
   - Open the Test Configuration to start the _Mutation testing_
  
5. **Test Configuration**
   - _Testing Framework_: Choose one of the 4 available frameworks
   - _Timeout_: A timeout in seconds to stop looped testings

6. **Console**
   - A console that will show operations results and errors

   <p align="center">

    <img width="702" height="965" alt="PluginUI" src="https://github.com/user-attachments/assets/9b22fa8f-75e2-46ea-b8d1-cd892a0559a6" />
    <img width="702" height="573" alt="Screenshot 2025-09-02 151214" src="https://github.com/user-attachments/assets/d80e19b5-b848-40be-b920-0af6e38969be" />

   </p>
   
<h3> 👾 Mutation Operators </h3>
This plugin includes the mutation operators defined in <b><a href="https://github.com/GGFlutterdev/SuMo-SOlidity-MUtator?tab=readme-ov-file#mutation-operators-">Sumo</a></b> and <b><a href="https://github.com/GerardoIuliano/MuSe#mutation-operators-">MuSe</a></b>

<h3> 📑 Quick Start </h3>

1. **Select a Contract**  
   Use the dropdown menu to select the smart contract you want to test.

2. **Choose Mutation Operators**  
   Pick one or more _mutation operators_ from the provided list.

3. **Click “Mutate”**  
   Press the **Mutate** button to generate mutated versions of the selected contract.

4. **Prepare the Test File**  
   Make sure the test file is renamed correctly. Its name must contain both:

   - The **contract name**
   - The **test framework** you're using (e.g., `hardhat`, `truffle`, etc.)

   > ⚠️ These keywords are **not case-sensitive**.  
   > ✅ Example: `mycontract-hardhat.js`

5. **Run the Test**  
   Run your tests as you normally would using your test framework.

6. **View the Mutation Report**  
   Once the test run is complete, open the `MuSe/results/report.html` file.

<h2 id="envelope-support">📬 Support</h2>

If you encounter any bugs, have questions, or want to request new features, please open an [Issue](https://github.com/Carmineh/MuSe-Remix-Plugin/issues) in this repository.

When opening an issue, please provide:

- A clear and descriptive title
- Detailed steps to reproduce the problem (if applicable)
- Expected and actual behavior
- Any relevant screenshots or logs
- Your environment details (e.g., OS, Node version, Docker version)
