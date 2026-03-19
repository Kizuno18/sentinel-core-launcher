<?php
/**
 * Sentinel Core - Endpoint de Checksums
 *
 * O launcher bate aqui pra pegar a lista de arquivos e hashes.
 * Se o arquivo updated.flag nao existir, regenera o checksums.json
 * automaticamente antes de responder.
 *
 * Ou seja: o dono do server so precisa jogar os arquivos na pasta
 * client/ e deletar o updated.flag. Na proxima request do launcher
 * os checksums sao recalculados sozinhos.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$flagFile     = __DIR__ . '/updated.flag';
$checksumsFile = __DIR__ . '/checksums.json';

// Se o flag nao existe OU o checksums.json nao existe, regenera tudo
if (!file_exists($flagFile) || !file_exists($checksumsFile)) {
    require __DIR__ . '/generate-checksums.php';
}

// Agora serve o JSON
if (file_exists($checksumsFile)) {
    readfile($checksumsFile);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Falha ao gerar checksums']);
}
