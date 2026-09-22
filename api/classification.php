<?php
/* ==========================================================================
   NEXA — HCIA AI Intelligence Platform
   PHP API: Classification Inference Endpoint (api/classification.php)
   ========================================================================== */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

echo json_encode([
    "status" => "success",
    "model" => "Random Forest & SVM Ensemble",
    "prediction" => "Category Alpha: Low Risk Profile",
    "confidence" => 91.5,
    "featureWeights" => [
        ["feature" => "User Account Longevity", "weight" => 0.38],
        ["feature" => "Platform Activity Recency", "weight" => 0.29],
        ["feature" => "Interaction Frequency", "weight" => 0.18],
        ["feature" => "Secondary Metadata", "weight" => 0.15]
    ],
    "geminiExplanation" => "Gemini AI Layer: The customer churn model evaluates low churn probability due to sustained feature stability over recent quarter metrics."
]);
?>
