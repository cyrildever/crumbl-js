# crumbl-js

crumbl-js is a Javascript client developed in TypeScript for generating secure data storage with trusted signing third-parties using the Crumbl&trade; technology patented by [Edgewhere](https://www.edgewhere.fr).

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


All these steps could be done building an integrated app utilizing the [Javascript library](#javascript-library) below.


### Usage ###

#### Javascript Library ####

```console
user:~$ npm install crumbl-js
```
_NB: The repository being still private, this kind of installation is not possible for now. See with our team on how to implement it._

```typescript
import * as client from 'crumbl-js'
```

Construct a new `CrumblWorker` client by creating a `Worker` object and passing to its fields all the arguments needed.
Then, launch its process.

For example, the code below creates a new crumbl from the passed data:
```typescript
const worker: client.Worker = {
    mode: client.CREATION,
    input: "",
    output: "myFile.dat",
    ownerKeys: "ecies:path/to/myKey.pub",
    ownerSecret: "",
    signerKeys: "ecies:path/to/trustee1.pub,rsa:path/to/trustee2.pub",
    signerSecret: "",
    verificationHash: "",
    data: ["theDataToCrumbl"]
}
const crumbl = new client.CrumblWorker(worker)
try {
    // Handle promise...
    crumbl.process().then(crumbled => {
        // Do sth with it or use the output file
    })
    // ... or block execution
    const crumbled = await crumbl.process()
} catch (e) {
    console.log(e)
}
```

The value for the fields of the `Worker` are the following:
* `mode`: either `client.CREATION` to crumbl or `client.EXTRACTION` to uncrumbl;
* `input`: path to the file to read an existing crumbl from (WARNING: do not add in the `data` field too);
* `output`: path to a file to save the result to;
* `ownerKeys`: comma-separated list of colon-separated encryption algorithm prefix and filepath to public key of owner(s);
* `ownerSecret`: filepath to the private key of the owner
* `signerKeys`: comma-separated list of colon-separated encryption algorithm prefix and filepath to public key of trusted signer(s);
* `signerSecret`: filepath to the private key of the trusted signer;
* `verificationHash`: optional verification hash of the data;
* `data`: an array of data to use.

The first and only string in the `data` field should be the source to crumbl when using the creation mode.
For the extraction mode, the first string in the `data` field should be the crumbled string, except when the `input` field points to it.
The other strings to provide in the `data` field should be the partial uncrumbs coming from the trustees if the user is one of the data owner.

If the user is one of the trusted signing third-parties, using the extraction mode would return the partial uncrumbs he should return to the owner upon request.

All successful results should start with the hexadecimal representation of the verification hash which can also be computed from the source using the crumbl-js library:
```typescript
const verificationHash = client.hash("theDataToCrumbl")
console.log(verificationHash)
```


### Licence ###

The use of the Crumbl&trade; library for commercial purpose is subject to fees. All technologies are protected by patents owned by Edgewhere.
Please [contact us](mailto:contact@edgehere.fr) to get further information.


<hr />
&copy; 2019-2020 Edgewhere SAS