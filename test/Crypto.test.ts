
import { describe, it } from 'mocha';
import { expect } from 'chai';

import {
  hash,
  generateKeyPair,
  signWithPrivateKey,
  verifyWithPublicKey,
} from '../src/blockchain/Crypto';

describe('Crypto', () => {
  
  const [publicKey, privateKey] = generateKeyPair();
  const testString1 = 'Hello World';
  const testString2 = 'Hello World!';

  it('hash function should create a hash from a string', () => {
    const hashString = hash(testString1);
    expect(hashString).to.be.a('string');
    expect(hashString).to.have.lengthOf(64);
  });

  it('hash function should create a different hash for a different string', () => {
    expect(hash(testString1)).to.not.equal(hash(testString2));
  });

  it('generateKeyPair function should generate public/private key pair', () => {
    expect(publicKey).to.be.a('string');
    expect(publicKey).to.have.lengthOf(66);
    expect(privateKey).to.be.a('string');
    expect(privateKey).to.have.lengthOf(32);
  });

  it('hash signed with the private key should be verified with public key', () => {
    const hashString = hash(testString1);
    const signature = signWithPrivateKey(privateKey, hashString);
    expect(verifyWithPublicKey(publicKey, hashString, signature)).to.be.true;
  });

});
