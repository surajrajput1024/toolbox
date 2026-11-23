/* Tool registry (metadata only; tool code loads lazily from js/tools/<mod>.js). */
(function (g) {
  const C = {
    pdf: { n: ['PDF tools', 'PDF टूल्स'], mod: 'pdf' }, img: { n: ['Image tools', 'फोटो टूल्स'], mod: 'image' },
    dev: { n: ['Developer', 'डेवलपर'], mod: 'dev' }, txt: { n: ['Text', 'टेक्स्ट'], mod: 'text' }, calc: { n: ['India calculators', 'भारत कैलकुलेटर'], mod: 'calc' }
  };
  const T = (id, cat, icon, en, hi, de, dh, kw) => ({ id, cat, icon, en, hi, de, dh, kw: kw || '' });
  const TOOLS = [
    T('form-photo', 'img', 'user', 'Form Photo & Signature', 'फॉर्म फोटो और हस्ताक्षर', 'Exam presets: SSC, UPSC, IBPS, NEET', 'परीक्षा साइज़: SSC, UPSC, IBPS, NEET', 'ssc upsc ibps neet railway passport photo signature kb resize exam form'),
    T('img-resize', 'img', 'resize', 'Resize image', 'फोटो रिसाइज़', 'Change width and height', 'चौड़ाई और ऊँचाई बदलें', 'resize pixels dimension scale'),
    T('img-compress', 'img', 'shrink', 'Compress image to KB', 'फोटो KB में छोटी करें', 'Hit a target size like 50 KB', '50 KB जैसा टारगेट साइज़', 'compress reduce size kb jpg'),
    T('img-convert', 'img', 'swap', 'Convert JPG PNG WebP', 'JPG PNG WebP बदलें', 'Switch image format', 'फोटो का फॉर्मेट बदलें', 'convert format jpg jpeg png webp'),
    T('img-crop', 'img', 'crop', 'Crop & rotate', 'क्रॉप और रोटेट', 'Crop to ratio, rotate, flip', 'क्रॉप, घुमाएँ, पलटें', 'crop rotate flip'),
    T('signature', 'img', 'pen', 'Signature resize', 'हस्ताक्षर रिसाइज़', 'Signature size for forms', 'फॉर्म के लिए हस्ताक्षर साइज़', 'signature sign hastakshar'),
    T('pdf-from-images', 'pdf', 'imgpdf', 'Images to PDF', 'फोटो से PDF', 'Combine photos into one PDF', 'फोटो जोड़कर एक PDF', 'jpg to pdf image convert'),
    T('pdf-merge', 'pdf', 'merge', 'Merge PDF', 'PDF जोड़ें', 'Join PDFs in order', 'कई PDF को एक करें', 'merge combine join'),
    T('pdf-split', 'pdf', 'split', 'Split / extract pages', 'PDF पेज अलग करें', 'Keep only pages you pick', 'चुने हुए पेज निकालें', 'split extract pages delete'),
    T('pdf-compress', 'pdf', 'shrink', 'Compress PDF to KB', 'PDF KB में छोटी करें', 'Best-effort target size', 'टारगेट साइज़ तक छोटी करें', 'compress reduce pdf size kb'),
    T('pdf-to-images', 'pdf', 'images', 'PDF to images', 'PDF से फोटो', 'Every page as JPG or PNG', 'हर पेज फोटो में', 'pdf to jpg png'),
    T('json', 'dev', 'braces', 'JSON formatter', 'JSON फॉर्मेटर', 'Format, validate, minify', 'फॉर्मेट, जाँच, मिनिफ़ाई', 'json pretty validate minify'),
    T('base64', 'dev', 'code', 'Base64', 'Base64', 'Encode or decode text and files', 'टेक्स्ट और फाइल एन्कोड/डिकोड', 'base64 encode decode'),
    T('url', 'dev', 'link', 'URL encode/decode', 'URL एन्कोड/डिकोड', 'Percent-encoding', 'URL को एन्कोड/डिकोड करें', 'url encode decode percent'),
    T('jwt', 'dev', 'key', 'JWT decoder', 'JWT डिकोडर', 'Read a token (no verification)', 'टोकन पढ़ें (सत्यापन नहीं)', 'jwt token decode'),
    T('hash', 'dev', 'hash', 'Hash generator', 'हैश जनरेटर', 'MD5, SHA-1, SHA-256', 'MD5, SHA-1, SHA-256', 'hash md5 sha1 sha256 checksum'),
    T('uuid', 'dev', 'id', 'UUID generator', 'UUID जनरेटर', 'Random v4 IDs', 'रैंडम v4 आईडी', 'uuid guid'),
    T('timestamp', 'dev', 'clock', 'Unix timestamp', 'यूनिक्स टाइमस्टैम्प', 'Epoch to date and back', 'एपोक से तारीख और उल्टा', 'unix epoch timestamp date'),
    T('regex', 'dev', 'regex', 'Regex tester', 'रेगेक्स टेस्टर', 'Test patterns live', 'पैटर्न तुरंत जाँचें', 'regex regular expression'),
    T('diff', 'dev', 'diff', 'Text diff', 'टेक्स्ट अंतर', 'Compare two texts', 'दो टेक्स्ट की तुलना', 'diff compare'),
    T('word-count', 'txt', 'count', 'Word & character count', 'शब्द और अक्षर गिनती', 'Words, characters, lines', 'शब्द, अक्षर, लाइन', 'word count character counter'),
    T('case', 'txt', 'case', 'Case converter', 'केस बदलें', 'UPPER, lower, Title, camel', 'UPPER, lower, Title, camel', 'case upper lower title'),
    T('spaces', 'txt', 'space', 'Remove extra spaces', 'फालतू स्पेस हटाएँ', 'Clean spaces and blank lines', 'स्पेस और खाली लाइन साफ करें', 'trim spaces whitespace'),
    T('age', 'calc', 'cake', 'Age calculator', 'उम्र कैलकुलेटर', 'Age in years, months, days', 'साल, महीने, दिन में उम्र', 'age dob birthday'),
    T('emi', 'calc', 'bank', 'EMI calculator', 'EMI कैलकुलेटर', 'Loan EMI and interest', 'लोन EMI और ब्याज', 'emi loan interest'),
    T('gst', 'calc', 'receipt', 'GST calculator', 'GST कैलकुलेटर', 'Add or remove GST', 'GST जोड़ें या हटाएँ', 'gst tax cgst sgst'),
    T('percent', 'calc', 'percent', 'Percentage calculator', 'प्रतिशत कैलकुलेटर', 'Percent of, change, share', 'प्रतिशत, बदलाव', 'percentage percent'),
    T('sip', 'calc', 'trend', 'SIP calculator', 'SIP कैलकुलेटर', 'Mutual fund SIP returns', 'म्यूचुअल फंड SIP रिटर्न', 'sip mutual fund investment')
  ];
  g.TB_CATS = C; g.TB_TOOLS = TOOLS; if (typeof module !== 'undefined') module.exports = { C, TOOLS };
})(typeof window !== 'undefined' ? window : globalThis);
