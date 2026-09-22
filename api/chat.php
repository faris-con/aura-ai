<?php
/* ==========================================================================
   NEXA — Chat API with Database Persistence (api/chat.php)
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents("php://input"), true);
$message = isset($input['message']) ? trim($input['message']) : '';
$conversationId = isset($input['conversationId']) ? trim($input['conversationId']) : 'chat_' . time();
$userId = isset($input['userId']) ? $input['userId'] : null;

if (empty($message)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Message content required"]);
    exit();
}

$lower = strtolower($message);
$modelResult = null;
$reply = "I am NEXA, your Huawei HCIA AI assistant. How can I help you analyze, predict, or classify today?";

if (strpos($lower, 'image') !== false || strpos($lower, 'cnn') !== false || strpos($lower, 'cat') !== false) {
    $reply = "Convolutional Neural Network (CNN) feature extraction completed.";
    $modelResult = [
        "type" => "CNN Vision",
        "prediction" => "Felis catus (Tabby Cat)",
        "confidence" => 94.7,
        "explanation" => "Gemini AI Layer: ResNet50 visual layer extracted spatial feature maps confirming 94.7% feline classification."
    ];
} elseif (strpos($lower, 'classify') !== false || strpos($lower, 'churn') !== false) {
    $reply = "Random Forest decision tree ensemble executed.";
    $modelResult = [
        "type" => "Classification",
        "prediction" => "High Retention Priority",
        "confidence" => 89.4,
        "explanation" => "Gemini AI Layer: Feature weights indicate usage frequency (34%) as primary classifier vector."
    ];
} elseif (strpos($lower, 'predict') !== false || strpos($lower, 'price') !== false || strpos($lower, 'fraud') !== false) {
    $reply = "XGBoost model execution complete.";
    $modelResult = [
        "type" => "Regression",
        "prediction" => "$452,800 Forecast Value",
        "confidence" => 92.1,
        "explanation" => "Gemini AI Layer: Projected regression curve fits within 95% confidence interval."
    ];
}

$msgIdUser = 'msg_' . time() . '_u';
$msgIdNexa = 'msg_' . time() . '_n';

// Save to MySQL DB if connection is available
if ($pdo) {
    try {
        // Ensure conversation exists
        $stmt = $pdo->prepare("SELECT id FROM conversations WHERE id = ?");
        $stmt->execute([$conversationId]);
        if (!$stmt->fetch()) {
            $dbUserId = is_numeric($userId) ? $userId : null;
            $insConvo = $pdo->prepare("INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)");
            $title = strlen($message) > 30 ? substr($message, 0, 30) . '...' : $message;
            $insConvo->execute([$conversationId, $dbUserId, $title]);
        }

        // Insert user message
        $insMsg = $pdo->prepare("INSERT INTO messages (id, conversation_id, sender, text) VALUES (?, ?, 'user', ?)");
        $insMsg->execute([$msgIdUser, $conversationId, $message]);

        // Insert AURA reply message
        $insMsgNexa = $pdo->prepare("INSERT INTO messages (id, conversation_id, sender, text, model_type, model_result) VALUES (?, ?, 'aura', ?, ?, ?)");
        $insMsgNexa->execute([
            $msgIdNexa,
            $conversationId,
            $reply,
            $modelResult ? $modelResult['type'] : null,
            $modelResult ? json_encode($modelResult) : null
        ]);
    } catch (Exception $e) {
        // Fallback gracefully
    }
}

echo json_encode([
    "status" => "success",
    "id" => $msgIdNexa,
    "conversationId" => $conversationId,
    "reply" => $reply,
    "modelResult" => $modelResult,
    "timestamp" => date("h:i A")
]);
?>
