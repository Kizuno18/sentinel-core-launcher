<?php
/**
 * Sentinel Core - Configuracao do Updater
 *
 * Edite os valores abaixo de acordo com o seu servidor.
 * Depois de configurar, nao precisa mexer mais aqui.
 */

return [
    // Senha compartilhada com o Launcher (HMAC)
    // Troque por uma senha forte e avise o dev do launcher qual eh
    'shared_secret' => 'EXORDION_SENTINEL_SECRET_2026',

    // Pasta onde ficam os arquivos do OTClient
    'client_directory' => __DIR__ . '/client',

    // URL do download.php no seu site (nao mude o ?file= no final)
    'base_url' => 'https://bravora.exordion.com.br/updater/download.php?file=',

    // Extensoes ignoradas (nao entram no checksum)
    'ignored_extensions' => ['log', 'tmp', 'bak'],

    // Arquivos e pastas ignorados
    'ignored_paths' => ['.git', '.gitignore', 'Thumbs.db', '.DS_Store']
];
