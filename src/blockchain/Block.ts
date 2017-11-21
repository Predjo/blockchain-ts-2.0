
import Transaction from './Transaction';

interface Block {
  transactions: Array<Transaction>; // Array of transactions
  previousHash?: string;            // Hexadecimal hash of a previous Block in the chain
  
  timestamp?: number;               // Unix time when Block was mined
  nonce: number;                    // Cryptographic nonce number
  difficulty: number;               // Number representing the mining difficulty
}

export default Block;
