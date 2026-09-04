# Gerador de Senhas Seguras + Gerador de Piadas

Este repositório contém dois utilitários estáticos em HTML/CSS/JS:

- Gerador de Senhas Seguras (index.html)
- Gerador de Piadas Aleatórias (joke.html) — busca piadas de APIs públicas

Como usar localmente:
1. Clone o repositório: `git clone https://github.com/Izakgg/gerador-senhas`
2. Abra a pasta e inicie um servidor local, por exemplo:
   `python -m http.server 8000`
   e acesse `http://localhost:8000`.
3. Abra `index.html` para o gerador de senhas ou `joke.html` para o gerador de piadas.

Observações sobre o gerador de piadas:
- O gerador primeiro tenta usar https://icanhazdadjoke.com/ (retorna piadas curtas em JSON).
- Se essa API falhar, há um fallback para https://v2.jokeapi.dev/joke/Any.
- Algumas piadas podem estar em inglês — posso adicionar tradução automática para português se desejar.

Quer que eu habilite o GitHub Pages para publicar o site (main/ root)?
