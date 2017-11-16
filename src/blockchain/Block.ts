
import Transaction from './Transaction';

interface Block {
  transactions: Array<Transaction>; // Array of transactions
  difficulty: number;               // Number representing the mining difficulty
  previousHash?: string;            // Hexadecimal hash of a previous block in the chain
  timestamp?: number;               // Unix time when block was mined
  nonce: number;                    // Cryptographic nonce number used to prove work done to create a block
}

export default Block;
