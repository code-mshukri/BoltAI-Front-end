<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");


$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;
if (!$role || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing required fields."
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? and role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if (!$stmt->execute()) {
    echo json_encode([
        "status" => "error",
        "message" => "SQL execution error"
    ]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}



$sql = "SELECT u.id AS staff_id, u.full_name, u.email, u.phone, u.dob, sd.salary_per_hour, sd.notes
        FROM users u
        JOIN staff_details sd ON u.id = sd.staff_id
        WHERE u.role = 'staff'";

$result = $conn->query($sql);

$staff_list = [];
while($row = $result->fetch_assoc()) {
    $staff_list[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $staff_list
]);

$conn->close();
?>
