
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

class Blockchain {
  
  public chain: Array<Block> = [];                      // Array of Blocks
  public pendingTransactions: Array<Transaction> = [] ; // Array of transactions waiting for confirmation

  public nodes: Set<string> = new Set(); // Set of neighbouring nodes
  public difficulty: number = 4;         // Mining difficulty
  public reward: number = 10;            // Mining reward

  public publicKey: string;    // Public key used as an address
  private privateKey: string;  // Private key used for signing transactions

  constructor() {

    // Generate public/private key pair using ECDSA
    [this.publicKey, this.privateKey] = generateKeyPair();

    // Create the Genesis Block
    const genesisBlock = this.createBlock([], undefined, 0, 1337);
    this.addBlock(genesisBlock);
  }

  // Add a new node to the list of nodes
  public registerNode(node : string) : void {
    this.nodes.add(node);
  }

  // Creates a new transaction
  public createTransaction(
    sender    : string,
    recipient : string,
    amount    : number,
    coinbase  : boolean = false,
    timestamp : number = Date.now(),
  ): Transaction {
    
    return {
      sender, recipient, amount, coinbase, timestamp,
    };
  }

  // Signes the transaction by hashing the transaction data
  //  and encrypting the hash with the private key
  public signTransaction(transaction: Transaction): Transaction {
    
    const transactionHash: string = hash(stringify(transaction));
    const signature: string = signWithPrivateKey(this.privateKey, transactionHash);
    transaction.signature = signature;
    
    return transaction;
  }


  // Validates transaction by decrypting the transaction signature and comparing
  //  it with the hash of the transaction data
  public validateTransaction(transaction: Transaction): boolean {
    const { signature, ...transactionData } = transaction;

    const transactionHash: string = hash(stringify(transactionData));

    return verifyWithPublicKey(transaction.sender, transactionHash, signature);
  }

  // Add a transaction to the pending list of transactions
  public addTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
  }

  // Send the transaction to the neighboring nodes
  public async broadcastTransaction(transaction: Transaction) {
    for (const node of this.nodes) {
      console.log(`Sending transaction to ${ node }`);
      await axios.post(`http://${ node }/transactions`, transaction);   
    }
    console.log(`Broadcast done\n`);
  }

  // Creates a new Block
  public createBlock(
    transactions : Array<Transaction>,
    previousHash : string,
    timestamp    : number = Date.now(),
    nonce        : number = 0,
  ): Block {
    
    return {
      transactions, previousHash, timestamp, nonce,
      difficulty: this.difficulty,
    };
  }

  // Validates the Block by hashing it and checking if the leading number
  //  of zeroes in the hash matches the difficulty
  public validateBlock(block: Block): boolean {
    const difficulty: number = block.difficulty;
    const blockHash: string  = hash(stringify(block));
    const zeroString: string = '0'.repeat(difficulty);

    return blockHash.indexOf(zeroString) === 0;
  }

  // Creates a coinbase transaction
  // Creates a Block by using the coinbase and all the pending transactions
  // Adds the current timestamp and runs the proofOfWork until the valid Block is found
  // Adds the new mined Block to the chain and returns it  
  public mine(): Block {
    
    // Coinbase transaction
    const coinbaseTransaction: Transaction = this.signTransaction(
      this.createTransaction(this.publicKey, this.publicKey, this.reward, true),
    );
    
    const transactions: Array<Transaction> = [coinbaseTransaction, ...this.pendingTransactions];
    const lastBlock: Block = this.chain[ this.chain.length - 1 ];
    const previousHash: string = hash(stringify(lastBlock));
    const block: Block = this.createBlock(transactions, previousHash, Date.now(), 0);

    const minedBlock: Block = this.proofOfWork(block);

    this.addBlock(minedBlock);

    return minedBlock;
  }

  // Simple Proof of Work Algorithm:
  // Increment the nonce number in the Block until the Block is valid
  // Returns the valid Block
  public proofOfWork(block: Block): Block {

    block.nonce = 0;
    
    while (!this.validateBlock(block)) {
      block.nonce += 1;
    }

    return block;
  }

  // Adds a Block to the Blockchain and removes all the pending transactions included in the Block
  public addBlock(block: Block) {
    this.chain.push(block);
    
    this.pendingTransactions = this.pendingTransactions
      .filter(transaction => !block.transactions
        .map(blockTransaction => blockTransaction.signature)
        .includes(transaction.signature),
    );
  }
  
  // Send the Block to the neighbouring nodes
  public async broadcastBlock(block: Block) {
    for (const node of this.nodes) {
      console.log(`Sending block to ${ node }`);
      await axios.post(`http://${ node }/blocks`, block);
    }
    console.log(`Broadcast done\n`);
  }

  // Validates the chain by validating each Block and checking if previousHash
  //  matches the hash of the previous Block in the chain
  public validateChain(): boolean {
    
    for (let index = this.chain.length - 1; index > 0; index -= 1) {
      const block: Block = this.chain[index];
      const previusBlock: Block = this.chain[index - 1];
      const previusBlockHash: string = hash(stringify(previusBlock));

      if (!(this.validateBlock(block) && (block.previousHash === previusBlockHash))) {
        return false;
      }
    }
    
    return true;
  }
}

export default Blockchain;
