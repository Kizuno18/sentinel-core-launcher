<?php
/**
 * Sentinel Core - Gerador de Checksums
 *
 * Gera o checksums.json com hashes SHA-256 de todos os arquivos
 * dentro da pasta client/. Pode ser chamado via terminal ou
 * automaticamente pelo checksums.php quando o updated.flag sumir.
 */

$config = require __DIR__ . '/config.php';

$clientDir  = $config['client_directory'];
$baseUrl    = $config['base_url'];
$outputFile = __DIR__ . '/checksums.json';
$flagFile   = __DIR__ . '/updated.flag';

if (!is_dir($clientDir)) {
    $msg = "Erro: pasta client/ nao existe em {$clientDir}";
    if (php_sapi_name() === 'cli') die($msg . "\n");
    return ['error' => $msg];
}

/**
 * Checa se um arquivo/pasta deve ser ignorado
 */
function shouldIgnore(string $path, array $config): bool {
    $basename = basename($path);
    if (in_array($basename, $config['ignored_paths'])) return true;

    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext && in_array($ext, $config['ignored_extensions'])) return true;

    foreach ($config['ignored_paths'] as $ignored) {
        if (strpos($path, "/{$ignored}/") !== false) return true;
    }

    return false;
}

// Escaneia a pasta client/ recursivamente
$iterator = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($clientDir, RecursiveDirectoryIterator::SKIP_DOTS)
);

$filesData = [];
$isCli = (php_sapi_name() === 'cli');

if ($isCli) echo "Gerando hashes SHA-256...\n";

foreach ($iterator as $file) {
    if ($file->isDir()) continue;

    $filePath     = $file->getPathname();
    $relativePath = str_replace($clientDir . DIRECTORY_SEPARATOR, '', $filePath);
    $relativePath = str_replace('\\', '/', $relativePath);

    if (shouldIgnore($filePath, $config)) continue;

    $hash = hash_file('sha256', $filePath);
    $size = filesize($filePath);

    $filesData[] = [
        'path' => $relativePath,
        'hash' => $hash,
        'size' => $size
    ];

    if ($isCli) echo "  ok  {$relativePath}\n";
}

$manifest = [
    'version'   => gmdate('Y-m-d\TH:i:s\Z'),
    'algorithm' => 'sha256',
    'baseUrl'   => $baseUrl,
    'files'     => $filesData
];

$json = json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

if (!file_put_contents($outputFile, $json)) {
    $msg = "Erro ao salvar checksums.json. Verifique permissoes.";
    if ($isCli) die($msg . "\n");
    return ['error' => $msg];
}

// Recria o flag pra indicar que ta tudo sincronizado
file_put_contents($flagFile, date('Y-m-d H:i:s') . " - checksums gerados\n");

if ($isCli) {
    echo "\nPronto! checksums.json criado com " . count($filesData) . " arquivos.\n";
    echo "Arquivo updated.flag recriado.\n";
}

// Retorna o manifest pra quem chamou via include
return $manifest;
