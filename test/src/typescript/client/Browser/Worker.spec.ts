import { Signer } from '../../../../../lib/src/typescript/models/Signer'
import { ECIES_ALGORITHM, BrowserWorker, EXTRACTION } from '../../../../../lib/src/typescript'

describe('Worker', () => {
  describe('extract', () => {
    it('should work with one out of three trustees', async () => {
      const expected = 'c530a35b731dfb63800daded95bd7a20edfd7a4a07898604e42d1829ef5f8e76%02AgICAgJYQVtVU0Q=%03AgICAgICAgICXkE=.1'
      const crumbled = 'c530a35b731dfb63800daded95bd7a20edfd7a4a07898604e42d1829ef5f8e760000a8BIYN/p+IDv3+M2hIStrbxe37yde6HSIrBpI1RE7s5CyJcRmXUlXeCIHeNOqJ54KviUWsO4F5lNlSgjEeXPOD6xawv4gsaBmIS+SgJ32OMoydvg4HsfN1wj0FFzZgoAzpP3ctdufD7nQ+6ePJ4aY3tTT3R00kiBOK0IgqHg==0100a8BCfGiIykusKufdcO7mVZyhb2pYgLH/WMFQWhy1NEWmo066Y4stkCmypUdZNjskT/Het8eStApmMbBoUnhlRFP4GFByhgdo02l20aBlJXhd/eUzf5tEcoUw7BvX0fl6BAFpsAFwIPPIWhCIqmfLqg0xnwl9kb8tkoQJD5pQ==0100a8BGmyq+yTEuEPQisPYpcl01TGachpTcS6P9cXF9CJ8b4qjOrcClpIypwQwyhDzRwpTj5kQRB9JTEsVEZa7BrjSzNkohxHCRzYCJeGNGAiO+DFaPGKtsl85XHAUmyYNNR5XQw7QBpDBSuq/PHmW11hXRTX11BVc2Y96qHmJg==0200a8BPHpBE7lk4BkDLHa5UAokjiatF+nGUkSsiBt2IPHVYJsAfkN+VEYZLZwb6GRHRzmsXgJHbs0mvv9O7kPek0q5ApuS8xfqgbVC8YjVzsxjh5h2uVU9j8cyG5khc+/d8jzG2zIbHw0BbYWqPqfIj95HqHFKWCYdbc7C3h2Cw==0200a8BC/wtxAi+4NF+DD9KnBgRJ5i/OqPbR9cdTl88IG7nZt9MX8gdVCmquiFDYLxGYKiJQigOnCsoOYu058GnqvAKAmtjcCCXxvK1kNnGeXr2gXr6EWMT0DglhzRt/ewyf0q3jvCkCWdR4L/2hGwjtbtvpRaDJAaMYp6kJj3Sw==0300a8BDhSu2Pzpvyb8fy7c6qTYw6L4vWwriPuelwUDN1lrWekxnVMlpRovnC3e1OH0F7HBeN1/4ppZOIEE0E0rg25/CfnS2/rn8fKi92fKXTbEZqdTkTdzrFhiqJgnIcmbpMe1+ecG1mlT+oajGLLMs4SRjoAZDTwqHYWMFe5Yg==0300a8BIAtorVol8KW6XWM9mycS62+GmnOkEj1e9znhW0RnXsPECBDO9SvDoWHCecBW4P3vU7oa24GCJRLAjeCfkpCzVewhCTkYQDYb9C/uUanDblEmazM/hDKiwjeKVaf/JiOtvDdnMJPsrxpXNf6d9wDFjD2/a4q4O82a5m3nQ==.1'
      const user: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('abeb02ac3e5a162314341eb801d652a394b23a48e93cbb1213ce9a85c1a91404', 'hex')
      }
      const workerExtractor = new BrowserWorker({
        mode: EXTRACTION,
        data: [crumbled],
        verificationHash: 'c530a35b731dfb63800daded95bd7a20edfd7a4a07898604e42d1829ef5f8e76'
      })
      const found = await workerExtractor.extract(user, false)
      found.should.equal(expected)
    })
  })
})
