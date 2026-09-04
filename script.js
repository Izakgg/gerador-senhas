// script.js - Gerador de Senhas Seguras
(() => {
  // Elementos
  const out = document.getElementById('passwordOutput');
  const copyBtn = document.getElementById('copyBtn');
  const generateBtn = document.getElementById('generateBtn');
  const regenerateBtn = document.getElementById('regenerateBtn');
  const lengthRange = document.getElementById('lengthRange');
  const lengthValue = document.getElementById('lengthValue');
  const lowercaseChk = document.getElementById('lowercase');
  const uppercaseChk = document.getElementById('uppercase');
  const numbersChk = document.getElementById('numbers');
  const symbolsChk = document.getElementById('symbols');
  const avoidAmbiguousChk = document.getElementById('avoidAmbiguous');
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  const sets = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>/?|~'
  };
  const ambiguous = /[0OIl1]/g;

  lengthValue.textContent = lengthRange.value;

  lengthRange.addEventListener('input', () => {
    lengthValue.textContent = lengthRange.value;
  });

  function buildCharset(opts){
    let charset = '';
    if(opts.lower) charset += sets.lower;
    if(opts.upper) charset += sets.upper;
    if(opts.digits) charset += sets.digits;
    if(opts.symbols) charset += sets.symbols;
    if(opts.avoidAmbiguous) charset = charset.replace(ambiguous, '');
    // dedupe just in case
    charset = Array.from(new Set(charset.split(''))).join('');
    return charset;
  }

  // Secure random int [0, max)
  function secureRandomInt(max){
    // use Uint32 and rejection sampling
    const u32 = new Uint32Array(1);
    const range = max;
    if(range <= 1) return 0;
    const maxUint = 0xFFFFFFFF;
    const bucketSize = Math.floor((maxUint + 1) / range) * range;
    let r;
    do {
      crypto.getRandomValues(u32);
      r = u32[0];
    } while (r >= bucketSize);
    return r % range;
  }

  function generatePassword(length, charset, requireEach=false){
    if(!charset || charset.length === 0) return '';
    const n = charset.length;
    const pwd = [];
    // If requireEach is true, try to include at least one of each selected category (if possible)
    if(requireEach && length >= 1 && Array.isArray(requireEach)){
      // requireEach is array of sample chars (one per category)
      // Place one required char per category at random positions first
      const required = requireEach.slice();
      const positions = [];
      while(positions.length < required.length){
        const pos = secureRandomInt(length);
        if(!positions.includes(pos)) positions.push(pos);
      }
      for(let i=0;i<length;i++) pwd[i] = null;
      for(let i=0;i<required.length;i++){
        pwd[positions[i]] = required[i];
      }
      // Fill remaining
      for(let i=0;i<length;i++){
        if(pwd[i] === null){
          pwd[i] = charset[secureRandomInt(n)];
        }
      }
      return pwd.join('');
    } else {
      for(let i=0;i<length;i++){
        pwd.push(charset[secureRandomInt(n)]);
      }
      return pwd.join('');
    }
  }

  function pickOneFrom(setStr){
    if(!setStr || setStr.length === 0) return '';
    return setStr[secureRandomInt(setStr.length)];
  }

  function calcEntropy(length, charsetSize){
    if(charsetSize <= 1) return 0;
    const bitsPerChar = Math.log2(charsetSize);
    return bitsPerChar * length;
  }

  function strengthLabel(entropy){
    if(entropy < 28) return {label:'Muito fraca', color:'#ff6b6b', pct:20};
    if(entropy < 36) return {label:'Fraca', color:'#ff9f43', pct:40};
    if(entropy < 60) return {label:'Boa', color:'#ffd166', pct:65};
    if(entropy < 80) return {label:'Forte', color:'#6ee7b7', pct:85};
    return {label:'Muito forte', color:'#4ade80', pct:100};
  }

  function updateStrength(entropy){
    const s = strengthLabel(entropy);
    strengthBar.style.width = s.pct + '%';
    strengthBar.style.background = `linear-gradient(90deg, ${s.color}, ${lighten(s.color, 30)})`;
    strengthText.textContent = `${s.label} — ${Math.round(entropy)} bits de entropia`;
  }

  // small helper to lighten hex color by percent
  function lighten(hex, percent){
    try{
      const h = hex.replace('#','');
      const num = parseInt(h,16);
      const r = Math.min(255, ((num >> 16) & 0xff) + Math.round(255 * percent/100));
      const g = Math.min(255, ((num >> 8) & 0xff) + Math.round(255 * percent/100));
      const b = Math.min(255, (num & 0xff) + Math.round(255 * percent/100));
      return `rgb(${r},${g},${b})`;
    }catch(e){
      return hex;
    }
  }

  function getOptionsFromUI(){
    return {
      length: parseInt(lengthRange.value,10),
      lower: lowercaseChk.checked,
      upper: uppercaseChk.checked,
      digits: numbersChk.checked,
      symbols: symbolsChk.checked,
      avoidAmbiguous: avoidAmbiguousChk.checked
    };
  }

  function createAndShowPassword(){
    const opts = getOptionsFromUI();
    const charset = buildCharset(opts);
    if(!charset || charset.length === 0){
      out.value = '';
      strengthText.textContent = 'Selecione ao menos um conjunto de caracteres.';
      strengthBar.style.width = '0%';
      return;
    }

    // If multiple categories selected, try to ensure at least one char of each
    const requiredChunks = [];
    if(opts.lower) requiredChunks.push(pickOneFrom(sets.lower.replace(ambiguous, '')));
    if(opts.upper) requiredChunks.push(pickOneFrom(sets.upper.replace(ambiguous, '')));
    if(opts.digits) requiredChunks.push(pickOneFrom(sets.digits.replace(ambiguous, '')));
    if(opts.symbols) requiredChunks.push(pickOneFrom(sets.symbols.replace(ambiguous, '')));

    const requireEach = requiredChunks.length > 1 && opts.length >= requiredChunks.length ? requiredChunks : false;

    const password = generatePassword(opts.length, charset, requireEach);
    out.value = password;
    const entropy = calcEntropy(opts.length, charset.length);
    updateStrength(entropy);
  }

  // initial generate
  generateBtn.addEventListener('click', () => {
    createAndShowPassword();
    out.focus();
    out.select();
  });

  regenerateBtn.addEventListener('click', () => {
    // regenerate using current options
    createAndShowPassword();
  });

  copyBtn.addEventListener('click', async () => {
    const txt = out.value || '';
    if(!txt) return;
    try {
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = 'Copiado!';
      setTimeout(()=> copyBtn.textContent = 'Copiar', 1400);
    } catch (e) {
      // fallback
      out.select();
      try {
        document.execCommand('copy');
        copyBtn.textContent = 'Copiado!';
        setTimeout(()=> copyBtn.textContent = 'Copiar', 1400);
      } catch (err) {
        alert('Falha ao copiar. Selecione e copie manualmente.');
      }
    }
  });

  // Generate on load
  window.addEventListener('load', () => {
    createAndShowPassword();
  });

})();
