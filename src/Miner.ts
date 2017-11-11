
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import * as stringify from 'json-stable-stringify';

import Blockchain from './blockchain/Blockchain';
import Transaction from './blockchain/Transaction';
import Block from './blockchain/Block';

import {
  hash,
  generateKeyPair,
  signWithPrivateKey,
  verifyWithPublicKey,
} from './Crypto';

class Miner {

  public nodes: Set<string>;
  
  public blockchain: Blockchain;
  public pendingTransactions: Array<Transaction>;
  public difficulty: number;

  public publicKey: string;
  private privateKey: string;

  constructor() {
    this.nodes = new Set();
    
    this.blockchain = new Blockchain();
    this.pendingTransactions = [];

    // Mining difficulty
    this.difficulty = 4;

    // Generate public/private key pair using ECDSA
    [this.publicKey, this.privateKey] = generateKeyPair();

    // Create Genesis block
    const genesisBlock = this.createBlock([], undefined);
    this.addBlock(genesisBlock);
  }

  // Add a new node to the list of nodes
  public registerNode(node : string) : void {
    this.nodes.add(node);
  }

  // Creates a new transaction and signes it by hashing the transaction data
  //  and encrypting the hash with the private key
  public createTransaction(sender: string, recipient: string, amount: number): Transaction {
    
    const transactionData = {
      sender, recipient, amount, timestamp : Date.now(),
    };

    const transactionHash = hash(stringify(transactionData));

    const signature = signWithPrivateKey(this.privateKey, transactionHash);

    return { ...transactionData, signature };
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
  }

  // Creates a block
  public createBlock(transactions: Array<Transaction>, previousHash: string): Block {
    return {
      transactions,
      previousHash,
      nonce: 0,
      timestamp: Date.now(),
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

  // Create block by using all the pending transactions and running the proofOfWork until
  //  the valid nunce is found
  // Adds the new mined block to the chain and returns it
  
  public mine(): Block {
    const transactions = [...this.pendingTransactions];
    const previousHash = hash(stringify(this.blockchain.lastBlock));
    const block = this.createBlock(transactions, previousHash);

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
    this.blockchain.chain.push(block);
    
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
  }

}

export default Miner;
