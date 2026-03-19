# Updater do Sentinel Core

Esses scripts PHP vao dentro do site do seu OTServ.
Eles fazem o launcher baixar e verificar os arquivos do client automaticamente.

---

## Como instalar

1. Joga essa pasta inteira dentro do site. Exemplo:
   ```
   https://seusite.com/updater/
   ```

2. Dentro dessa pasta, cria uma pasta chamada `client/`:
   ```
   https://seusite.com/updater/client/
   ```

3. Coloca todos os arquivos do OTClient dentro da pasta `client/`.
   (o .exe, as pastas data/, modules/, o init.lua, tudo)

4. Abre o `config.php` e muda duas coisas:
   - **shared_secret**: coloca uma senha forte qualquer. Depois avisa o dev do launcher pra ele colocar a mesma senha no codigo.
   - **base_url**: troca pelo link real do seu site. Exemplo: `https://seusite.com/updater/download.php?file=`

5. Pronto. O launcher vai bater no `checksums.php` pra pegar a lista de arquivos.

---

## Como atualizar o client

Quando voce atualizar algum arquivo do client (sprite novo, .exe novo, lua nova):

1. Substitui os arquivos na pasta `client/`
2. Deleta o arquivo `updated.flag`

So isso. Na proxima vez que qualquer jogador abrir o launcher, ele vai:
- Ver que o flag sumiu
- Recalcular as hashes de todos os arquivos sozinho
- Criar o flag de novo
- Servir os checksums novos pro launcher do jogador

Voce nao precisa rodar nenhum comando. So jogar os arquivos e deletar o flag.

> Se preferir, tambem da pra rodar manualmente pelo terminal:
> ```
> cd /caminho/do/seu/site/updater/
> php generate-checksums.php
> ```

---

## Arquivos dessa pasta

| Arquivo | O que faz |
|---------|-----------|
| `config.php` | Suas configuracoes (senha, caminhos, URL) |
| `generate-checksums.php` | Gera as hashes SHA-256 de todos os arquivos |
| `checksums.php` | O launcher bate aqui. Se o flag nao existir, regenera sozinho |
| `download.php` | Entrega os arquivos pro launcher (com validacao HMAC) |
| `checksums.json` | Gerado automaticamente, nao mexe nele |
| `updated.flag` | Arquivo de controle. Delete ele quando atualizar o client |

---

## O que o launcher faz com tudo isso

1. Pede o `checksums.php` → recebe a lista de arquivos com hashes
2. Compara com os arquivos que o jogador tem no PC
3. Se faltar algum ou a hash for diferente → baixa de novo
4. Se tiver arquivo estranho na pasta (DLL de bot, hack) → reporta pro painel e limpa tudo
5. Depois de tudo ok → libera o botao "LAUNCH"

Ninguem consegue baixar os arquivos fora do launcher porque o `download.php` valida uma assinatura HMAC. Sem o launcher, da erro 403.
