'use strict';
const assert = require('assert'), L = require('../lib/logic.js'), fs = require('fs'), path = require('path');
const T = new TextEncoder();
assert.strictEqual(L.md5(T.encode('')), 'd41d8cd98f00b204e9800998ecf8427e');
assert.strictEqual(L.md5(T.encode('abc')), '900150983cd24fb0d6963f7d28e17f72');
assert.strictEqual(L.md5(T.encode('a'.repeat(100))), '36a92cc94a9e0fa21f625f8bfb007adf');
assert.strictEqual(L.b64Decode(L.b64Encode('नमस्ते ✓')), 'नमस्ते ✓');
assert.strictEqual(L.urlDecode('a%20b+c'), 'a b c');
assert.deepStrictEqual(L.jwtDecode('eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig').payload, { sub: '1' });
assert.throws(() => L.jsonFormat('{bad'));
assert.strictEqual(L.jsonFormat('{"a":1}', 0), '{"a":1}');
assert.match(L.uuidV4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
assert.deepStrictEqual(L.diffLines('a\nb\nc', 'a\nc\nd').map((x) => x.t + x.s), [' a', '-b', ' c', '+d']);
assert.strictEqual(L.tsToDate(1700000000).getTime(), 1700000000000);
assert.strictEqual(L.textStats('Hello world. Bye!').words, 3);
assert.strictEqual(L.CASES.camel('hello big-world'), 'helloBigWorld');
assert.strictEqual(L.CASES.sentence('hi there. ok'), 'Hi there. Ok');
assert.strictEqual(L.cleanSpaces('a   b \n\n\n\n c '), 'a b\n\nc');
const e = L.emi(1000000, 10, 120); assert(Math.abs(e.emi - 13215.07) < 0.01, e.emi);
const g = L.gst(1180, 18, true); assert(Math.abs(g.base - 1000) < 1e-9 && Math.abs(g.tax - 180) < 1e-9);
const s = L.sip(5000, 12, 10); assert(Math.abs(s.value - 1161695) < 50, s.value); // standard annuity-due value
const a = L.age(new Date(2000, 0, 31), new Date(2026, 2, 1)); assert.deepStrictEqual([a.y, a.m, a.d], [26, 1, 1]); assert.deepStrictEqual(Object.values(L.age(new Date(1990, 4, 15), new Date(2026, 10, 24))).slice(0, 3), [36, 6, 9]);
assert.strictEqual(L.pct.of(10, 250), 25); assert.strictEqual(L.pct.change(50, 75), 50);
(async () => {
  assert.strictEqual(await L.shaHex('SHA-256', T.encode('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  assert.strictEqual(await L.shaHex('SHA-1', T.encode('abc')), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  console.log('logic tests ok');
})();
