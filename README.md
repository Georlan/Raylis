# Raylis · Produtos Naturais

Base inicial do site/catálogo digital da **Raylis Produtos Naturais**, criada para um catálogo que poderá chegar a cerca de **500 produtos**.

**Estado:** estrutura funcional; cadastro oficial ainda não recebido. A versão pública não exibe itens fictícios como mercadorias reais.

## Interface mobile-first

A UI atual é **programada em HTML, CSS e JavaScript reais**, não reproduz um mockup ou uma tela de IA. O site usa componentes simples que funcionam em celular, teclado e mouse.

- **Entrada compacta:** cabeçalho fixo, abertura curta e início do catálogo próximo da primeira tela.
- **Categorias em trilho horizontal:** controle por toque/arrasto, botões de avançar e voltar, indicação da categoria ativa.
- **Busca de produtos:** destaque no topo da seção, atalho da lupa no cabeçalho e filtros rápidos por categoria.
- **Filtros mobile em painel inferior:** drawer com categorias, marca e disponibilidade, contador e botão de fechar. Desktop usa painel lateral temporário.
- **Resultados compactos:** 12 cards por lote, detalhes em dialog e botão de consulta pelo WhatsApp somente para produtos reais.
- **Navegação mobile fixa:** Início, Categorias, Catálogo e Contato.
- **Animações discretas:** resposta a hover, leve efeito de ponteiro na composição ilustrada da abertura, transição de cards e estados ativos. Respeita `prefers-reduced-motion`; no celular, nenhuma interação depende de hover.
- **Asset independente:** ícone `assets/whatsapp.svg`, leve, local, inserido nos links de contato. Não carrega imagem de terceiros.
- **Sem fluxos falsos:** nenhuma sacola, pedido, checkout, preço, estoque, avaliações ou informações de saúde inventados.
- **Sem custo recorrente de aplicação:** o catálogo é JSON estático, sem API, autenticação nem servidor remoto.

A nova camada visual está em `styles/app-ui.css`. Os estilos anteriores foram mantidos como base de compatibilidade durante a transição; consolidar as folhas após a aprovação visual. O conteúdo de demonstração contém itens fictícios claramente identificados e não disponibiliza ações de compra.

## Cabeçalho e abertura atualizados

O cabeçalho usa os elementos reais da Raylis, com marca, navegação por seções, pesquisa e WhatsApp. No desktop, o item da navegação correspondente à seção visível recebe um indicador discreto. No celular, a navegação colapsa em menu e a abertura preserva leitura e ação sem depender de hover.

A abertura foi reconstruída separando conteúdo HTML de fotografia: `assets/photos/hero-editorial.webp` é um recorte editorial sem textos, extraído da referência visual aprovada. A fotografia é decorativa e **não corresponde a um item específico do estoque**. Fundo e transição são controlados por CSS, enquanto texto, botão e localização são elementos HTML; nenhum print de interface é publicado como imagem de página.

Estilos da navegação: `styles/app-ui.css`. Estilos responsivos da abertura: `styles/artwork.css`. Navegação ativa: `src/app.mjs`.

## Assets individuais das categorias

A Raylis usa **sete fotografias editoriais otimizadas** em WebP. Cada imagem fica em um arquivo independente; as seis categorias são botões reais, não uma imagem de interface. As fotografias foram produzidas com IA como *direção de arte ilustrativa*, sem copiar marcas, embalagens reais, preços ou textos.

| Categoria | Arquivo | Uso |
| --- | --- | --- |
| Chás e infusões | `assets/photos/category-chas.webp` | Botão da categoria |
| Suplementos | `assets/photos/category-suplementos.webp` | Botão da categoria |
| Vitaminas e minerais | `assets/photos/category-vitaminas.webp` | Botão da categoria |
| Alimentos naturais | `assets/photos/category-alimentos.webp` | Botão da categoria |
| Cuidados pessoais | `assets/photos/category-cuidados.webp` | Botão da categoria |
| Outros produtos | `assets/photos/category-outros.webp` | Botão da categoria |
| Fotografia de chá | `assets/photos/hero-editorial.webp` | Abertura da página |

### Comportamento e acessibilidade

- O HTML e o JavaScript renderizam os cartões como `<button>` com `aria-pressed` e selecionam efetivamente a categoria correspondente, inclusive por teclado.
- O trilho rola horizontalmente pelo toque, mouse ou botões anterior/próximo.
- Em telas com mouse, as fotos têm movimento leve no hover. Em dispositivos de toque, não há dependência de hover. `prefers-reduced-motion` desabilita transições.
- Os itens demonstrativos são explicitamente fictícios. Quando um produto não tem foto real, aparece a **imagem ilustrativa de sua categoria**, com aviso visível. Nunca usar estas fotografias como prova de que um item específico é comercializado.
- A consulta por WhatsApp continua restrita a produtos reais. Não há checkout ou backend.
- A marca oficial continua usando os arquivos Raylis de logo e símbolo aprovados anteriormente.

Os caminhos são centralizados em `src/artwork.mjs`; o CSS fica em `styles/artwork.css` e a interação em `src/app.mjs`. Para trocar uma fotografia, basta substituir o arquivo mantendo o nome, ou atualizar o mapeamento. O objetivo é que os clientes reconheçam a categoria pelos elementos visuais, e que as fotos oficiais dos produtos tenham precedência quando cadastradas.

## Navegação

- Layout responsivo para celulares, tablets e desktop.
- Pesquisa por nome, categoria, marca, descrição e tags (insensível a acentos).
- Filtros por categoria, marca e disponibilidade, com contadores e remoção rápida.
- Ordenação alfabética e por data de cadastro.
- Carregamento progressivo de 12 em 12 produtos (não renderiza 500 cards de uma só vez).
- Painel de detalhes de produto e espaço reservado para fotos.
- Estado vazio apropriado enquanto o catálogo real é preparado.
- Filtros preservados na URL (compartilháveis).
- Modo de demonstração **separado**, com 520 itens inequivocamente fictícios: `?demo=1#catalogo`.

## Canais oficiais e atendimento (12/11/2026)

Dados fornecidos diretamente para este projeto e conferidos com a captura do perfil:
- **WhatsApp:** [+55 (88) 92191-7797](https://wa.me/5588921917797) — contato direto, sem integração de API.
- **Instagram:** [@raylis_produtosnaturais](https://www.instagram.com/raylis_produtosnaturais/) — link para o perfil, sem incorporar feed.
- **Referência de localização:** Jaguaribara, Ceará. **Não publicar endereço completo nem horário de funcionamento até confirmação.**

O perfil apresenta a Raylis como loja de alimentos naturais, com menções a produtos a granel e manipulados e categorias especiais. Essa informação é apenas um contexto comercial do Instagram; **não pressupõe disponibilidade, composição, isenção de alérgenos, preços ou estoque de produtos específicos**. As categorias do catálogo ainda dependem da planilha oficial.

### Onde ficam os atalhos

- Cabeçalho desktop: WhatsApp direto; navegação também inclui **Contato**.
- Menu mobile: atalhos para WhatsApp e Instagram.
- Abertura: consulta com a loja ao lado de **Explorar catálogo**.
- Faixa do Instagram: acesso à conta entre apresentação e categorias.
- Catálogo: atalho de WhatsApp para dúvidas; fichas de **produtos reais** geram mensagens com nome e referência do item, solicitando detalhes e disponibilidade.
- **Modo demo:** os 520 itens fictícios continuam sem botão de consulta de item, evitando confusão com produtos reais.
- Seção **Contato**: duas opções claras e número clicável para chamada telefônica.
- No celular: barra fixa com **Catálogo**, **WhatsApp** e **Instagram**.
- Rodapé: links diretos para os canais oficiais.

As URLs e a função de consulta contextual estão em `src/contacts.mjs`. Alterar por lá quando os canais oficiais mudarem. Os links no HTML têm endereços públicos de reserva, permitindo abrir o contato mesmo que o JavaScript do catálogo não funcione.

**Custo:** links `wa.me` e Instagram não exigem backend, token, conta comercial paga ou API. O site continua estático. Abrir o WhatsApp ou Instagram depende dos respectivos serviços, internet e aplicativos/navegadores do visitante. Não há atendimento automatizado, formulários que armazenam dados, rastreamento de conversas nem integração de mensagens.

**Validação do Instagram:** informações de perfil provêm do print fornecido; não copiamos posts, fotos, seguidores ou promessas de marketing. O Instagram pode bloquear leitura automatizada e a marca permanece responsável pelas informações de seus produtos.


**Identidade integrada:** o site utiliza as duas artes reconstruídas e aprovadas da Raylis, disponibilizadas em `assets/raylis-logo.svg` e `assets/raylis-symbol.svg`. Esses SVGs são contêineres de PNG otimizado com transparência: preservam a aparência das artes enviadas, mas **não** são vetores editáveis nem substituem o arquivo-mestre original da marca. Os símbolos antigos e a ilustração fictícia da abertura foram removidos.

## Desenvolvimento local — sem serviços pagos

A Raylis foi planejada como site **100% estático**: HTML, CSS, JavaScript, identidade Raylis otimizada e `data/products.json`. A busca, os filtros e a paginação são executados no navegador. **Não há backend nem banco de dados remoto.** O servidor abaixo é apenas para servir arquivos durante o desenvolvimento no seu próprio computador: não é um serviço a contratar nem parte do site publicado.

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

## Paleta da marca (extraída das imagens aprovadas)

| Papel | Cor | Uso |
| --- | --- | --- |
| Verde profundo | `#064714` | Textos primários, cabeçalho, botões |
| Verde principal | `#185C20` | Estados de ação e contraste |
| Verde folha | `#4E9128` | Identificação e detalhes botânicos |
| Verde-lima | `#9CCB4C` | Destaques e decoração |
| Verde claro | `#D5E58D` | Iluminação e fundos secundários |
| Creme de apoio | `#FBF8F0` | Superfícies claras |

As cores foram obtidas por amostragem dos pixels das artes aprovadas; são referências do projeto, não um manual oficial de identidade. O site não depende de fontes externas ou backend. O arquivo `styles.css` concentra os tokens e as aplicações de cor.

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
assets/                    Logo aprovada (PNG incorporado em SVG), símbolo e favicon
data/products.json         Catálogo real (vazio por enquanto)
data/products-template.csv Modelo de importação
scripts/import-csv.mjs     Importador/validador da planilha
scripts/check-site.mjs     Validação de estrutura
tests/                     Testes automatizados sem dependências
.github/workflows/ci.yml   CI com Node 22
```

## Próximas entregas

1. Receber a planilha com os produtos e confirmar a taxonomia (categorias/subcategorias).
2. Importar fotos autorizadas; conferir se existe arquivo-mestre da logo com qualidade superior.
3. Conferir SKU, status, textos e políticas de publicação.
4. Definir se haverá venda online ou apenas consulta/contato.
5. Configurar domínio, hospedagem e métricas com consentimento adequado, se aplicável.
