/* Pure, DOM-free logic for the toolbox tools. Node-testable (see test/logic.test.js). */
(function (g) {
  'use strict';
  const enc = (s) => new TextEncoder().encode(s);
  const dec = (b) => new TextDecoder('utf-8', { fatal: true }).decode(b);

  // ---- Developer ----
  function jsonFormat(s, indent) { return JSON.stringify(JSON.parse(s), null, indent === undefined ? 2 : indent); }
  function b64FromBytes(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function b64ToBytes(b64) { const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/').replace(/\s+/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  const b64Encode = (s) => b64FromBytes(enc(s));
  const b64Decode = (s) => dec(b64ToBytes(s));
  function urlDecode(s) { return decodeURIComponent(s.replace(/\+/g, ' ')); }
  /** Decode only. Signature is NOT verified. */
  function jwtDecode(t) {
    const p = t.trim().split('.');
    if (p.length < 2) throw new Error('not a JWT');
    return { header: JSON.parse(b64Decode(p[0])), payload: JSON.parse(b64Decode(p[1])), signature: p[2] || '' };
  }
  const hex = (u8) => Array.from(u8, (b) => b.toString(16).padStart(2, '0')).join('');
  async function shaHex(algo, u8) { return hex(new Uint8Array(await crypto.subtle.digest(algo, u8))); }
  /** MD5 (WebCrypto has none). Not for security use. */
  function md5(u8) {
    const K = new Int32Array(64), S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) | 0;
    const n = u8.length, len = ((n + 8) >> 6 << 6) + 64, m = new Uint8Array(len); m.set(u8); m[n] = 0x80;
    const dv = new DataView(m.buffer); dv.setUint32(len - 8, (n << 3) >>> 0, true); dv.setUint32(len - 4, Math.floor(n / 536870912), true);
    let a0 = 0x67452301, b0 = 0xefcdab89 | 0, c0 = 0x98badcfe | 0, d0 = 0x10325476;
    for (let o = 0; o < len; o += 64) {
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, gi;
        if (i < 16) { F = (B & C) | (~B & D); gi = i; } else if (i < 32) { F = (D & B) | (~D & C); gi = (5 * i + 1) & 15; }
        else if (i < 48) { F = B ^ C ^ D; gi = (3 * i + 5) & 15; } else { F = C ^ (B | ~D); gi = (7 * i) & 15; }
        F = (F + A + K[i] + dv.getUint32(o + gi * 4, true)) | 0; A = D; D = C; C = B;
        const s = S[(i >> 4) * 4 + (i & 3)]; B = (B + ((F << s) | (F >>> (32 - s)))) | 0;
      }
      a0 = (a0 + A) | 0; b0 = (b0 + B) | 0; c0 = (c0 + C) | 0; d0 = (d0 + D) | 0;
    }
    const out = new Uint8Array(16), ov = new DataView(out.buffer);
    [a0, b0, c0, d0].forEach((v, i) => ov.setInt32(i * 4, v, true)); return hex(out);
  }
  function uuidV4(rnd) {
    const b = rnd || crypto.getRandomValues(new Uint8Array(16)); b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
    const h = hex(b); return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  /** Line diff via LCS. Returns [{t:' '|'+'|'-', s}]. shortcut: O(n*m) memory, fine for <3000 lines. */
  function diffLines(a, b) {
    const x = a.split('\n'), y = b.split('\n'), n = x.length, m = y.length;
    const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    const out = []; let i = 0, j = 0;
    while (i < n && j < m) { if (x[i] === y[j]) { out.push({ t: ' ', s: x[i] }); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) out.push({ t: '-', s: x[i++] }); else out.push({ t: '+', s: y[j++] }); }
    while (i < n) out.push({ t: '-', s: x[i++] }); while (j < m) out.push({ t: '+', s: y[j++] }); return out;
  }
  /** Epoch seconds or ms (auto by magnitude) <-> ISO. */
  function tsToDate(v) { const n = Number(v); if (!isFinite(n)) throw new Error('bad number'); return new Date(Math.abs(n) < 1e11 ? n * 1000 : n); }

  // ---- Text ----
  function textStats(s) {
    const words = (s.trim().match(/\S+/g) || []).length;
    return { chars: s.length, charsNoSpace: s.replace(/\s/g, '').length, words, lines: s ? s.split('\n').length : 0, sentences: (s.match(/[^.!?।]+[.!?।]+/g) || []).length };
  }
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  const CASES = {
    upper: (s) => s.toUpperCase(), lower: (s) => s.toLowerCase(),
    title: (s) => s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()),
    sentence: (s) => s.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, a, c) => a + c.toUpperCase()),
    camel: (s) => { const w = s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean); return w[0] ? w[0] + w.slice(1).map(cap).join('') : ''; },
    snake: (s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).join('_'),
    kebab: (s) => s.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean).join('-')
  };
  function cleanSpaces(s) { return s.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim(); }

  // ---- India calculators ----
  function emi(P, annualPct, months) {
    if (!(P > 0 && months > 0 && annualPct >= 0)) throw new Error('bad input');
    const r = annualPct / 1200, e = r === 0 ? P / months : P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
    return { emi: e, total: e * months, interest: e * months - P };
  }
  function gst(amount, ratePct, inclusive) {
    if (!(amount >= 0 && ratePct >= 0)) throw new Error('bad input');
    const base = inclusive ? amount / (1 + ratePct / 100) : amount, tax = base * ratePct / 100;
    return { base, tax, cgst: tax / 2, sgst: tax / 2, total: base + tax };
  }
  /** Future value of monthly SIP, payment at start of each month (common calculator convention). */
  function sip(monthly, annualPct, years) {
    if (!(monthly > 0 && years > 0 && annualPct >= 0)) throw new Error('bad input');
    const n = Math.round(years * 12), r = annualPct / 1200, fv = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    return { invested: monthly * n, value: fv, gain: fv - monthly * n };
  }
  function age(dob, on) {
    if (dob > on) throw new Error('dob after date');
    let tm = (on.getFullYear() - dob.getFullYear()) * 12 + on.getMonth() - dob.getMonth();
    const at = (k) => { const t = dob.getMonth() + k, last = new Date(dob.getFullYear(), t + 1, 0).getDate(); return new Date(dob.getFullYear(), t, Math.min(dob.getDate(), last)); };
    if (at(tm) > on) tm--; // anchor = dob + tm months, day clamped to month end
    const y = Math.floor(tm / 12), m = tm % 12, d = Math.round((on - at(tm)) / 864e5);
    let next = new Date(on.getFullYear(), dob.getMonth(), dob.getDate()); if (next < on) next = new Date(on.getFullYear() + 1, dob.getMonth(), dob.getDate());
    return { y, m, d, days: Math.floor((on - dob) / 864e5), nextBirthdayDays: Math.round((next - on) / 864e5) };
  }
  const pct = {
    of: (p, v) => v * p / 100, is: (a, b) => a / b * 100, change: (a, b) => (b - a) / a * 100
  };
  const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

  const api = { jsonFormat, b64Encode, b64Decode, b64FromBytes, b64ToBytes, urlDecode, jwtDecode, md5, shaHex, hex, uuidV4, diffLines, tsToDate, textStats, CASES, cleanSpaces, emi, gst, sip, age, pct, inr };
  g.Logic = api; if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
