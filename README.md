# Introduction
This repository implements a simple Blockchain using [TypeScript](https://www.typescriptlang.org). It is inspired by the following [article](https://hackernoon.com/learn-Blockchains-by-building-one-117428612f46). It is initially made for Zagreb JS Meetup.

# Usage
Run `npm start -- --port <port-number> --nodes <node-list>` to start the Blockchain node.

`<node-list>` Is a comma separated string of node IPs.

### Example

`npm start -- --port 3002 --nodes 127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3003`

# Development
Run `npm run tsc:watch` to start TypeScript compiler and run `npm run watch` to start node in watch mode.

# Description
This is a simple Blockchain created to showcase some basic Blokchain concepts. It runs as an express server with REST interface.
Network is created by creating multiple servers and providing them the list of neighboring nodes via the `--nodes` console parameter.

### Hashing
Blockchain implements SHA-256 hashing function from Nodes native `crypto` package. It is used for verifying transactions and blocks.

### Asymmetric Cryptography
Blockchain implements asymmetric cryptography to sign and verify transactions. Private/public key pair is generated using Elliptic Curve Digital Signature Algorithm from the `rsasign` package.

### Transactions
Blockchain can create simple transactions. It uses the public key of the miner as a `sender` address. Once created the transaction is hashed and signed with the miners private key. Signature is than included in the transaction.
Other nodes can verify the transaction by rehashing the transaction data, decrypting the signature with the address in the `sender` field and comparing the two hashes.

### Blocks
Blocks are basic building blocks of the Blockchain. They contain transactions. Once the block is added to the Blockchain its transactions are confirmed. Blocks are created via the process called mining.

### Proof of Work algorithm
Blockchain implements basic Proof of Work algorithm. Miners need to find a number called `nonce` that, when added to the block and hashed, produces a hash with `difficulty` number of leading 0s ('0000').  
Blockchain class methods `proofOfWork` and `validateBlock` implement Proof of Work algorithm.
Proof of work is used to make the creating of the blocks computationally expensive. Reason for that is to discourage the creation of fake blocks which would undermine the integrity of the network.

### Mining
Mining is used to create a new block and new coins. It is done using the `mine` method.
First a basic block is created using the `createBlock` method. It includes all the pending transactions.

Then the miner is awarded with the `reward` amount of coins for its service. That is achieved by creating a special transaction called `coinbase trasaction` which is than added to the front of the transactions in the block. That process creates new coins in the network.

Than the correct `timestamp` is added and the Proof of Work algorithm starts. Once it is finished, the calculated `nonce` is added to the block. At that point the block is finished.

### Broadcasting
Transactions and blocks, once created, are broadcast through the whole network. It is achieved by having each node sending REST calls to each node in the list of nodes given during initialization.

# REST API endpoints

```
POST /transactions/new
```
Creates a new transaction using the miners public key as a sender address and private key to sign it. After it is created the transaction is added to the pending transaction pool and broadcast to neighboring nodes.

| Parameter | Description |
|-----------|-------------|
| `recipient` | Hexadecimal hash address of a transaction recipient |
| `amount` | Amount of coins to be transfered |

<br/>

```
POST /mine
```
If there are pending transactions it starts the mining process to create a new block. When created the new block is added to chain and broadcast to neighboring nodes. Else it returns 400.

<br/>

```
GET /chain
```
Returns the current chain state and validates it.

<br/>

```
POST /transactions
```
Used for broadcasting of transactions. If the transaction is valid and not duplicate it is added to the pending transaction pool. Transaction is than broadcast again. Invalid or duplicate transactions are discarded.

| Parameter | Description |
|-----------|-------------|
| `recipient` | Hexadecimal hash address of a transaction recipient |
| `sender` | Hexadecimal hash address of a transaction sender |
| `amount` | Amount of coins to be transfered |
| `timestamp` | Unix time when transaction was created |
| `signature` | Transaction hash encrypted with the private key of the sender |

<br/>

```
POST /blocks
```
Used for broadcasting of blocks. If the block is valid and not duplicate it is added to the chain. All the transactions included in the block are removed from the pending transaction pool. Block is than broadcast again. Invalid or duplicate blocks are discarded.

| Parameter | Description |
|-----------|-------------|
| `transactions` | Array of transactions |
| `difficulty` | Number representing the mining difficulty |
| `previousHash` | Hexadecimal hash of a previous block in the chain |
| `timestamp` | Unix time when block was mined |
| `nonce` | Cryptographic nonce number used to prove work done to create a block |

<br/>
