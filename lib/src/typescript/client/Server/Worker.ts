import fs from 'fs'

import { Crumbl, VERSION } from '../../core/Crumbl'
import { CrumblMode, CREATION, EXTRACTION } from '../index'
import { existsAlgorithm, getKeyBuffer, hash, DEFAULT_HASH_ENGINE, DEFAUT_HASH_LENGTH } from '../../crypto'
import { logger, ERROR, WARNING } from '../../utils/logger'
import { Signer } from '../../models/Signer'
import { Uncrumb, toUncrumb, PARTIAL_PREFIX } from '../../Decrypter/Uncrumb'
import { Uncrumbl } from '../../core/Uncrumbl'

export type Agent = {
    mode: CrumblMode
    data: Array<string>
    input?: string
    output?: string
    ownerKeys?: string
    ownerSecret?: string
    signerKeys?: string
    signerSecret?: string
    verificationHash?: string
    htmlElement?: HTMLElement
}

export class ServerWorker {
    mode: CrumblMode
    data: Array<string>
    input?: string
    output?: string
    ownerKeys?: string
    ownerSecret?: string
    signerKeys?: string
    signerSecret?: string
    verificationHash?: string
    htmlElement?: HTMLElement

    constructor(agent: Agent) {
        this.mode = agent.mode
        this.data = agent.data
        this.input = agent.input
        this.output = agent.output
        this.ownerKeys = agent.ownerKeys
        this.ownerSecret = agent.ownerSecret
        this.signerKeys = agent.signerKeys
        this.signerSecret = agent.signerSecret
        this.verificationHash = agent.verificationHash
        this.htmlElement = agent.htmlElement
    }

    /**
     * Main method to get things done in the Crumbl&trade; system.
     */
    async process(): Promise<string> {
        // Check mode
        if (this.mode != CREATION && this.mode != EXTRACTION) {
            const msg = 'invalid mode: ' + this.mode
            logger.log(msg, ERROR)
            throw new Error(msg)
        }

        // Build data if need be
        if (this.data.length == 0) {
            if (!this.input) {
                const msg = 'invalid data: not enough arguments and/or no input file to use'
                logger.log(msg, ERROR)
                throw new Error(msg)
            } else {
                const content = fs.readFileSync(this.input!)

                // TODO Add multiple-line handling (using one crumbl per line in input file)
                const contentStr = content.toString().replace('/\n/g', ' ')
                this.data = contentStr.split('\\s+')
            }
        } else {
            // Any data in an input file should be prepended to the data from the command-line arguments
            if (this.input) {
                // In this case where there are arguments and an input file, there's no possible multiline handling
                const tmp = this.data
                const content = fs.readFileSync(this.input!)
                const contentStr = content.toString().replace('/\n/g', ' ')
                this.data = contentStr.split('\\s+')
                this.data = this.data.concat(tmp)
            }
        }

        // Get algorithm and keys
        const ownersMap = this.fillMap(this.ownerKeys)
        const signersMap = this.fillMap(this.signerKeys)
        if (ownersMap.size == 0 && (this.mode == CREATION || (this.mode == EXTRACTION && signersMap.size == 0))) {
            const msg = 'missing public key for the data owner'
            logger.log(msg, ERROR)
            throw new Error(msg)
        }
        if (signersMap.size == 0 && (this.mode == CREATION || (this.mode == EXTRACTION && ownersMap.size == 0))) {
            const msg = 'missing public keys for the trusted signers'
            logger.log(msg, ERROR)
            throw new Error(msg)
        }

        // Check data
        if (this.mode == EXTRACTION && (!this.verificationHash || this.verificationHash! == '')) {
            logger.log('verification hash is missing', WARNING)
        }
        if (this.data.length == 0) {
            const msg = 'no data to use'
            logger.log(msg, ERROR)
            throw new Error(msg)
        }
        if (this.mode == CREATION && this.verificationHash) {
            const hashedSource = hash(this.data[0]) // TODO add hashEngine in worker and pass it here?
            if (hashedSource != this.verificationHash) {
                logger.log('verification hash is not coherent with data source', WARNING) // TODO Change it as an error?
            }
        }

        let result = ''
        switch (this.mode) {
            case CREATION: {
                const owners = this.buildSigner(ownersMap)
                const trustees = this.buildSigner(signersMap)

                const crumbl = new Crumbl(this.data[0], DEFAULT_HASH_ENGINE, owners, trustees)
                if (!this.output || this.output! == '') {
                    if (!this.htmlElement) {
                        result = await crumbl.process()
                    } else {
                        result = await crumbl.toHTML(this.htmlElement!)
                    }
                } else {
                    result = await crumbl.toFile(this.output!)
                }
                break
            }
            case EXTRACTION: {
                let user: Signer
                let hasSigner = false
                let isOwner = false
                if (this.ownerSecret && fs.existsSync(this.ownerSecret)) {
                    if (ownersMap.size != 1) {
                        const msg = 'too many public keys for a data owner'
                        logger.log(msg, ERROR)
                        throw new Error(msg)
                    }
                    user = this.getUser(ownersMap, this.ownerSecret!)
                    hasSigner = true
                    isOwner = true
                }
                if (!hasSigner && this.signerSecret && this.signerSecret != '' && fs.existsSync(this.signerSecret!)) {
                    if (signersMap.size != 1) {
                        const msg = 'too many public keys for a single uncrumbler'
                        logger.log(msg, ERROR)
                        throw new Error(msg)
                    }
                    user = this.getUser(signersMap, this.signerSecret!)
                    hasSigner = true
                }
                if (!hasSigner) {
                    const msg = 'invalid keys: no signer was detected'
                    logger.log(msg, ERROR)
                    throw new Error(msg)
                }

                // TODO Add multiple-line handling (using one crumbl per line in input file)
                let uncrumbs = new Array<Uncrumb>()
                if (this.data.length > 1) {
                    for (let i = 1; i < this.data.length; i++) {
                        const parts = this.data[i].split('.', 2)
                        if (parts[1] != VERSION) {
                            logger.log('wrong version for uncrumb: ' + this.data[i], WARNING)
                            continue
                        }
                        const vh = parts[0].substr(0, DEFAUT_HASH_LENGTH)
                        if (vh != '' && vh == this.verificationHash) {
                            const us = parts[0].substr(DEFAUT_HASH_LENGTH)
                            const uncs = us.split(PARTIAL_PREFIX)
                            for (let i = 0; i < uncs.length; i++) {
                                const unc = uncs[i]
                                if (unc != '') {
                                    const uncrumb = toUncrumb(unc)
                                    uncrumbs.push(uncrumb)
                                }
                            }
                        }
                    }
                }

                const uncrumbl = new Uncrumbl(this.data[0], uncrumbs, this.verificationHash!, user!, isOwner)
                if (!this.output || this.output == '') {
                    if (!this.htmlElement) {
                        result = (await uncrumbl.process()).toString()
                    } else {
                        result = (await uncrumbl.toHTML(this.htmlElement!)).toString()
                    }
                } else {
                    result = (await uncrumbl.toFile(this.output!)).toString()
                }
                break
            }
        }

        return result
    }

    private buildSigner(fromMap: Map<string, string>): Array<Signer> {
        let signers = new Array<Signer>()
        if (fromMap.size == 0) {
            return signers
        }
        fromMap.forEach((algo, pk) => {
            const pubkey = getKeyBuffer(pk, algo)
            const signer: Signer = {
                encryptionAlgorithm: algo,
                publicKey: pubkey
            }
            signers.push(signer)
        })
        return signers
    }

    private fillMap(dataKeys?: string): Map<string, string> {
        let map = new Map<string, string>()
        if (!dataKeys) {
            return map
        }
        const dk = dataKeys.split(',')
        for (let i = 0; i < dk.length; i++) {
            const tuple = dk[i]
            if (tuple != '') {
                const parts = tuple.split(':', 2)
                const algo = parts[0]
                const path = parts[1]
                if (path != '' && fs.existsSync(path)) {
                    const key = fs.readFileSync(path).toString()
                    if (existsAlgorithm(algo)) {
                        map.set(key, algo)
                    } else {
                        logger.log('invalid encryption algorithm for owner in ' + tuple, WARNING)
                    }
                } else {
                    if (path) {
                        logger.log('invalid file path for owner in ' + tuple, WARNING)
                    }
                }
            }
        }
        return map
    }

    private getUser(fromMap: Map<string, string>, pathSecret: string): Signer {
        const sk = fs.readFileSync(pathSecret)
        const algo = fromMap.values().next().value
        const privkey = getKeyBuffer(sk.toString(), algo)
        return {
            encryptionAlgorithm: algo,
            privateKey: privkey
        }
    }
}
