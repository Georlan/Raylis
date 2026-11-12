# Publicar a Raylis no Cloudflare Pages

Este projeto é um site **100% estático**. O build só copia arquivos públicos para `dist/`.
Não necessita de servidor, banco de dados, Cloudflare Workers, API, autenticação ou cobrança recorrente de aplicação.

## Configuração recomendada

| Configuração no Cloudflare Pages | Valor |
| --- | --- |
| Repositório | `Georlan/Raylis` |
| Branch de produção | `main` |
| Nome do projeto (tentar primeiro) | `raylis` |
| Framework preset | `None` ou `No framework` |
| Root directory | Raiz do repositório, deixar em branco |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node.js | `22` (fixado em `.node-version`) |
| Variáveis de ambiente e segredos | Nenhum |
| Backend / Functions | Nenhum |

Se **raylis** estiver disponível como nome de projeto na conta/na plataforma, o endereço previsto será
`https://raylis.pages.dev`. A disponibilidade **só é confirmada na criação dentro do painel da Cloudflare**.
Sem confirmação, não divulgue esse endereço como ativo. Se o nome estiver ocupado, considere
`raylis-naturais`, `raylis-produtos` ou `raylis-catalogo` e confira o subdomínio apresentado pelo painel.

A escolha do projeto é importante: o endereço `*.pages.dev` não pode ser renomeado após criar
o projeto sem recriá-lo. Escolha o melhor nome livre na primeira configuração.

## Passo a passo de publicação

1. Entre em [Cloudflare Dashboard](https://dash.cloudflare.com/) com sua conta.
2. Abra **Workers & Pages**, selecione **Create application** e a opção **Pages**.
3. Escolha **Import an existing Git repository** ou **Connect to Git**.
4. Autorize o aplicativo **Cloudflare Workers and Pages** no GitHub, concedendo acesso ao repositório `Georlan/Raylis`. Não forneça token no código, commit ou conversa.
5. Selecione o repositório, defina o nome do projeto como **raylis** caso disponível e escolha a branch `main`.
6. Use os valores exatos da tabela acima. Confirme que o diretório de saída é **dist**, não a raiz e nem `public`.
7. Inicie o primeiro deploy. Quando ficar **Success**, abra o endereço `*.pages.dev` exibido.
8. Teste tanto a homepage quanto a demonstração com `?demo=1#catalogo` e confirme links, fotos, filtros e celular.

> Importante: a integração GitHub/Pages publica a branch `main` automaticamente após novos pushes.
> As demais branches/PRs podem gerar URLs de preview sem alterar a produção. Se preferir revisar antes de cada publicação,
> configure **Branch control** no painel ou só faça merge na `main` depois da aprovação.

## Simulação local do mesmo pacote

Requisitos: Node.js 22 e Git.

```bash
npm run validate
npm run preview
```

A prévia do pacote de publicação abre em `http://localhost:4173/`. Ela usa `dist/` em vez dos arquivos do desenvolvimento.
O `npm run dev` da porta 8000 continua existindo, sem mudanças.

Para testar a versão com 520 itens **fictícios**, use
`http://localhost:4173/?demo=1#catalogo` ou, depois do deploy,
`https://<NOME-REAL-DO-PROJETO>.pages.dev/?demo=1#catalogo`.

A versão pública sem `?demo=1` utiliza `data/products.json` e começa sem itens
até recebermos o inventário oficial. Não apresenta produtos de demonstração como itens reais.

## O que fica em dist/

O build somente copia:

- `index.html` e `styles.css`
- `styles/*.css` e `src/*.mjs` (arquivos de interface)
- `assets/` (fotos e ícones com extensões aprovadas)
- `data/products.json` (catálogo real)
- `_headers` (cabeçalhos HTTP da Cloudflare)

Não inclui `README.md`, `package.json`, `scripts/`, `tests/`,
`.github/`, planilha CSV de exemplo, arquivos ocultos, credenciais ou `.env`.
A verificação `npm run check:dist` falha se aparecer um arquivo fora da lista permitida.

## Fase de testes e SEO

O arquivo `_headers` envia `X-Robots-Tag: noindex, nofollow` **temporariamente**
para impedir que o catálogo incompleto seja indexado como uma loja pronta.
Também define cabeçalhos simples de segurança.

**Antes do lançamento público definitivo:** cadastrar e revisar produtos,
validar todos os canais oficiais, considerar políticas necessárias e **remover
a linha X-Robots-Tag: noindex, nofollow** de `_headers`.
Não remova a proteção enquanto a página ainda estiver em avaliação.

## Custos

O site não precisa de banco de dados, servidor gerenciado, pagamento por API ou
Cloudflare Workers. Cloudflare Pages oferece opção gratuita sujeita aos limites e
às condições da plataforma. Domínio próprio, se adquirido futuramente, pode ter
cobrança anual independente. O subdomínio atribuído em `pages.dev` dispensa
comprar um domínio.

## Verificação após o primeiro deploy

- Página inicial carrega com HTTPS e favicon correto.
- `/styles.css`, `/src/app.mjs` e `/data/products.json` respondem normalmente.
- As seis imagens de categoria, a marca e a imagem do hero carregam.
- `/?demo=1#catalogo` permite pesquisar e filtrar os 520 exemplos e não cria pedidos.
- WhatsApp e Instagram abrem os canais certos, sem exigir login no site.
- `/package.json`, `/scripts/build.mjs` e `/tests/catalog.test.mjs` **não** são publicados.
- Teste no celular com rolagem, drawer de filtros, navegação fixa e acessibilidade.

Documentação oficial consultada:
[Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/),
[Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/),
[Custom headers](https://developers.cloudflare.com/pages/configuration/headers/),
[Build image](https://developers.cloudflare.com/pages/configuration/build-image/).
