<?php
/**
 * Sentinel Core - Secure Downloader
 * 
 * Este script entrega arquivos baseados na validação HMAC-SHA256, garantindo que
 * apenas o Launcher autorizado (com o segredo) consiga baixar arquivos do client,
 * e protege contra ataques de "replay" (links compartilhados expiram em 5 minutos).
 */

$config = require __DIR__ . '/config.php';

// Ativar CORS ou desativar conforme necessidade de API, mas pro Launcher só importa responder.
header("Access-Control-Allow-Origin: *");

if (!isset($_GET['file'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Arquivo ausente']));
}

$requestedFile = $_GET['file'];
$signature = $_SERVER['HTTP_X_SENTINEL_SIGNATURE'] ?? '';
$timestamp = $_SERVER['HTTP_X_SENTINEL_TIMESTAMP'] ?? '';

// 1. Validar Headers
if (empty($signature) || empty($timestamp)) {
    http_response_code(401);
    die(json_encode(['error' => 'Acesso negado: Assinatura ou timestamp ausente']));
}

// 2. Proteção contra Replay Attack (5 minutos = 300 segundos)
$currentTimestamp = time();
if (abs($currentTimestamp - (int)$timestamp) > 300) {
    http_response_code(401);
    die(json_encode(['error' => 'Acesso negado: Requisição expirada. Use o launcher']));
}

// 3. Validar Assinatura HMAC
// Assinatura esperada: hmac_sha256($timestamp + $requestedFile, secret)
$dataToSign = $timestamp . $requestedFile;
$expectedSignature = hash_hmac('sha256', $dataToSign, $config['shared_secret']);

// hash_equals evita timing attacks
if (!hash_equals($expectedSignature, $signature)) {
    http_response_code(403);
    die(json_encode(['error' => 'Acesso negado: Assinatura inválida']));
}

// 4. Segurança de Caminho (Path Traversal Protection)
$clientDir = realpath($config['client_directory']);
$filePath = realpath($clientDir . DIRECTORY_SEPARATOR . $requestedFile);

// Se o arquivo não existir ou o caminho resolvido estiver fora do diretório do client:
if (!$filePath || strpos($filePath, $clientDir) !== 0 || !file_exists($filePath) || is_dir($filePath)) {
    http_response_code(404);
    die(json_encode(['error' => 'Arquivo não encontrado']));
}

// 5. Servir o arquivo
$mimeType = mime_content_type($filePath) ?: 'application/octet-stream';
$fileSize = filesize($filePath);

header("Content-Type: {$mimeType}");
header("Content-Length: {$fileSize}");
// Isso força o download ao longo de visualização se acessado direto, mas o tauri faz download manual igual
header("Content-Disposition: attachment; filename=\"" . basename($filePath) . "\"");

// Desativar cache do browser pra downloads dinâmicos
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

// Limpar buffers antes do readfile
while (ob_get_level()) { ob_end_clean(); }

readfile($filePath);
exit;
