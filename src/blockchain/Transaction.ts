
interface Transaction {
  readonly sender : string;
  readonly recipient : string;
  readonly amount : number;
  readonly timestamp : number;

  signature: string;
}

export default Transaction;
