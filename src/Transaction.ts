
interface Transaction {
  readonly sender: string;
  readonly recipient: string;
  readonly amount: number;
  readonly timestamp: number;

  readonly signature?: string;
}

export default Transaction;
