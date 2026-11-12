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

## Desenvolvimento local — sem serviços pagos

A Raylis foi planejada como site **100% estático**: HTML, CSS, JavaScript, ilustrações e `data/products.json`. A busca, os filtros e a paginação são executados no navegador. **Não há backend nem banco de dados remoto.** O servidor abaixo é apenas para servir arquivos durante o desenvolvimento no seu próprio computador: não é um serviço a contratar nem parte do site publicado.

### Abrir a prévia

Requisitos: Git e Node.js 20 ou superior instalados.

```bash
git clone https://github.com/Georlan/Raylis.git
cd Raylis
npm run dev
```

O comando inicia um servidor HTTP local em `127.0.0.1:8000`, com atualização do navegador quando os arquivos são alterados. Não usa pacotes npm externos nem requer executar `npm install`.

- **Página inicial:** http://localhost:8000/
- **Catálogo com 520 itens de demonstração:** http://localhost:8000/?demo=1#catalogo
- **Encerrar servidor:** `Ctrl+C`
- **Outra porta:** `PORT=8080 npm run dev`

Se não tiver Node.js instalado, também é possível usar Python 3 (`python3 -m http.server 8000 --bind 127.0.0.1`); neste caso, recarregue com F5 após editar.

O modo `?demo=1` é para avaliar usabilidade e desempenho dos filtros: os 520 itens são **fictícios**, sem preços nem alegações de produtos reais. A rota sem parâmetro utiliza apenas `data/products.json`, que começará vazia.

### Rotina de alterações

1. Abra o projeto no editor (VS Code ou outro) e execute `npm run dev`.
2. Edite `styles.css` (visual), `index.html` (estrutura), `src/app.mjs` (interface), ou `src/catalog.mjs` (regras dos filtros).
3. Avalie em http://localhost:8000/?demo=1#catalogo e também em viewport de celular.
4. Rode `npm run validate` antes de salvar no GitHub.
5. Faça commit e push para o repositório quando aprovado. **Cloudflare só entra depois da validação visual.**

### Custo e manutenção

A versão inicial não requer Railway, Supabase, Firebase, PostgreSQL, hospedagem de APIs ou painel de administração. A futura publicação pode ser feita em **Cloudflare Pages (plano gratuito, sujeito a limites e termos vigentes)**. Domínio personalizado, recursos premium e eventuais serviços de terceiros são opcionais e podem ter custo separado.

A Raylis poderá ter cerca de 500 produtos sem mensalidade de backend: prepare uma planilha CSV e exporte-a para `data/products.json`. Qualquer mudança feita no catálogo será publicada como atualização do site. O cliente **não tem painel administrativo ou checkout** nesta fase; caso queira edição online sem Git e sem servidor, isso será avaliado separadamente para não introduzir custo ou complexidade sem necessidade.

Seus dados ficam nos arquivos do repositório. **Não colocar credenciais, dados privados de clientes ou informações confidenciais nos arquivos públicos de catálogo.**

## Publicação (somente quando aprovada)

O projeto também é compatível com Cloudflare Pages ou GitHub Pages sem build. **Ainda não há site publicado automaticamente no Cloudflare.**

Para Cloudflare Pages, após aprovar a versão: conectar o GitHub, selecionar `Georlan/Raylis`, manter comando de build vazio e definir diretório de saída como a raiz `/` conforme o fluxo de implantação estática disponível. Nenhum token ou banco é necessário no código do site.

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
