# Sentinel Core — Updater Files

Esta pasta contém os scripts PHP que **você (Dono do OTServ)** deve colocar no seu site.
Esses arquivos fazem o Launcher baixar os arquivos do seu client de forma segura (usando hashes SHA-256 e validação HMAC).

## 🛠️ Como Instalar no seu Site

1. Coloque esta pasta inteira na hospedagem do seu site, por exemplo em:
   `https://bravora.exordion.com.br/updater/`

2. Dentro da pasta `/updater/` (onde colocou os scripts), crie uma sub-pasta chamada `client`
   `https://bravora.exordion.com.br/updater/client/`

3. Coloque **todos** os arquivos do seu OTClient dentro dessa pasta `client`.
   *(O executável, a pasta `data`, `modules`, `init.lua`, etc)*

4. Edite o arquivo `config.php`:
   - Troque o **`shared_secret`** por uma senha segura. (Ex: `exordion_super_secret_2026`). Avisar o dev do launcher qual foi a senha para colocar no código-fonte.
   - Atualize a **`base_url`** com o link real do `download.php` no seu site. Ex: `https://bravora.exordion.com.br/updater/download.php?file=`

## 🔄 Como Atualizar seu Client

Sempre que você lançar um novo update (mudar sprite, mexer em lua, atualizar o .exe):

1. Acesse seu servidor via SSH (ou FTP se não tiver terminal).
2. Substitua os arquivos na pasta `client/` pelos novos.
3. Rode o gerador de checksums pelo terminal do seu site:

   ```bash
   cd /caminho/do/seu/site/updater/
   php generate-checksums.php
   ```

Isso vai gerar e sobrescrever o arquivo `checksums.json` contendo a Hash SHA-256 atualizada de todos os arquivos.

O Sentinel Core Launcher dos jogadores vai:
1. Ler o seu `checksums.json` criado
2. Comparar as hashes no PC do jogador
3. Baixar os arquivos **apenas se a hash for diferente** ou estiver faltando (via request segurada por HMAC no `download.php`)
4. Detectar qualquer arquivo malicioso injetado na pasta, reportar pro painel Sentinel Core e limpar a pasta automaticamente.
