
import Transaction from './Transaction';

interface Block {
  readonly index : number;
  readonly timestamp : number;
  readonly transactions : Array<Transaction>;
  readonly nonce : number;
  readonly difficulty : number;
  readonly previousHash? : string;
}

export default Block;
