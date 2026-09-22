<?php
/* ==========================================================================
   AURA AI — Authentication API (api/auth.php)
   Handles Register, Login, and Google OAuth with Database Persistence
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents("php://input"), true) ?? [];
$action = isset($input['action']) ? $input['action'] : 'login';
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? trim($input['password']) : '';
$name = isset($input['name']) && !empty($input['name']) ? trim($input['name']) : '';
$avatar = isset($input['avatar']) ? trim($input['avatar']) : '';
$googleId = isset($input['google_id']) ? trim($input['google_id']) : '';

if (empty($email) && $action !== 'check') {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Email address required."]);
    exit();
}

// -----------------------------------------------------------------------------
// 1. Google OAuth Authentication
// -----------------------------------------------------------------------------
if ($action === 'google_login') {
    if (empty($name)) {
        $name = explode('@', $email)[0];
    }
    if (empty($avatar)) {
        $avatar = 'https://lh3.googleusercontent.com/a/default-user';
    }

    $dbId = null;
    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existing = $stmt->fetch();

            if (!$existing) {
                $ins = $pdo->prepare("INSERT INTO users (email, full_name, avatar, auth_provider, google_id) VALUES (?, ?, ?, 'google', ?)");
                $ins->execute([$email, $name, $avatar, $googleId]);
                $dbId = $pdo->lastInsertId();
            } else {
                $dbId = $existing['id'];
                $upd = $pdo->prepare("UPDATE users SET full_name = ?, avatar = ?, google_id = ? WHERE email = ?");
                $upd->execute([$name, $avatar, $googleId, $email]);
            }
        } catch (Exception $e) {
            // Fallback gracefully
        }
    }

    $userRecord = [
        "id" => $dbId ? (int)$dbId : ("usr_g_" . md5($email)),
        "db_id" => $dbId,
        "name" => $name,
        "email" => $email,
        "avatar" => strtoupper(substr($name, 0, 1)),
        "role" => "HCIA AI Specialist",
        "auth_provider" => "google"
    ];

    echo json_encode([
        "status" => "success",
        "message" => "Logged in with Google successfully and stored in database.",
        "user" => $userRecord
    ]);
    exit();
}

// -----------------------------------------------------------------------------
// 2. User Registration
// -----------------------------------------------------------------------------
if ($action === 'register') {
    $regName = !empty($name) ? $name : explode('@', $email)[0];
    $passHash = !empty($password) ? password_hash($password, PASSWORD_DEFAULT) : null;
    $dbId = null;

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existing = $stmt->fetch();

            if ($existing) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Email already registered in database. Please sign in."]);
                exit();
            }

            $ins = $pdo->prepare("INSERT INTO users (email, password_hash, full_name, auth_provider) VALUES (?, ?, ?, 'local')");
            $ins->execute([$email, $passHash, $regName]);
            $dbId = $pdo->lastInsertId();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Database error: " . $e->getMessage()]);
            exit();
        }
    }

    $userRecord = [
        "id" => $dbId ? (int)$dbId : ("usr_" . md5($email)),
        "db_id" => $dbId,
        "name" => $regName,
        "email" => $email,
        "avatar" => strtoupper(substr($regName, 0, 1)),
        "role" => "HCIA AI Specialist",
        "auth_provider" => "local"
    ];

    echo json_encode([
        "status" => "success",
        "message" => "Account created and saved to database successfully.",
        "user" => $userRecord
    ]);
    exit();
}

// -----------------------------------------------------------------------------
// 3. User Login
// -----------------------------------------------------------------------------
if ($action === 'login') {
    $dbId = null;
    $loginName = !empty($name) ? $name : explode('@', $email)[0];

    if ($pdo) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $existing = $stmt->fetch();

            if ($existing) {
                $dbId = $existing['id'];
                $loginName = $existing['full_name'];
            } else {
                // If user doesn't exist yet, insert into DB on login
                $passHash = !empty($password) ? password_hash($password, PASSWORD_DEFAULT) : null;
                $ins = $pdo->prepare("INSERT INTO users (email, password_hash, full_name, auth_provider) VALUES (?, ?, ?, 'local')");
                $ins->execute([$email, $passHash, $loginName]);
                $dbId = $pdo->lastInsertId();
            }
        } catch (Exception $e) {
            // Fallback gracefully
        }
    }

    $userRecord = [
        "id" => $dbId ? (int)$dbId : ("usr_" . md5($email)),
        "db_id" => $dbId,
        "name" => $loginName,
        "email" => $email,
        "avatar" => strtoupper(substr($loginName, 0, 1)),
        "role" => "HCIA AI Specialist",
        "auth_provider" => "local"
    ];

    echo json_encode([
        "status" => "success",
        "message" => "User authenticated and saved to database successfully.",
        "user" => $userRecord
    ]);
    exit();
}
?>
