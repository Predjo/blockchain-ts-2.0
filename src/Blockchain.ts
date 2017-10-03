
import Block from './Block';
import Transaction from './Transaction';

class Blockchain {

  chain : Array<any>;
  currentTransactions : Array<Transaction>;

  constructor() {

    this.chain = [];
    this.currentTransactions = [];
  }

  // Creates a new Block and adds it to the chain
  newBlock(proof : number, previousHash? : string) : Block {
    
    const block : Block = {
      proof, previousHash,
      index : this.chain.length,
      timestamp : Date.now(),
      transactions : [...this.currentTransactions],
    };

    this.currentTransactions = [];

    this.chain.push(block);
    return block;
  }

  // Adds a new transaction to the list of transactions
  newTransaction(sender : string, recipient : string, amount : number) : number {
    const transaction : Transaction = {
      sender, recipient, amount,
    };

    return this.currentTransactions.push(transaction) - 1;
  }

  get lastBlock() {
    return this.chain[Math.max(0, this.chain.length - 1)];
  }

  // Hashes a Block
  static hash() {

  }
}
