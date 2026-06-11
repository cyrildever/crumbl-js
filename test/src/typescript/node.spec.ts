// Node (headless / CI) test entry point.
//
// The mirror of browser.spec.ts for a non-browser run: esbuild bundles this to
// CommonJS and mocha executes it directly, so CI needs no live-server / browser.
// BrowserWorker is a plain class (no Web Worker / DOM), so the whole suite runs
// unchanged under node.
//
// Side-effect import 'chai/register-should' installs the `.should` getter at
// runtime and loads its global type augmentation. Chai 6 ships no types, so the
// augmentation comes from @types/chai's register-should.d.ts.
import 'mocha'
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
