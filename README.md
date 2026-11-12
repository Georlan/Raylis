# Raylis · Produtos Naturais

Base inicial do site/catálogo digital da **Raylis Produtos Naturais**, criada para um catálogo que poderá chegar a cerca de **500 produtos**.

**Estado:** estrutura funcional; cadastro oficial ainda não recebido. A versão pública não exibe itens fictícios como mercadorias reais.

## Navegação

- Layout responsivo para celulares, tablets e desktop.
- Pesquisa por nome, categoria, marca, descrição e tags (insensível a acentos).
- Filtros por categoria, marca e disponibilidade, com contadores e remoção rápida.
- Ordenação alfabética e por data de cadastro.
- Carregamento progressivo de 24 em 24 produtos (não renderiza 500 cards de uma só vez).
- Painel de detalhes de produto e espaço reservado para fotos.
- Estado vazio apropriado enquanto o catálogo real é preparado.
- Filtros preservados na URL (compartilháveis).
- Modo de demonstração **separado**, com 520 itens inequivocamente fictícios: `?demo=1#catalogo`.

> **Importante:** a marca enviada foi usada como referência de cores e forma. O símbolo atual é uma **recriação vetorial provisória**, não o arquivo original da identidade. Substituir por logotipo oficial em SVG/PNG transparente antes do lançamento definitivo.

## Visualização

Não é necessário instalar dependências. Sirva os arquivos com um servidor HTTP local:

```bash
python3 -m http.server 8000
# http://localhost:8000/
# http://localhost:8000/?demo=1#catalogo
```

Também é compatível com hospedagem estática (GitHub Pages, Cloudflare Pages, Netlify), sem build. **O site não foi automaticamente publicado em um domínio:** é preciso configurar a hospedagem.

No GitHub Pages, configurar **Settings → Pages → Deploy from a branch → main → /(root)**. O caminho relativo dos assets permite hospedar em `/Raylis/`. Para testar o catálogo, abrir `https://georlan.github.io/Raylis/?demo=1#catalogo` **somente depois de habilitar Pages**.

## Adicionar produtos

O arquivo `data/products.json` contém inicialmente `[]`.

Preencha uma planilha e exporte como **CSV UTF-8** com as colunas de `data/products-template.csv`:

| Coluna | Obrigatória | Exemplo/observação |
| --- | --- | --- |
| `id` | sim | Código único e estável, como `R0001` |
| `nome` | sim | Nome oficial do produto |
| `categoria` | sim | ID de categoria da lista abaixo |
| `marca` | não | Fabricante/marca, se confirmado |
| `descricao` | não | Texto factual, revisado, sem promessas terapêuticas |
| `imagem` | não | `https://...` ou `assets/foto.jpg` |
| `status` | não | `disponivel`, `sob_consulta`, `indisponivel` |
| `referencia` | não | SKU/código |
| `etiquetas` | não | Termos separados por `|` |
| `data_inclusao` | não | `AAAA-MM-DD` |

**Categorias provisórias** (a revisar quando a lista de produtos chegar):
- `chas` — Chás e infusões
- `suplementos` — Suplementos
- `vitaminas` — Vitaminas e minerais
- `alimentos` — Alimentos naturais
- `cuidados` — Cuidados pessoais
- `outros` — Outros produtos

Exemplo de uma linha **ilustrativa para documentação**, não produto comercial:

```csv
id;nome;categoria;marca;descricao;imagem;status;referencia;etiquetas;data_inclusao
EX-001;Item de exemplo;chas;Marca fictícia;Apenas treinamento;;sob_consulta;EX-001;exemplo|teste;2026-01-01
```

Execute:

```bash
npm run import:csv -- caminho/para/produtos.csv --check
npm run import:csv -- caminho/para/produtos.csv
npm run validate
```

O primeiro comando valida **sem sobrescrever** nada; o segundo gera `data/products.json`. Depois, revisar as alterações e publicar. Uma planilha de 500 itens será convertida em JSON e renderizada com paginação; não há backend necessário no MVP.

## Cuidados antes do lançamento

- Confirmar categorias reais, ortografia das marcas, fotos e descrição de cada item.
- Validar informações de rótulos e regulamentação aplicável; não publicar alegações médicas sem respaldo.
- Confirmar canal de contato, atendimento, estoque e precificação antes de adicionar botões de pedido.
- O importador, por prudência, interpreta status em branco como **indisponível**, nunca disponível.
- Não há checkout, coleta de dados, integração de pagamento, formulário falso ou contato inventado.
- Adicionar marca d'água/proteção de direitos nas fotos somente se houver necessidade e autorização.

## Estrutura

```text
index.html                 Página semântica
styles.css                 Sistema visual responsivo
src/app.mjs                Interface, filtros e detalhes
src/catalog.mjs            Motor puro de busca, facetas e paginação
assets/                    Símbolos vetoriais provisórios
data/products.json         Catálogo real (vazio por enquanto)
data/products-template.csv Modelo de importação
scripts/import-csv.mjs     Importador/validador da planilha
scripts/check-site.mjs     Validação de estrutura
tests/                     Testes automatizados sem dependências
.github/workflows/ci.yml   CI com Node 22
```

## Próximas entregas

1. Receber a planilha com os produtos e confirmar a taxonomia (categorias/subcategorias).
2. Importar fotos autorizadas e substituir o símbolo provisório pelo logotipo oficial.
3. Conferir SKU, status, textos e políticas de publicação.
4. Definir se haverá venda online ou apenas consulta/contato.
5. Configurar domínio, hospedagem e métricas com consentimento adequado, se aplicável.
