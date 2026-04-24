# Recursos do instalador

Esta pasta contém os arquivos usados pelo `electron-builder` para gerar o instalador profissional do SGA - PDV.

## Arquivos necessários

| Arquivo | Tamanho | Uso |
|---|---|---|
| `icon.ico` | **256x256 px** (ideal 16/32/48/64/128/256) | Ícone do app, instalador e atalhos |
| `installer-sidebar.bmp` | **164x314 px** (BMP 3, 24-bit) | Barra lateral do instalador NSIS (opcional) |
| `LICENSE.txt` | — | Texto de licença exibido no wizard |

## Como gerar o `icon.ico` profissional

O ícone atual (`icon.ico`) é um placeholder a partir do `favicon.ico` do projeto. Para ter um ícone afiado em todos os tamanhos:

1. Crie uma arte em **PNG 1024x1024 px** (fundo transparente recomendado)
2. Converta em [icoconvert.com](https://icoconvert.com) ou [cloudconvert.com/png-to-ico](https://cloudconvert.com/png-to-ico)
3. Certifique-se de incluir as resoluções: 16, 32, 48, 64, 128, 256
4. Substitua `build/icon.ico` pelo novo arquivo

## Sidebar do instalador (opcional, mas recomendado)

Um BMP vertical à esquerda da janela de instalação dá uma aparência muito mais profissional ao wizard.

1. Crie um **BMP 164x314 px, 24-bit, BMP versão 3** (sem compressão)
2. Pode ser uma logo em cima de fundo sólido da marca
3. Salve como `build/installer-sidebar.bmp`

Caso o arquivo não exista, o wizard usa o template padrão (verde do NSIS) — funciona, só não é "da sua marca".
