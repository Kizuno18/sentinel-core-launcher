<?php
/**
 * Sentinel Core - Updater Configuration
 * 
 * Configurações para geração de checksums e download seguro.
 */

return [
    // Chave secreta compartilhada com o Launcher (para HMAC)
    // ATENÇÃO: Mude isso para uma string segura (ex: usar um gerador de senhas fortes)
    'shared_secret' => 'EXORDION_SENTINEL_SECRET_2026',
    
    // Pasta onde ficam os arquivos do client, relativa a este script
    'client_directory' => __DIR__ . '/client',
    
    // URL base de onde os arquivos serão baixados (apontando pro download.php)
    'base_url' => 'https://bravora.exordion.com.br/updater/download.php?file=',
    
    // Extensões de arquivo a serem ignoradas pelo gerador de checksum
    'ignored_extensions' => ['log', 'tmp', 'bak'],
    
    // Arquivos e pastas a serem ignorados completamente
    'ignored_paths' => ['.git', '.gitignore', 'Thumbs.db', '.DS_Store']
];
