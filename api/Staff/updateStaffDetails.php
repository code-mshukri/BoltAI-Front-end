<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
include(__DIR__."/../../includes/CsrfHelper.php");

CsrfHelper::validateToken();

$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if (!$role || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

// Confirm admin identity
$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}
$stmt->close();

// Handle incoming update
$staff_id = $_POST['staff_id'] ?? null;
if (!$staff_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing staff ID."
    ]);
    exit;
}

// Fetch existing values
$sql = "SELECT salary_per_hour, notes FROM staff_details WHERE staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Staff member not found."
    ]);
    exit;
}
$current = $result->fetch_assoc();
$stmt->close();

// Use new values only if provided, otherwise fallback to current ones
$salary_per_hour = isset($_POST['salary_per_hour']) ? floatval($_POST['salary_per_hour']) : $current['salary_per_hour'];
$notes = isset($_POST['notes']) ? $_POST['notes'] : $current['notes'];

// Perform update
$sql = "UPDATE staff_details SET salary_per_hour = ?, notes = ? WHERE staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("dsi", $salary_per_hour, $notes, $staff_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Staff details updated successfully!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to update staff details."
    ]);
}

$stmt->close();
$conn->close();
?>
