<div style="text-align:center">
<img src="/MuSe-Remix-Plugin/public/logo.png" alt="logo" style="width:25%;"/>
</div>

# MuSe - MUtation SEeding tool Plugin for Remix IDE

A mutation-based tool for generating benchmarks by injecting vulnerabilities into smart contracts. It features 6 mutation operators to inject vulnerabilities.
MuSe is based on a mutation testing Tool called [SuMo](https://github.com/MorenaBarboni/SuMo-SOlidity-MUtator).

# Table of Contents

- [Requirements](https://github.com/Carmineh/MuSe-Remix-Plugin#requirements)
- [Installation](https://github.com/Carmineh/MuSe-Remix-Plugin#installation)
- [Configuration](https://github.com/Carmineh/MuSe-Remix-Plugin#configuration-)
- [Mutation Operators](https://github.com/Carmineh/MuSe-Remix-Plugin#mutation-operators-)

# Requirements

Requisiti richiesti

# Installation 🔌

To install sumo run `npm install @geriul/sumo`

# Configuration ⚙️

Before using MuSe you must specify your desired configuration in a [sumo-config.js](https://github.com/GerardoIuliano/SuMo-SOlidity-MUtator/blob/master/src/sumo-config.js) in the root directory of your project. The `sumo-config.js` is automatically generated upon installation.

Here's a simple example of `sumo-config.js`:

## Selecting the Mutation Operators

## Viewing the available mutations

| Command  | Description                                                                                       | Usage                  | Example             |
| -------- | ------------------------------------------------------------------------------------------------- | ---------------------- | ------------------- |
| `lookup` | Generates the mutations and saves them to ./sumo/generated.csv without starting mutation testing. | `npx/yarn sumo lookup` | `$ npx sumo lookup` |
| `mutate` | Generates the mutations and saves a copy of each `.sol` mutant to to ./sumo/mutants.              | `npx/yarn sumo mutate` | `$ npx sumo mutate` |

## Viewing the results

MuSe automatically creates a `sumo\results` folder in the root directory of the project with the following reports: <br/>

- `results.csv` Results of the mutation testing process for each mutant in csv format
- `sumo-log.txt` Logs info about the mutation testing process
- `mutations.json` Results of the mutation testing process for each mutant in json format
- `\mutants` Mutated `.sol` contracts generated with `sumo mutate`

# Quickstart ✅

Default folders creation run (in root folder):

```bash
mkdir -p contracts tests build
```

Enabling TD operator:

```bash
npx sumo enable TD
```

Mutating contracts:

```bash
npx sumo mutate
```

##

# Mutation Operators 👾

MuSe includes currently 11 mutation operators.

## Vulnerability Mutation Operators

| Operator | Name                                        | Mutation Example                                                                                                                                                                                                                                                                   |
| -------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UC       | Unchecked low-level call return value       | `require(address.call())` &rarr; `address.call()`                                                                                                                                                                                                                                  |
| US       | Unchecked send                              | `require(address.send())` &rarr; `address.send()`                                                                                                                                                                                                                                  |
| UTR      | Unchecked transfer                          | `require(address.transfer())` &rarr; `address.transfer()`                                                                                                                                                                                                                          |
| TX       | Authentication through tx.origin            | `owner == msg.sender` &rarr; `owner == tx.origin`                                                                                                                                                                                                                                  |
| DTU      | Delegatecall to untrusted callee            | `address.delegatecall()` &rarr; `function setDelegate(address _addr){addr = _addr} addr.delegatecall()`                                                                                                                                                                            |
| UR1      | Unused return (Assignment)                  | `_totalSupply = _totalSupply.sub(amount)` &rarr; `_totalSupply = 0; _totalSupply.sub(amount)`                                                                                                                                                                                      |
| UR2      | Unused return (Initialization + Assignment) | `uint length = data.decodeU32()` &rarr; `uint length = data.decodeU32()`                                                                                                                                                                                                           |
| TD       | Timestamp dependence                        | `block.number` &rarr; `block.timestamp`                                                                                                                                                                                                                                            |
| IUO      | Integer underflow/overflow                  | `totalSupply = totalSupply.add(amount)` &rarr; `totalSupply = (totalSupply + amount)`                                                                                                                                                                                              |
| USD      | Unprotected self-destruct                   | `function destroy() private { selfdestruct(payable(owner)); }` &rarr; `function destroy() public { selfdestruct(payable(owner)); }`                                                                                                                                                |
| RE       | Reentrancy                                  | `function withdraw(uint256 amount) public { balances[msg.sender] -= amount; (bool success, ) = msg.sender.call{value: amount}(""); }` &rarr; `function withdraw(uint256 amount) public { (bool success, ) = msg.sender.call{value: amount}(""); balances[msg.sender] -= amount; }` |
