
interface Transaction {
  readonly sender: string; // Hexadecimal hash address of a transaction sender 
  readonly recipient: string; // Hexadecimal hash address of a transaction recipient
  readonly amount: number; // Amount of coins to be transfered
  readonly timestamp: number; // Unix time when transaction was created

  readonly signature?: string; // Transaction hash encrypted with the private key of the sender
}

export default Transaction;
