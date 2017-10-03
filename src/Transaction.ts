
interface Transaction {
  readonly sender : string;
  readonly recipient : string;
  readonly amount : number;
}

export default Transaction;
