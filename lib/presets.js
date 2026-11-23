/* Preset table. verified=true ONLY if the numbers were read from an official notice.
   src = URLs consulted. Unverified presets are shown with a warning in the UI. */
(function (g) {
  const presets = [
    { id: 'ssc-photo', name: 'SSC photo', nameHi: 'SSC फोटो', minKB: 20, maxKB: 50, wCm: 3.5, hCm: 4.5, verified: true, checked: '2026-11-23',
      note: 'Official notice 10.2: "JPEG format (20 KB to 50 KB)... about 3.5 cm (width) x 4.5 cm (height)", colour. Notice is 2022; newer SSC notices may differ.',
      src: ['https://ssckkr.kar.nic.in/CHSLE2022.pdf'] },
    { id: 'ssc-sign', name: 'SSC signature', nameHi: 'SSC हस्ताक्षर', minKB: 10, maxKB: 20, wCm: 4, hCm: 2, verified: true, checked: '2026-11-23',
      note: 'Official notice Annexure-IV: "JPEG format (10 to 20 KB)... about 4.0 cm (width) x 2.0 cm (height)". Notice is 2022.',
      src: ['https://ssckkr.kar.nic.in/CHSLE2022.pdf'] },
    { id: 'upsc-photo', name: 'UPSC photo', nameHi: 'UPSC फोटो', minKB: 20, maxKB: 200, wPx: 550, hPx: 550, verified: false, checked: '2026-11-23',
      note: 'Official FAQ (upsconline.gov.in): photo 20-300 KB, 550-1000 px per side, JPG. 2026 notices reportedly say 20-200 KB, so 200 KB cap is used (fits both). Notice PDFs not fetched.',
      src: ['https://upsconline.gov.in/upsc/OTRP/candidate/FAQs.pdf'] },
    { id: 'upsc-sign', name: 'UPSC signature', nameHi: 'UPSC हस्ताक्षर', minKB: 20, maxKB: 100, wPx: 350, hPx: 350, verified: false, checked: '2026-11-23',
      note: 'Official FAQ (upsconline.gov.in): signature 20-300 KB, 350-500 px per side. 2026 notices reportedly say 20-100 KB, so 100 KB cap is used (fits both).',
      src: ['https://upsconline.gov.in/upsc/OTRP/candidate/FAQs.pdf'] },
    { id: 'ibps-photo', name: 'IBPS photo', nameHi: 'IBPS फोटो', minKB: 20, maxKB: 50, wPx: 200, hPx: 230, verified: true, checked: '2026-11-23',
      note: 'Official IBPS guideline (RBI Jan 2026 recruitment): "200 x 230 pixels (preferred)... between 20kb-50 kb", 4.5cm x 3.5cm.',
      src: ['https://ibpsreg.ibps.in/rbijan26/uploads/loadpdf.php'] },
    { id: 'ibps-sign', name: 'IBPS signature', nameHi: 'IBPS हस्ताक्षर', minKB: 10, maxKB: 20, wPx: 140, hPx: 60, verified: true, checked: '2026-11-23',
      note: 'Official IBPS guideline (RBI Jan 2026): "140 x 60 pixels (preferred)... between 10kb - 20kb".',
      src: ['https://ibpsreg.ibps.in/rbijan26/uploads/loadpdf.php'] },
    { id: 'neet-photo', name: 'NEET UG photo', nameHi: 'NEET UG फोटो', minKB: 10, maxKB: 200, verified: true, checked: '2026-11-23',
      note: 'Official NEET (UG) 2026 bulletin: "JPG/JPEG... between 10 kb to 200 kb". No pixel size stated.',
      src: ['https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf'] },
    { id: 'neet-sign', name: 'NEET UG signature', nameHi: 'NEET UG हस्ताक्षर', minKB: 10, maxKB: 100, verified: true, checked: '2026-11-23',
      note: 'Official NEET (UG) 2026 bulletin: "JPG/JPEG between 10 kb to 100 kb" (corrected from 4-30 KB).',
      src: ['https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/02/202602231394640855.pdf'] },
    { id: 'rrb-photo', name: 'Railway (RRB) photo', nameHi: 'रेलवे फोटो', minKB: 20, maxKB: 50, wCm: 3.5, hCm: 4.5, verified: false, checked: '2026-11-23',
      note: 'Varies per CEN: NTPC Graduate 05/2024 says 20-50 KB, 35x45 mm; NTPC UG 06/2024 says 30-70 KB; ALP 01/2025 says 100-150 KB. Check your CEN.',
      src: ['https://rrbahmedabad.gov.in/wp-content/uploads/2024/09/CEN-05-2024-NTPC-Graduate_a11y.pdf', 'https://www.rrbcdg.gov.in/uploads/2024/06-NTPCUG/Detailed%20CEN%2006-2024%20NTPC.pdf'] },
    { id: 'passport', name: 'Passport 3.5x4.5 cm', nameHi: 'पासपोर्ट 3.5x4.5 सेमी', minKB: 10, maxKB: 100, wCm: 3.5, hCm: 4.5, verified: false, checked: '2026-11-23',
      note: 'Official: 4.5 x 3.5 cm, plain white background, colour. No KB rule found (portal upload page unreachable, HTTP 503): 10-100 KB is a safe default.',
      src: ['https://www.passportindia.gov.in/AppOnlineProject/pdf/ApplicationformInstructionBooklet-V3.0.pdf'] }
  ];
  g.PRESETS = presets;
  if (typeof module !== 'undefined') module.exports = presets;
})(typeof window !== 'undefined' ? window : globalThis);
