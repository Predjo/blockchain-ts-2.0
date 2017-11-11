
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as parseArgs from 'minimist';

import Block from './blockchain/Block';
import Transaction from './blockchain/Transaction';
import Blockchain from './blockchain/Blockchain';

// Create our express server
const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Parse command line arguments 
const args = parseArgs(process.argv.slice(2));
const port: number = args.port || 3000;

// Define our miner
const miner = new Blockchain();

// Parse the list of neighbor nodes and register them with the miner
const nodes = args.nodes ? args.nodes.split(',') : [] ;
nodes.forEach(node => miner.registerNode(node));

// REST API
app.post('/transactions/new', (req, res) => {

  const newTransaction: Transaction = miner.createTransaction(miner.publicKey, req.body.recipient, req.body.amount);
  const signedTransaction: Transaction = miner.signTransaction(newTransaction);

  console.log(`Created new transaction ${signedTransaction.signature}`);
  console.log('It will be added to the list and shared\n');

  miner.pendingTransactions.push(signedTransaction);
  miner.broadcastTransaction(signedTransaction, miner.nodes).catch(e => console.error(e.message));

  res.status(200).send({
    message: 'Transaction created successfuly',
    transaction: signedTransaction,
  });
});

app.get('/mine', (req, res) => {

  if (miner.pendingTransactions.length) {

    console.log('Mining started...');

    const newBlock = miner.mine();

    console.log('Mining complete, new block forged\n');

    miner.broadcastBlock(newBlock, miner.nodes).catch(e => console.error(e.message));

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
    chain : miner.chain,
    length : miner.chain.length,
    isValid : miner.isValid(),
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
    miner.broadcastTransaction(transaction, miner.nodes).catch(e => console.error(e.message));
    
  } else {
    console.error('Transaction is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

app.post('/blocks', (req, res) => {

  const block: Block = req.body;
  const isValid = miner.validateBlock(block);
  const isDuplicate = Boolean(miner.chain.find(blk => blk.timestamp === block.timestamp));

  console.log('Recieved new block');

  if (isValid && !isDuplicate) {
    console.log('Block is valid, it will be added to the chain and shared\n');
    miner.addBlock(block);
    miner.broadcastBlock(block, miner.nodes).catch(e => console.error(e.message));
  } else {
    console.error('Block is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

app.listen(port);

console.log('Hello from the Miner started on ' + port);
console.log('My public address is: ' + miner.publicKey + '\n');
