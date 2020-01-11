# crumbl-js

crumbl-js is a JavaScript/TypeScript client developed in TypeScript for generating secure data storage with trusted signing third-parties using the Crumbl&trade; technology patented by [Edgewhere](https://www.edgewhere.fr).

If you're interesting in using the library, please [contact us](mailto:contact@edgewhere.fr).

### Process ###

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


### Usage ###

#### TypeScript Library ####

```console
npm install crumbl-js
```
_NB: The repository being still private, this kind of installation is not possible for now. See with our team on how to implement it._

```typescript
import * as crumbljs from 'crumbl-js'
```

Construct a new `CrumblWorker` client by creating a `Worker` object and passing to its fields all the arguments needed.
Then, launch its process.

For example, the code below creates a new crumbl from the passed data:
```typescript
const agent: crumbljs.Agent = {
    mode: crumbljs.CREATION,
    input: "",
    output: "myFile.dat",
    ownerKeys: "ecies:path/to/myKey.pub",
    ownerSecret: "",
    signerKeys: "ecies:path/to/trustee1.pub,rsa:path/to/trustee2.pub",
    signerSecret: "",
    verificationHash: "",
    data: ["theDataToCrumbl"]
}
const crumbl = new crumbljs.ServerWorker(agent)
// Handle promise...
crumbl.process().then(crumbled => {
    // Do sth with it or use the output file
})
// ... or block execution
const crumbled = await crumbl.process()
```

The value for the fields of the `Agent` are the following:
* `mode`: either `crumbljs.CREATION` to crumbl or `crumbljs.EXTRACTION` to uncrumbl;
* `input`: path to the file to read an existing crumbl from (WARNING: do not add it in the `data` field in that case);
* `output`: path to a file to save the result to;
* `ownerKeys`: a comma-separated list of colon-separated encryption algorithm prefix and filepath to public key of owner(s);
* `ownerSecret`: filepath to the private key of the owner;
* `signerKeys`: a comma-separated list of colon-separated encryption algorithm prefix and filepath to public key of trusted signer(s);
* `signerSecret`: filepath to the private key of the trusted signer;
* `verificationHash`: optional verification hash of the data;
* `data`: an array of data to use.

The first and only string in the `data` field should be the source to crumbl when using the creation mode.
For the extraction mode, the first string in the `data` field should be the crumbled string, except when the `input` field points to it.
The other strings to provide in the `data` field should be the partial uncrumbs coming from the trustees if the user is one of the data owner.

If the user is one of the trusted signing third-parties, using the extraction mode would return the partial uncrumbs he should return to the owner upon request.

All successful results should start with the hexadecimal representation of the verification hash which can also be computed from the source using the crumbl-js library:
```typescript
const verificationHash = crumbljs.hash("theDataToCrumbl")
console.log(verificationHash)
```

#### JavaScript library ####

```console
git clone https://github.com/edgewhere/crumbl-js/ && cd crumbl-js && npm i
```
_NB: The repository being still private, this kind of installation is not possible for now. See with our team on how to implement it._

To make it work in the browser, you may use the Javascript library in your html:
```html
<script src="dist/crumbljs.min.js"></script>
```

For example, the code below should display a new crumbl from the passed credential strings of the stakeholders:
```javascript
function main(owner_pubkey, trustee1_pubkey, trustee2_pubkey) {
    const source = document.getElementById('source').innerHTML;

    // Feed with the signers' credentials
    const owner = {
        encryptionAlgorithm: crumbljs.ECIES_ALGORITHM,
        publicKey: crumbljs.string2Buffer(owner_pubkey, 'hex') // ECIES hexadecimal string
    };
    const trustee1 = {
        encryptionAlgorithm: crumbljs.ECIES_ALGORITHM,
        publicKey: crumbljs.string2Buffer(trustee1_pubkey, 'hex')
    };
    const trustee2 = {
        encryptionAlgorithm: crumbljs.RSA_ALGORITHM,
        publicKey: crumbljs.string2Buffer(trustee2_pubkey, 'utf-8') // RSA PEM file content
    };

    const workerCreator = new crumbljs.BrowserWorker({
        mode: crumbljs.CREATION,
        data: [source],
        verificationHash: crumbljs.hash(source),
        htmlElement: document.getElementById('crumbled')
    });
    workerCreator.create([owner], [trustee1, trustee2]).then(crumbled => {
        // At this point, the crumbled value would have been assigned to the passed HTML element.
        // But you may want to do something else with it here.
        console.log(crumbled);
    }
}
```

#### Go Library ####

You might want to check out the Go implementation for the Crumbl&trade;: [`crumbl-exe`](https://github.com/edgewhere/crumbl-exe), an executable and a Go client for generating secure data storage with trusted signing third-parties using the Crumbl&trade; technology patented by Edgewhere.


#### Scala Library ####

You might also want to check out the Scala implementation for the Crumbl&trade;: [`crumbl-jar`](https://github.com/edgewhere/crumbl-jar), a Scala client for the JVM and an executable JAR as well.


### License ###

The use of the Crumbl&trade; library is subject to fees for commercial purposes and to the respect of the [EULA](LICENSE.md) terms for everyone. All technologies are protected by patents owned by Edgewhere SAS.
Please [contact us](mailto:contact@edgehere.fr) to get further information.


<hr />
&copy; 2019-2020 Edgewhere SAS. All rights reserved.