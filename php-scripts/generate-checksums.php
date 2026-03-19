<?php
/**
 * Sentinel Core - Checksum Generator
 * 
 * Script para gerar o arquivo checksums.json usando hashes SHA-256.
 * Execute manualmente ou via Cron Job sempre que atualizar os arquivos do client.
 */

$config = require __DIR__ . '/config.php';

$clientDir = $config['client_directory'];
$baseUrl = $config['base_url'];
$outputFile = __DIR__ . '/checksums.json';

if (!is_dir($clientDir)) {
    die("Erro: O diretório do client não existe em {$clientDir}\nCrie a pasta 'client' e coloque os arquivos lá.\n");
}

$filesData = [];

// Função auxiliar para verificar ignorados
function shouldIgnore($path, $config) {
    if (in_array(basename($path), $config['ignored_paths'])) return true;
    
    $ext = pathinfo($path, PATHINFO_EXTENSION);
    if ($ext && in_array(strtolower($ext), $config['ignored_extensions'])) return true;
    
    // Se conter pastas ignoradas no caminho (ex: .git/)
    foreach ($config['ignored_paths'] as $ignored) {
        if (strpos($path, '/' . $ignored . '/') !== false || strpos($path, '\\' . $ignored . '\\') !== false) {
            return true;
        }
    }
    
    return false;
}

// Escanear diretório recursivamente
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($clientDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

echo "Gerando hashes SHA-256...\n";

foreach ($iterator as $file) {
    if ($file->isDir()) continue;
    
    $filePath = $file->getPathname();
    $relativePath = str_replace($clientDir . DIRECTORY_SEPARATOR, '', $filePath);
    // Unificar separadores para o formato URL / Linux
    $relativePath = str_replace('\\', '/', $relativePath);
    
    if (shouldIgnore($filePath, $config)) continue;
    
    // Gerar SHA-256
    $hash = hash_file('sha256', $filePath);
    $size = filesize($filePath);
    
    $filesData[] = [
        'path' => $relativePath,
        'hash' => $hash,
        'size' => $size
    ];
    
    echo "✔ {$relativePath} ({$hash})\n";
}

$manifest = [
    'version' => gmdate('Y-m-d\TH:i:s\Z'),
    'algorithm' => 'sha256',
    'baseUrl' => $baseUrl,
    'files' => $filesData
];

$jsonOutput = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if (file_put_contents($outputFile, $jsonOutput)) {
    echo "\nSucesso! Gerado checksums.json com " . count($filesData) . " arquivos.\n";
} else {
    echo "\nErro ao salvar o arquivo checksums.json. Verifique as permissões da pasta.\n";
}
