# Introduction
This repository implements simple blockchain using [TypeScript](https://www.typescriptlang.org). It is inspired by the following [article](https://hackernoon.com/learn-blockchains-by-building-one-117428612f46). It is initially made for Zagreb JS Meetup.

# Usage
Run `npm start -- --port <port-number> --nodes <node-list>` to start the blockchain node.

`<node-list>` Is a comma seperated string of node IPs.

### Example

`npm start -- --port 3002 --nodes 127.0.0.1:3000,127.0.0.1:3001,127.0.0.1:3003`

# Develop
Run `npm run tsc:watch` to start TypeScript compiler and run `npm run watch` to start node in watch mode.


# Proof of Work algorithm
Blockchain implements basic Proof of Work algorithm. Miners need to find a number called `nonce` that, when added to the block and hashed, produces a hash with `dificulty` number of leading 0s ('0000').  

Blockchain class methods `proofOfWork` and `validateBlock` implement Proof of Work algorithm.

