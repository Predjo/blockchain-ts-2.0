
import Transaction from './Transaction';

interface Block {
  readonly timestamp : number;
  readonly transactions : Array<Transaction>;
  readonly difficulty : number;
  readonly previousHash? : string;

  nonce : number;
}

export default Block;
