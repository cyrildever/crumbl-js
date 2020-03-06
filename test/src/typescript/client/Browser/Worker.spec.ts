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
    // Equivalent to 'crumble-exe/client/worker_test.go' tests
    it('should decipher data with everything needed', async() => {
      const expected = 'cdever@edgewhere.fr'
      const crumbled = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d0000a8BJM2I8mS/bkFNdZOATg8jHsQbzYp4o5rTqYWkf/pqgvkH7a4OijBxy86W1y2J+pB525jYO4iBuig2JswBdNv++8dkb0GcSXT873M0I5Xma9oM83eHXihOF2rqnqWN/RNZPwJSM23DcCj/xyVs1FK5jWVMGxtMLttIN7vqg==010158KbcQ6boXhkGdXR97+UwSHvt12wEwkVa57e+2m+66sTu32luP00cWET2gb01tgNZYjU621U7u4RI6fmz5kkyTSZtjPJ5wXISTf2wOBv5cY94LvgYoyMFKP9J3mGbPgAKGGsIdY4GCQBx6+Gi7VzfuNxdP1YHAPqcpKXPWiY+nmqYhT7eZVZlmNF1UmkMbgrneYglenmKxWSyUA6P7yMj3LrhlKekWAPdWpMLzRftLh1oH5e2KHkz7Wyh9eYOCKXlQ4sUUm8o3i0Inann41wL0KGaNajPU1RP0M9n3/Zil1/T+ZZcNJgSlQh1mxVKX1ztBRqYNUy+pqDat1qq6ED5r5A==0200a8BIIMyYgouCq7ZVy7S1kRJUl1Lg+aQMHoNeo7SauKwsy//XZ5rJOF4FrYMXmPpu0pf7nwCgAgk6Iv9IQK+WXsKpDE+QazdPpYFtxm4/1qi8qnzG1Wp/9Lf5nFTozacHqghz2e7XkaO1qyLNfmzimpsm6aw/lhEsd+djJ8KA==.1'
      const partialUncrumb1 = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%01AgICBFUDDk4PXEc=.1'
      const partialUncrumb2 = '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d%02AgICAgICAgkYUkI=.1'
      const user: Signer = {
        encryptionAlgorithm: ECIES_ALGORITHM,
        privateKey: Buffer.from('b9fc3b425d6c1745b9c963c97e6e1d4c1db7a093a36e0cf7c0bf85dc1130b8a0', 'hex')
      }
      const workerExtractor = new BrowserWorker({
        mode: EXTRACTION,
        data: [crumbled, partialUncrumb1, partialUncrumb2],
        verificationHash: '580fb8a91f05833200dea7d33536aaec9d7ceb256a9858ee68e330e126ba409d'
      })
      const found = await workerExtractor.extract(user, true)
      found.should.equal(expected)
    })
  })
})
