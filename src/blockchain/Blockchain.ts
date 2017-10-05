
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import { URL } from 'url';

import Block from './Block';
import Transaction from './Transaction';

class Blockchain {

  chain : Array<Block>;
  currentTransactions : Array<Transaction>;
  nodes : Set<string>;

  constructor() {

    this.chain = [];
    this.currentTransactions = [];
    this.nodes = new Set();

    // Create the genesis block
    this.newBlock(100, '1');
  }

  // Creates a new Block and adds it to the chain
  newBlock(proof : number, previousHash? : string) : Block {
    
    const block : Block = {
      proof,
      index : this.chain.length,
      timestamp : Date.now(),
      transactions : [...this.currentTransactions],
      previousHash : Boolean(previousHash) ? previousHash : Blockchain.hash(this.lastBlock),
    };

    this.currentTransactions = [];

    this.chain.push(block);
    return block;
  }

  // Adds a new transaction to the list of transactions
  // Returns the index of the Block that will hold this transaction
  newTransaction(sender : string, recipient : string, amount : number) : number {
    const transaction : Transaction = {
      sender, recipient, amount,
    };

    this.currentTransactions.push(transaction);

    return this.lastBlock.index + 1;
  }

  // Simple Proof of Work Algorithm:
  // - Find a number p' such that hash(pp') contains leading 4 zeroes, where p is the previous p'
  // - p is the previous proof, and p' is the new proof
  proofOfWork(lastProof : number) : number {
    let proof = 0;

    while (!Blockchain.validProof(lastProof, proof)) {
      proof += 1;
    }

    return proof;
  }

  // Validates the Proof: Does hash contain 4 leading zeroes?
  static validProof(lastProof : number, proof : number) : boolean {
    const guess : string = `${ lastProof }${ proof }`;
    const guessHash : string = crypto
      .createHash('sha256')
      .update(guess)
      .digest('hex');

    return guessHash.indexOf('0000') === 0; 
  }

  // Creates a SHA-256 hash of a Block
  static hash(block : Block) : string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(block))
      .digest('hex');
  }

  get lastBlock() {
    return this.chain[Math.max(0, this.chain.length - 1)];
  }

  // Add a new node to the list of nodes
  registerNode(address : string) : void {
    const parsedURL = new URL(address);
    this.nodes.add(parsedURL.host);
  }

  // Determine if a given blockchain is valid
  static validChain(chain: Array<Block>): boolean {
    let lastBlock = chain[0];
    let currentIndex = 1;

    while (currentIndex < chain.length) {
      const block = chain[currentIndex];
      console.log(lastBlock);
      console.log(block);
      console.log('\n-------------\n');

      // Check that the hash of the block is correct
      if (block.previousHash !== Blockchain.hash(lastBlock)) {
        return false;
      }

      if (!Blockchain.validProof(lastBlock.proof, block.proof)) {
        return false;
      }

      lastBlock = block;
      currentIndex += 1;

      return true;
    }
  }


  // This is our Consensus Algorithm, it resolves conflicts
  // by replacing our chain with the longest one in the network.
  async resolveConflicts(): Promise<boolean> {
    const neighbours = this.nodes;
    let newChain = undefined;

    // We're only looking for chains longer than ours
    let maxLength = this.chain.length;

    // Grab and verify the chains from all the nodes in our network
    for (const node of neighbours) {
      const response : AxiosResponse = await axios(`http://${ node }/chain`);

      if (response.status === 200) {
        const length = response.data.length;
        const chain  = response.data.chain;

        // Check if the length is longer and the chain is valid

        if (length > maxLength && Blockchain.validChain(chain)) {
          maxLength = length;
          newChain = chain;
        }
      }
    }

    if (newChain) {
      this.chain = newChain;
      return true;
    } else {
      return false;
    }

  }

}

export default Blockchain;

