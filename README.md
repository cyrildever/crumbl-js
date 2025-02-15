# crumbl-js

![GitHub tag (latest by date)](https://img.shields.io/github/v/tag/cyrildever/crumbl-js)
![npm](https://img.shields.io/npm/dw/crumbl-js)
![GitHub last commit](https://img.shields.io/github/last-commit/cyrildever/crumbl-js)
![GitHub issues](https://img.shields.io/github/issues/cyrildever/crumbl-js)
![NPM](https://img.shields.io/npm/l/crumbl-js)

crumbl-js is a JavaScript client developed in TypeScript for generating secure data storage with trusted signing third-parties using the Crumbl&trade; technology patented by Cyril Dever for [Edgewhere](https://www.edgewhere.fr).

If you're interesting in using the library, please [contact Edgewhere](mailto:contact@edgewhere.fr).


### Formal description

For details on the mathematical and protocol foundations, you might want to check out our [white paper](https://github.com/cyrildever/crumbl-js/blob/master/crumbl_whitepaper.pdf).


### Process

The whole process could be divided into two major steps:
* create the _crumbl_ from a source data;
* extract the data out of a _crumbl_.

The first step involves at least two stakeholders, but preferably four for optimal security and sustainability:
* at least one "owner" of the data, ie. the stakeholder that needs to securely store it;
* three signing trusted third-parties who shall remain unaware of the data.

1. Creation

    To create the _crumbl_, one would need the data and the public keys of all the stakeholders, as well as the encryption algorithm used by them.
    Currently, two encryption algorithms are allowed by the system: ECIES and RSA.

    Once created, the _crumbl_ could be stored by anyone: any stakeholder or any outsourced data storage system. 
    The technology guarantees that the _crumbl_ can't be deciphered without the presence of the signing stakeholders, the number of needed stakeholders depending on how many originally signed it, but a data owner must at least be present. In fact, only a data owner will be able to fully recover the original data from the _crumbl_.

2. Extraction

    To extract the data from a _crumbl_ is a multi-step process:
    * First, the data owner should ask the signing trusted third-parties to decipher the parts (the "crumbs") they signed;
    * Each signing trusted third-party should use their own keypair (private and public keys) along with the _crumbl_, and then return the result (the "partial uncrumbs") to the data owner;
    * After, collecting all the partial uncrumbs, the data owner should inject them in the system along with the _crumbl_ and his own keypair to get the fully-deciphered data.


All these steps could be done building an integrated app utilizing the [TypeScript library](#typescript-library) server-side, or the [JavaScript library](#javascript-library) in the browser.


### Usage

#### JavaScript library

```console
npm i crumbl-js
```

The code below should display a new crumbl from the passed credential strings of the stakeholders:
```javascript
import { BrowserWorker, CREATION, ECIES_ALGORITHM, hash } from 'crumbl-js'

function main(owner_pubkey, trustee1_pubkey, trustee2_pubkey) {
  const source = document.getElementById('source').innerHTML;
  hash(source).then(hashedSource => {
    // Feed with the signers' credentials
    const owner = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: Buffer.from(owner_pubkey, 'hex') // ECIES hexadecimal string representation of the decompressed public key
    };
    const trustee1 = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: Buffer.from(trustee1_pubkey, 'hex')
    };
    const trustee2 = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        publicKey: Buffer.from(trustee2_pubkey, 'hex')
    };

    const workerCreator = new BrowserWorker({
        mode: CREATION,
        data: [source],
        verificationHash: hashedSource,
        htmlElement: document.getElementById('crumbled')
    });
    workerCreator.create([owner], [trustee1, trustee2]).then(crumbled => {
        // At this point, the crumbled value would have been assigned to the passed HTML element.
        // But you may want to do something else with it here.
        console.log(crumbled);
    }):
  });
}
```

Following the above situation, using the crumbled data and two "partial uncrumbs" gathered from the trusted signing third-parties, the code below shows how to recover the original source data as a data owner:
```javascript
const workerExtractor = new BrowserWorker({
    mode: EXTRACTION,
    data: [crumbled, partialUncrumb1, partialUncrumb2],
    verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d',
});
workerExtractor.extract(owner, true).then(result => {
  console.assert(result === source, 'Something wrong happened: are you sure you used the right items?');
});
```

If the extracting stakeholder is not the data owner, the result would be a "partial uncrumb" to give to the data owner for processing the complete operation.
For maximum security and sustainability, we recommend the involvement of at least three trusted signing third-parties in the process in addition to the data owner. Please [contact us](mailto:contact@edgewhere.fr) for a complete implementation.

##### Dependencies

This library relies on the following dependencies:
* [`ecies-geth`](https://www.npmjs.com/package/ecies-geth) and [`feistel-cipher`](https://www.npmjs.com/package/feistel-cipher) provided by Cyril Dever for Edgewhere;
* [`buffer-xor`](https://www.npmjs.com/package/buffer-xor);
* [`seedrandom.js`](https://www.npmjs.com/package/seedrandom).

Besides, to run the tests, you would need to install [`live-server`](https://www.npmjs.com/package/live-server):
```console
npm i -g live-server
```


#### Go Library

You might want to check out the Go implementation for the Crumbl&trade;: [`crumbl-exe`](https://github.com/cyrildever/crumbl-exe), an executable and a Go client for generating secure data storage with trusted signing third-parties using the Crumbl&trade; technology patented by Cyril Dever for Edgewhere.


#### Scala Library

You might also want to check out the Scala implementation for the Crumbl&trade;: [`crumbl-jar`](https://github.com/cyrildever/crumbl-jar), a Scala client for the JVM and an executable JAR as well.


### License

The use of the Crumbl&trade; library is subject to fees for commercial purposes and to the respect of the [BSD-2-Clause-Patent License](LICENSE).
All technologies are protected by patents owned by Edgewhere SAS. \
Please [contact Edgewhere](mailto:contact@edgewhere.fr) to get further information.


<hr />
&copy; 2019-2025 Cyril Dever. All rights reserved.