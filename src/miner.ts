
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as parseArgs from 'minimist';

import Block from './blockchain/Block';
import Transaction from './blockchain/Transaction';
import Blockchain from './blockchain/Blockchain';

// Create express server
const app = express();
const router = express.Router();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Parse command line arguments 
const args = parseArgs(process.argv.slice(2));
const port: number = args.port || 3000;

// Define miner
const miner = new Blockchain();

// Parse the list of neighbour nodes and register them with the miner
const nodes = args.nodes ? args.nodes.split(',') : [] ;
nodes.forEach(node => miner.registerNode(node));

// REST API

// Creates a new transaction using the miners public key as a sender address and private
//  key to sign it. After it is created the transaction is added to the pending transaction pool
//  and broadcast to neighboring nodes.
app.post('/transactions/new', (req, res) => {

  const newTransaction: Transaction = miner.createTransaction(miner.publicKey, req.body.recipient, req.body.amount);
  const signedTransaction: Transaction = miner.signTransaction(newTransaction);

  console.log(`Created new transaction ${signedTransaction.signature}`);
  console.log('It will be added to the list and broadcast\n');

  miner.addTransaction(signedTransaction);
  miner.broadcastTransaction(signedTransaction).catch(e => console.error(e.message));

  res.status(200).send({
    message: 'Transaction created successfully',
    transaction: signedTransaction,
  });
});

// Used for broadcasting of transactions.
// If the transaction is valid and not duplicate, it is added to the pending transaction pool. 
// Transaction is then broadcast again. Invalid or duplicate transactions are discarded.
app.post('/transactions', (req, res) => {

  const recievedTransaction: Transaction = req.body;
  const isValid: boolean = miner.validateTransaction(recievedTransaction);
  const isDuplicate: boolean = Boolean(miner.pendingTransactions.find(
    transaction => transaction.signature === recievedTransaction.signature),
  );

  console.log(`Recieved transaction ${recievedTransaction.signature}`);

  if (isValid && !isDuplicate) {
    console.log('Transaction is valid, it will be added to the list and broadcast\n');
    
    miner.addTransaction(recievedTransaction);
    miner.broadcastTransaction(recievedTransaction).catch(e => console.error(e.message));
    
  } else {
    console.error('Transaction is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

// If there are pending transactions it starts the mining process to create a new Block.
// Rewards the miner by creating a coinbase transaction and appending it to the Block
// That in turn creates new coins
// When created, the new Block is added to chain and broadcast to neighboring nodes.
// If no pending transactions it returns 400.
app.get('/mine', (req, res) => {

  if (miner.pendingTransactions.length) {

    console.log('Mining started...');
    const newBlock: Block = miner.mine();
    console.log('Mining complete, new block forged\n');

    miner.broadcastBlock(newBlock).catch(e => console.error(e.message));

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

// Used for broadcasting of Blocks.
// If the Block is valid and not duplicate it is added to the chain. 
// All the transactions included in the Block are removed from the pending transaction pool.
// Block is than broadcast again. Invalid or duplicate Blocks are discarded.
app.post('/blocks', (req, res) => {

  const recievedBlock: Block = req.body;
  const isValid: boolean = miner.validateBlock(recievedBlock);
  const isDuplicate: boolean = Boolean(miner.chain.find(block => block.timestamp === recievedBlock.timestamp));

  console.log('Received new block');

  if (isValid && !isDuplicate) {
    console.log('Block is valid, it will be added to the chain and broadcast\n');
    miner.addBlock(recievedBlock);
    miner.broadcastBlock(recievedBlock).catch(e => console.error(e.message));
  } else {
    console.error('Block is invalid or duplicate and it will be discarded\n');
  }

  res.status(200).send();
});

// Returns the current chain state and validates it.
app.get('/chain', (req, res) => {
  res.status(200).send({
    chain : miner.chain,
    length : miner.chain.length,
    isValid : miner.validateChain(),
  });
});

app.listen(port);

console.log('Hello from the Miner started on ' + port);
console.log('My public address is: ' + miner.publicKey + '\n');
