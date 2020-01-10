import { Crumbl, VERSION } from '../../core/Crumbl'
import { CrumblMode, CREATION, EXTRACTION } from '../index'
import { hash, DEFAULT_HASH_ENGINE, DEFAUT_HASH_LENGTH } from '../../crypto'
import { logger, ERROR, WARNING } from '../../utils/logger'
import { Signer } from '../../models/Signer'
import { Uncrumb, PARTIAL_PREFIX, toUncrumb } from '../../Decrypter/Uncrumb'
import { Uncrumbl } from '../../core/Uncrumbl'

export type Params = {
    mode: CrumblMode
    data: Array<string>
    verificationHash?: string
    htmlElement?: HTMLElement
}

export class BrowserWorker {
    mode: CrumblMode
    data: Array<string>
    verificationHash?: string
    htmlElement?: HTMLElement

    constructor(p: Params) {
        this.mode = p.mode
        this.data = p.data
        this.verificationHash = p.verificationHash
        this.htmlElement = p.htmlElement

        // Check data
        if (this.data.length == 0) {
            const msg = 'no data to use'
            logger.log(msg, ERROR)
            throw new Error(msg)
        }
    }

    /**
     * Create a new crumbl using the passed credentials
     * 
     * @param owners    A list of data owners
     * @param trustees  A list of third-party signers
     */
    async create(owners: Array<Signer>, trustees: Array<Signer>): Promise<string> {
        // Check mode coherence
        if (this.mode != CREATION) {
            const msg = 'invalid mode: ' + this.mode
            logger.log(msg, ERROR)
            throw new Error(msg)
        }

        // Build returned result
        let result = ''
        const crumbl = new Crumbl(this.data[0], DEFAULT_HASH_ENGINE, owners, trustees)
        if (!this.htmlElement) {
            result = await crumbl.process()
        } else {
            result = await crumbl.toHTML(this.htmlElement!)
        }

        return result
    }

    /**
     * Extract either the partial uncrumbs or the fully-decrypted value for the passed signer
     * 
     * @param user      The signer credentials
     * @param isOwner   Pass `true` if the user is a data owner, `false` otherwise
     */
    async extract(user: Signer, isOwner: boolean): Promise<string> {
        // Check mode coherence
        if (this.mode != EXTRACTION) {
            const msg = 'invalid mode: ' + this.mode
            logger.log(msg, ERROR)
            throw new Error(msg)
        }

        // Get the partial uncrumbs
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

        // Build returned result
        let result = ''
        const uncrumbl = new Uncrumbl(this.data[0], uncrumbs, this.verificationHash!, user, isOwner)
        if (!this.htmlElement) {
            result = (await uncrumbl.process()).toString()
        } else {
            result = (await uncrumbl.toHTML(this.htmlElement!)).toString()
        }

        // Check verification hash
        if (!this.verificationHash || this.verificationHash! == '') {
            logger.log('verification hash is missing', WARNING)
        } else if (this.verificationHash && isOwner) {
            const hashedResult = hash(result) // TODO add hashEngine in worker and pass it here?
            if (hashedResult != this.verificationHash) {
                logger.log('verification hash is not coherent with uncrumbled data', WARNING) // TODO Change it as an error?
            }
        }

        return result
    }
}