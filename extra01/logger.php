<?php
// logger.php - The "Brain"
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 1. Get the raw data sent from javascript
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    // 2. Add a Timestamp
    $data['timestamp'] = date('Y-m-d H:i:s');
    
    // 3. File to store logs (Hidden JSON file)
    $file = 'secret_activity_logs.json';
    
    // 4. Read existing logs
    $current_data = file_exists($file) ? json_decode(file_get_contents($file), true) : [];
    if (!is_array($current_data)) $current_data = [];
    
    // 5. Add new log to the top
    array_unshift($current_data, $data);
    
    // 6. Save back to file
    file_put_contents($file, json_encode($current_data, JSON_PRETTY_PRINT));
    
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => "No data received"]);
}
?>