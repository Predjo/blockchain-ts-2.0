
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as parseArgs from 'minimist';

import Block from './blockchain/Block';
import Transaction from './blockchain/Transaction';
import Miner from './Miner';

// Create our express server
const app = express();
const router = express.Router();
const args = parseArgs(process.argv.slice(2));
const port: number = args.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define our Miner
const miner = new Miner();

// Parse the list of neighbor nodes and register them with the miner
const nodes = args.nodes ? args.nodes.split(',') : [] ;
nodes.forEach(node => miner.registerNode(node));

// REST API

app.post('/transactions/new', (req, res) => {

  const newTransaction: Transaction = miner.createTransaction(miner.publicKey, req.body.recipient, req.body.amount);

  console.log(`Created new transaction ${newTransaction.signature}`);
  console.log('It will be added to the list and shared\n');

  miner.pendingTransactions.push(newTransaction);
  miner.propagateTransaction(newTransaction, miner.nodes).catch(e => console.error(e.message));

  res.status(200).send({
    message: 'Transaction created successfuly',
    transaction: newTransaction,
  });
});

app.get('/mine', (req, res) => {

  if (miner.pendingTransactions.length) {
    const newBlock = miner.mine();

    miner.propagateBlock(newBlock, miner.nodes).catch(e => console.error(e.message));

    res.status(200).send({
      message : 'New Block Forged',
      block : newBlock,
    });
  } else {
    res.status(400).send({
      message : 'No Pending Transactions!',
    });    
  }
});

app.get('/chain', (req, res) => {
  res.status(200).send({
    chain : miner.blockchain.chain,
    length : miner.blockchain.chain.length,
    isValid : miner.blockchain.isValid(),
  });
});

app.post('/transactions', (req, res) => {

  const transaction: Transaction = req.body;
  const isValid = miner.validateTransaction(transaction);
  const isDuplicate = Boolean(miner.pendingTransactions.find(tran => tran.signature === transaction.signature));

  console.log(`Recieved transaction ${transaction.signature}`);

  if (isValid && !isDuplicate) {
    console.log('Transaction is valid, it will be added to the list and shared\n');
    
    miner.pendingTransactions.push(transaction);
    miner.propagateTransaction(transaction, miner.nodes).catch(e => console.error(e.message));
    
  } else {
    console.error('Transaction is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

app.post('/blocks', (req, res) => {

  const block: Block = req.body;
  const isValid = miner.validateBlock(block);
  const isDuplicate = Boolean(miner.blockchain.chain.find(blk => blk.timestamp === block.timestamp));

  console.log('Recieved new block');

  if (isValid && !isDuplicate) {
    console.log('Block is valid, it will be added to the chain and shared\n');
    miner.addBlock(block);
    miner.propagateBlock(block, miner.nodes).catch(e => console.error(e.message));
  } else {
    console.error('Block is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

app.listen(port);

console.log('Hello from the Miner started on ' + port);
console.log('My public address is: ' + miner.publicKey + '\n');
