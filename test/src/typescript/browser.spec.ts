// Browser test entry point.
//
// browserify used to concatenate every compiled *.spec.js into a single bundle.
// esbuild bundles from a single entry, so this file imports all the spec files
// instead. It also wires up the two chai globals the specs depend on, which the
// HTML page used to provide via the standalone chai.js script:
//   - `.should`  -> registered as a side effect by 'chai/register-should'
//   - `expect`   -> the specs reference a bare `expect` (declared ambient), so
//                   it is published on the global scope here.
//
// Side-effect import 'chai/register-should' installs the `.should` getter at
// runtime and loads its global type augmentation. Chai 6 ships no types, so the
// augmentation comes from @types/chai's register-should.d.ts.
import { expect } from 'chai'
import 'chai/register-should'

;(globalThis as unknown as { expect: typeof expect }).expect = expect

import './index.spec'
import './client/Browser/Worker.spec'
import './core/Crumbl.spec'
import './core/Uncrumbl.spec'
import './crypto/index.spec'
import './crypto/ecies/index.spec'
import './Decrypter/Uncrumb.spec'
import './Encrypter/Crumb.spec'
import './Encrypter/Dispatcher.spec'
import './Hasher/index.spec'
import './models/Base64/index.spec'
import './Obfuscator/index.spec'
import './Padder/index.spec'
import './Slicer/index.spec'
