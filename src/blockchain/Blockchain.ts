
import Block from './Block';
import Transaction from './Transaction';

class Blockchain {

  public chain: Array<Block>;

  constructor() {
    this.chain = [];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // Determine if our blockchain is valid
  isValid(): boolean {
    return true;
  }
}

export default Blockchain;


