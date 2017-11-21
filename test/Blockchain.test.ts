
import { expect } from 'chai';

import Blockchain from '../src/blockchain/Blockchain';

describe('Blockchain', () => {

  it('should initialize correctly', () => {

    const miner = new Blockchain();

    expect(miner.chain).to.have.length(1);
    expect(miner.chain[0].timestamp).to.equal(0);
    expect(miner.chain[0].nonce).to.equal(1337);
    expect(miner.pendingTransactions).to.have.length(0);
    expect(miner.reward).to.equal(10);
    expect(miner.difficulty).to.equal(4);
    expect(miner.publicKey).to.be.a('string');
    expect(miner.publicKey).to.have.lengthOf(66);
  });


  it('createTransaction should create a transaction', () => {
    const miner = new Blockchain();
    const newTransaction = miner.createTransaction(miner.publicKey, 'recipient address', 5, false);

    expect(newTransaction).to.be.a('object');
    expect(newTransaction.sender).to.equal(miner.publicKey);
    expect(newTransaction.amount).to.equal(5);
  });

  

  it('signTransaction should sign a transaction', () => {
    const miner = new Blockchain();
    const newTransaction = miner.createTransaction(miner.publicKey, 'recipient address', 5, false);
    const signedTransaction = miner.signTransaction(newTransaction);
    
    expect(signedTransaction.signature).to.be.a('string');
  });

  it('validateTransaction should validate a signed transaction', () => {
    const miner = new Blockchain();
    const newTransaction = miner.createTransaction(miner.publicKey, 'recipient address', 5, false);
    const signedTransaction = miner.signTransaction(newTransaction);

    expect(miner.validateTransaction(signedTransaction)).to.be.true;
  });

  it('mine should create a new block, include coinbase transaction, run proofOfWork, validate the chain', () => {

    const miner = new Blockchain();
    const newTransaction = miner.createTransaction(miner.publicKey, 'recipient address', 5, false);
    const signedTransaction = miner.signTransaction(newTransaction);

    miner.addTransaction(signedTransaction);

    // Reduce dificulty to speed up the test
    miner.difficulty = 2;

    const newBlock = miner.mine();
    
    expect(newBlock).to.be.a('object');
    expect(newBlock.nonce).to.be.a('number');
    expect(newBlock.timestamp).to.be.a('number');

    expect(miner.validateBlock(newBlock)).to.be.true;

    expect(newBlock.transactions).to.have.length(2);
    expect(newBlock.transactions[0].coinbase).to.be.true;
    expect(newBlock.transactions[1].coinbase).to.be.false;

    expect(miner.validateChain()).to.be.true;
  });
});
