
interface Transaction {
  readonly sender: string; // Public key address of a transaction sender 
  readonly recipient: string; // Public key address of a transaction recipient
  readonly amount: number; // Amount of coins to be transfered
  readonly timestamp: number; // Unix time when transaction was created
  readonly coinbase: boolean; // True if its a coinbase transaction ie. transaction that awards the miner and creates new coins

  readonly signature?: string; // Transaction hash encrypted with the private key of the sender
}

export default Transaction;
