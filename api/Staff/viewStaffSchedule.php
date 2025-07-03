<?php 
header("Content-Type: application/json");
include(__DIR__ . '/../../includes/conf.php');  //Connects with the database.


$role = $_POST['role'] ?? $_SESSION['role']   ?? null;
$staff_id = $_POST['user_id'] ?? $_SESSION['user_id'] ??  null;

if (!$role || !$staff_id){
    echo json_encode(["status" => "error", "message" => "Role or staff ID is missing"]);
    exit;
} 

if($role !== 'staff' && $role !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Unauthorized access"]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $staff_id, $role);
if (!$stmt->execute()) {
    echo json_encode(["status" => "error", "message" => "SQL statement execution error"]);
    exit;
}
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Staff not found or invalid role"]);
    exit;
}
$stmt->close();

     $page_num = isset($_GET['page']) && is_numeric($_GET['page']) ? intval($_GET['page']) : 1;  //This is ternary operator, it's syntax is: condition ? value_if_true : value_if_false
    $limit = 10;
    $offset = ($page_num - 1) * $limit;

    // SQL query to fetch appointments for the staff
    // Including client name, service name, date, time, and status
    $sql = "
    SELECT 
        a.id AS appointment_id,
        u.full_name AS client_name,
        s.name AS service_name, 
        a.date, 
        a.time, 
        a.status
    FROM appointments a
    JOIN users u ON a.client_id = u.id
    JOIN services s ON a.service_id = s.id
    WHERE a.staff_id = ?
    ORDER BY a.date, a.time 
    LIMIT ? OFFSET ?
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iii", $staff_id, $limit, $offset);
    // Check if the SQL statement execution is successful

    if (!$stmt->execute()) {
        echo json_encode(["status" => "error", "message" => "SQL statement execution error"]);
        exit;
    }

    $result = $stmt->get_result();
    $appointments = [];

    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }

    echo json_encode([
        "status" => "success",
        "data" => $appointments
    ]);

    $stmt->close();




$conn->close();
?>
