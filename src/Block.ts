
import Transaction from './Transaction';

interface Block {
  readonly transactions: Array<Transaction>;
  readonly difficulty: number;
  readonly previousHash?: string;
  
  timestamp: number;
  nonce: number;
}

export default Block;
