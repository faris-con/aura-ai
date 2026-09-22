<?php
/* ==========================================================================
   AURA AI — Database Connection Helper (api/db.php)
   Hostinger Production MySQL, Local MySQL & SQLite Fallback
   ========================================================================== */

$host    = getenv('DB_HOST') ?: 'localhost';
$user    = getenv('DB_USER') ?: 'u721631946_aura';
$pass    = getenv('DB_PASS') ?: 'Farisss@1234';
$db      = getenv('DB_NAME') ?: 'u721631946_aura_db';
$port    = getenv('DB_PORT') ?: 3306;
$charset = 'utf8mb4';

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

$pdo = null;

// 1. Primary: Hostinger / Production MySQL Connection
try {
    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // 2. Try 127.0.0.1 direct IP connection
    try {
        $ipDsn = "mysql:host=127.0.0.1;port=$port;dbname=$db;charset=$charset";
        $pdo = new PDO($ipDsn, $user, $pass, $options);
    } catch (\PDOException $ex1) {
        // 3. Try Local XAMPP / WAMP Development MySQL
        try {
            $localDsn = "mysql:host=localhost;dbname=$db;charset=utf8mb4";
            $pdo = new PDO($localDsn, 'root', '', $options);
        } catch (\PDOException $ex2) {
            // 4. Fallback to Local SQLite for 100% Guaranteed Persistence
            try {
                $sqlitePath = __DIR__ . '/aura_database.sqlite';
                $pdo = new PDO("sqlite:" . $sqlitePath, null, null, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                ]);

                // Auto-provision SQLite tables if missing
                $pdo->exec("CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NULL,
                    full_name TEXT NOT NULL,
                    avatar TEXT NULL,
                    auth_provider TEXT DEFAULT 'local',
                    google_id TEXT NULL,
                    role TEXT DEFAULT 'HCIA AI Specialist',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )");

                $pdo->exec("CREATE TABLE IF NOT EXISTS conversations (
                    id TEXT PRIMARY KEY,
                    user_id INTEGER NULL,
                    guest_session_id TEXT NULL,
                    title TEXT NOT NULL DEFAULT 'New Conversation',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )");

                $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
                    id TEXT PRIMARY KEY,
                    conversation_id TEXT NOT NULL,
                    sender TEXT NOT NULL,
                    text TEXT NOT NULL,
                    model_type TEXT NULL,
                    model_result TEXT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )");
            } catch (\PDOException $err) {
                $pdo = null;
            }
        }
    }
}
?>
