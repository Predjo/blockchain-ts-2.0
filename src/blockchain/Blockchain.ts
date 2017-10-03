
import * as crypto from 'crypto';
import { URL } from 'url';

import Block from './Block';
import Transaction from './Transaction';

class Blockchain {

  chain : Array<any>;
  currentTransactions : Array<Transaction>;

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
      previousHash,
      index : this.chain.length,
      timestamp : Date.now(),
      transactions : [...this.currentTransactions],
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


  get lastBlock() {
    return this.chain[Math.max(0, this.chain.length - 1)];
  }

  // Creates a SHA-256 hash of a Block
  static hash(block : Block) : string {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(block))
      .digest('hex');
  }

  // Add a new node to the list of nodes
  registerNode(address : string) : void {
    const parsedURL = new URL(address);
    this.nodes.add(parsedURL.host);
  }

}

export default Blockchain;

