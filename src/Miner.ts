
import * as crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';
import { URL } from 'url';

import Blockchain from './blockchain/Blockchain';
import Transaction from './blockchain/Transaction';

class Miner {

  public nodes : Set<string>;
  public blockChain : Blockchain;
  public difficulty : number;
  public pendingTransactions : Array<Transaction>;

  public publicKey : string;
  private privateKey : string;

  constructor() {

    this.blockChain = new Blockchain();
    this.pendingTransactions = [];
    this.nodes = new Set();

    // Mining difficulty
    this.difficulty = 4;
  }

  private createKeyPair(): void {
    const ecdh = crypto.createECDH('secp521r1');
    const keys = ecdh.generateKeys();

    console.log(keys);
  }

  // Add a new node to the list of nodes
  public registerNode(address : string) : void {
    const parsedURL = new URL(address);
    this.nodes.add(parsedURL.host);
  }

}

export default Miner;

