
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import * as stringify from 'json-stable-stringify';

import Transaction from './Transaction';
import Block from './Block';

import {
  hash,
  generateKeyPair,
  signWithPrivateKey,
  verifyWithPublicKey,
} from './Crypto';

class Miner {

  public nodes: Set<string>;
  
  public chain: Array<Block>;
  public pendingTransactions: Array<Transaction>;
  public difficulty: number;

  public publicKey: string;
  private privateKey: string;

  constructor() {

    this.chain = [];
    this.pendingTransactions = [];

    // List of neighbouring nodes
    this.nodes = new Set();

    // Mining difficulty
    this.difficulty = 4;

    // Generate public/private key pair using ECDSA
    [this.publicKey, this.privateKey] = generateKeyPair();

    // Create the Genesis block
    const genesisBlock = this.createBlock([], undefined, 1337);
    this.addBlock(genesisBlock);
  }

  // Add a new node to the list of nodes
  public registerNode(node : string) : void {
    this.nodes.add(node);
  }

  // Creates a new transaction
  public createTransaction(sender: string, recipient: string, amount: number): Transaction {
    return {
      sender, recipient, amount, timestamp : Date.now(),
    };
  }

  // Signes the transaction by hashing the transaction data
  //  and encrypting the hash with the private key
  public signTransaction(transaction: Transaction): Transaction {
    
    const transactionHash = hash(stringify(transaction));
    const signature = signWithPrivateKey(this.privateKey, transactionHash);
    
    return { ...transaction, signature };
  }


  // Validates transaction by decrypting the transaction signature and comparing
  //  it with the hash of the transaction data
  public validateTransaction(transaction: Transaction): boolean {
    const { signature, ...transactionData } = transaction;

    const transactionHash = hash(stringify(transactionData));

    return verifyWithPublicKey(transaction.sender, transactionHash, signature);
  }

  // Add a transaction to the list of pending transactions
  public addTransaction(transaction: Transaction) {
    
    this.pendingTransactions.push(transaction);
  }

  // Send the transaction to the provided list of nodes
  public async broadcastTransaction(transaction: Transaction, nodes: Set<string>) {
    for (const node of nodes) {
      console.log(`Sending transaction to ${ node }`);
      await axios.post(`http://${ node }/transactions`, transaction);   
    }
    console.log(`Broadcast done\n`);
  }

  // Creates a new block
  public createBlock(transactions: Array<Transaction>, previousHash: string, timestamp: number = 0): Block {
    return {
      transactions,
      previousHash,
      timestamp,
      nonce: 0,
      difficulty: this.difficulty,
    };
  }

  // Validates the block by hashing it and checking if the leading number
  //  of zeroes in the hash match the difficulty
  public validateBlock(block: Block): boolean {
    const difficulty = block.difficulty;
    const blockHash  = hash(stringify(block));
    const zeroString = '0'.repeat(difficulty);

    return blockHash.indexOf(zeroString) === 0;
  }

  // Create block by using all the pending transactions and current timestamp
  //  running the proofOfWork until the valid nunce is found
  // Adds the new mined block to the chain and returns it  
  public mine(): Block {
    const transactions = [...this.pendingTransactions];
    const lastBlock = this.chain[ this.chain.length - 1 ];
    const previousHash = hash(stringify(lastBlock));
    const block = this.createBlock(transactions, previousHash, Date.now());

    const minedBlock = this.proofOfWork(block);

    this.addBlock(minedBlock);

    return minedBlock;
  }

  // Simple Proof of Work Algorithm:
  // Increment the nonce number in the block until the block is valid
  // Returns the valid nunce
  public proofOfWork(block: Block): Block {

    block.nonce = 0;
    
    while (!this.validateBlock(block)) {
      block.nonce += 1;
    }

    return block;
  }

  // Adds a block to the Blockchain and removes all the pending transactiones included in the block
  public addBlock(block: Block) {
    this.chain.push(block);
    
    this.pendingTransactions = this.pendingTransactions
      .filter(transaction => !block.transactions
        .map(blockTransaction => blockTransaction.signature)
        .includes(transaction.signature),
    );
  }
  
  // Send the block to the provided list of nodes
  public async broadcastBlock(block: Block, nodes: Set<string>) {
    for (const node of nodes) {
      console.log(`Sending block to ${ node }`);
      await axios.post(`http://${ node }/blocks`, block);
    }
    console.log(`Broadcast done\n`);
  }

  // Validates the chain by validating each block and checking if previousHash
  //  matches the hash of the previous block in the chain
  public isValid(): boolean {
    
    for (let index = this.chain.length - 1; index > 0; index -= 1) {
      const block = this.chain[index];
      const previusBlock = this.chain[index - 1];
      const previusBlockHash = hash(stringify(previusBlock));

      if (!(this.validateBlock(block) && (block.previousHash === previusBlockHash))) {
        return false;
      }
    }

    return true;

  }

}

export default Miner;
