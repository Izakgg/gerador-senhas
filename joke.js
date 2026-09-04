// joke.js - Gerador de piadas aleatórias com fallback
(() => {
  const jokeOut = document.getElementById('jokeOutput');
  const newJokeBtn = document.getElementById('newJokeBtn');
  const anotherBtn = document.getElementById('anotherBtn');
  const copyBtn = document.getElementById('copyJokeBtn');
  const status = document.getElementById('status');
  const explicitChk = document.getElementById('explicit');

  // Primary API: icanhazdadjoke (Accept: application/json)
  // Fallback: JokeAPI (v2) https://v2.jokeapi.dev

  async function fetchWithTimeout(resource, options = {}){
    const { timeout = 7000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try{
      const res = await fetch(resource, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    }catch(err){
      clearTimeout(id);
      throw err;
    }
  }

  async function fetchJoke(){
    status.textContent = 'Buscando piada...';
    // try icanhazdadjoke
    try{
      const res = await fetchWithTimeout('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json' },
        timeout: 5000
      });
      if(res.ok){
        const data = await res.json();
        if(data && data.joke){
          return {text: data.joke, source: 'icanhazdadjoke'};
        }
      }
    }catch(e){
      // continue to fallback
      console.debug('icanhazdadjoke failed', e);
    }

    // fallback to JokeAPI
    try{
      // include or exclude explicit content
      const safeParam = explicitChk && !explicitChk.checked ? '&blacklistFlags=nsfw,religious,political,racist,sexist,explicit' : '';
      const url = `https://v2.jokeapi.dev/joke/Any?type=single${safeParam}`;
      const res2 = await fetchWithTimeout(url, { timeout: 7000 });
      if(res2.ok){
        const d2 = await res2.json();
        if(d2 && d2.joke){
          return {text: d2.joke, source: 'JokeAPI'};
        }
        if(d2 && d2.setup && d2.delivery){
          return {text: `${d2.setup}\n\n${d2.delivery}`, source: 'JokeAPI'};
        }
      }
    }catch(e){
      console.debug('JokeAPI failed', e);
    }

    throw new Error('Não foi possível obter uma piada das APIs externas.');
  }

  async function showJoke(){
    try{
      newJokeBtn.disabled = true;
      anotherBtn.disabled = true;
      status.textContent = 'Carregando...';
      const j = await fetchJoke();
      jokeOut.value = j.text;
      status.textContent = `Fonte: ${j.source}`;
    }catch(err){
      jokeOut.value = '';
      status.textContent = err.message || 'Erro ao buscar piada.';
    }finally{
      newJokeBtn.disabled = false;
      anotherBtn.disabled = false;
    }
  }

  newJokeBtn.addEventListener('click', () => {
    showJoke();
  });
  anotherBtn.addEventListener('click', () => showJoke());

  copyBtn.addEventListener('click', async () => {
    const txt = jokeOut.value || '';
    if(!txt) return;
    try{
      await navigator.clipboard.writeText(txt);
      copyBtn.textContent = 'Copiado!';
      setTimeout(()=> copyBtn.textContent = 'Copiar', 1400);
    }catch(e){
      try{ document.execCommand('copy'); copyBtn.textContent = 'Copiado!'; setTimeout(()=> copyBtn.textContent = 'Copiar', 1400); }
      catch(_){ alert('Falha ao copiar. Selecione e copie manualmente.'); }
    }
  });

  // Optional: fetch one on load
  window.addEventListener('load', () => {
    // do not auto-fetch to avoid network calls without user intent
  });

})();
