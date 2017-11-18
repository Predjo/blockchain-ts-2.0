
interface Transaction {
  sender: string;     // Public key address of a transaction sender 
  recipient: string;  // Public key address of a transaction recipient
  amount: number;     // Amount of coins to be transferred
  timestamp: number;  // Unix time when transaction was created
  coinbase: boolean;  // True if it's a coinbase transaction ie. transaction that awards the miner and creates new coins

  signature?: string; // Transaction hash encrypted with the private key of the sender
}

export default Transaction;
