# Introduction
This repository implements simple blockchain using [TypeScript](https://www.typescriptlang.org). It is inspired by the following [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46). It is initially made for Zagreb JS Meetup.

# Usage
Run `npm start -- --port <port-number> --nodes <node-list>` to start the blockchain node.

`<node-list>` Is a comma separated string of node IPs.

### Example

`npm start -- --port 3002 --nodes 127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3003`

# Development
Run `npm run tsc:watch` to start TypeScript compiler and run `npm run watch` to start node in watch mode.


# Hashing
Blockchain implements SHA-256 hashing function from Nodes native `crypto` package. It is used for verifying transactions and blocks.

# Asymmetric Cryptography
Blockchain implements asymmetric cryptography to sign and verify transactions. Private/public key pair is generated using Elliptic Curve Digital Signature Algorithm from the `rsasign` package.

# Proof of Work algorithm
Blockchain implements basic Proof of Work algorithm. Miners need to find a number called `nonce` that, when added to the block and hashed, produces a hash with `difficulty` number of leading 0s ('0000').  

Blockchain class methods `proofOfWork` and `validateBlock` implement Proof of Work algorithm.

# Broadcasting
Transactions and blocks, once created, are broadcasted through the whole network. It is achieved by having each node sending REST calls to each node in the list of nodes given during initialization.

# REST API endpoints

```
POST /transactions/new
```
Creates a new transaction using the miners public key as a sender address and private key to sign it. After it is created the transaction is added to the pending transaction pool and broadcasted to neighboring nodes.

| Parameter | Description |
|-----------|-------------|
| `recipient` | Hexadecimal hash address of a transaction recipient |
| `amount` | Amount of coins to be transfered |

<br/>

```
POST /mine
```
If there are pending transactions it starts the mining process to create a new block. When created the new block is added to chain and broadcasted to neighboring nodes. Else it returns 400.

<br/>

```
GET /chain
```
Returns the current chain state and validates it.

<br/>

```
POST /transactions
```
Used for broadcasting of transactions. If the transaction is valid and not duplicate it is added to the pending transaction pool. Transaction is than broadcasted again. Invalid or duplicate transactions are discarded.

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
Used for broadcasting of blocks. If the block is valid and not duplicate it is added to the chain. All the transactions included in the block are removed from the pending transaction pool. Block is than broadcasted again. Invalid or duplicate blocks are discarded.

| Parameter | Description |
|-----------|-------------|
| `transactions` | Array of transactions |
| `difficulty` | Number representing the mining difficulty |
| `previousHash` | Hexadecimal hash of a previous block in the chain |
| `timestamp` | Unix time when block was mined |
| `nonce` | Cryptographic nonce number used to prove work done to create a block |

<br/>
