<?php
/* ==========================================================================
   NEXA — History API (api/history.php)
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$userId = isset($_GET['user_id']) ? $_GET['user_id'] : null;

$conversations = [];

if ($pdo && $userId) {
    try {
        $stmt = $pdo->prepare("SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll();

        foreach ($rows as $r) {
            $msgStmt = $pdo->prepare("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC");
            $msgStmt->execute([$r['id']]);
            $msgRows = $msgStmt->fetchAll();

            $messages = [];
            foreach ($msgRows as $m) {
                $messages[] = [
                    "id" => $m['id'],
                    "sender" => $m['sender'],
                    "text" => $m['text'],
                    "modelResult" => $m['model_result'] ? json_decode($m['model_result'], true) : null,
                    "timestamp" => date("h:i A", strtotime($m['created_at']))
                ];
            }

            $conversations[] = [
                "id" => $r['id'],
                "title" => $r['title'],
                "timestamp" => date("M d, Y", strtotime($r['created_at'])),
                "messages" => $messages
            ];
        }
    } catch (Exception $e) {
        // Fallback gracefully
    }
}

echo json_encode([
    "status" => "success",
    "conversations" => $conversations
]);
?>
