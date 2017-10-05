# Introduction
This repository implements simple blockchain using [TypeScript](https://www.typescriptlang.org). It is inspired by the following [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46)

# Modules

## blockchain.js
Contains Blockchain class that represents blockchain. Every instance of the class share same blockchain.

## block.js
Template for block objects.

## transactio .js
Template for transaction objects.

# Proof of Work algorithm
Blockchain implements basic Proof of Work algorithm. Miners need to find a number that, when hashed with the previous block’s solution (proof), creates a hash with 4 leading 0s ('0000').  
Blockchain class methods *proofOfWork* and *validProof* implements Proof of Work algorithm.

# Consensus algorithm
Consensus algorithm ensures that all nodes in decentralized network reflect the same blockchain. Rule of Consensus algorithm is that the longest valid chain is authoritative.
