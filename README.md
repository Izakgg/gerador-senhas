# Gerador de Senhas Seguras

Como usar:
1. Coloque os arquivos (index.html, styles.css, script.js) na mesma pasta.
2. Abra `index.html` no navegador (Chrome, Firefox, Edge, Safari).
3. Ajuste o comprimento e as opções; clique em "Gerar" ou "Regenerar".
4. Use "Copiar" para copiar a senha para a área de transferência.

Observações de segurança:
- Gera senhas no cliente usando crypto.getRandomValues (aleatoriedade criptográfica).
- Para produção, recomenda-se usar HTTPS e um gerenciador de senhas para armazenar senhas longas e aleatórias.
- Evite colar senhas sensíveis em campos não confiáveis.

Personalizações possíveis:
- Adicionar exportação para CSV/JSON (para transferir para um gerenciador).
- Suporte a frases de senha (diceware).
- Integração com back-end somente se houver necessidade de armazenamento (evitar sempre que possível).
