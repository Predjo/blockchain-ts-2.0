
import Transaction from './Transaction';

interface Block {
  transactions: Array<Transaction>; // Array of transactions
  difficulty: number;               // Number representing the mining difficulty
  previousHash?: string;            // Hexadecimal hash of a previous Block in the chain
  timestamp?: number;               // Unix time when Block was mined
  nonce: number;                    // Cryptographic nonce number used to prove work that is done to create a Block
}

export default Block;
