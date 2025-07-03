<?php 
header("Content-Type: application/json");
include(__DIR__."/../../includes/conf.php");
date_default_timezone_set('Asia/Jerusalem');


$admin_id = $_POST['user_id'] ?? $_SESSION['user_id'] ?? null;
$role = $_POST['role'] ?? $_SESSION['role'] ?? null;

if ($role !== 'admin' || !$admin_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Unauthorized access"
    ]);
    exit;
}

$sql = "SELECT id FROM users WHERE id = ? AND role = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $admin_id, $role);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Unauthorized access."
        ]
        );
        exit;
}

$staff_id = $_POST['staff_id'] ?? null;
$period = $_POST['period'] ?? null;

$sql = "SELECT id FROM users WHERE id = ? AND role = 'staff'";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();
if($result->num_rows === 0){
    echo json_encode(
        [
            "status" => "error",
            "message" => "Unauthorized access."
        ]
        );
        exit;
}

$conditions = "staff_id = ?";
$params = [$staff_id];
$type = "i";

switch ($period){
    case 'day':
        $conditions .= " AND DATE(check_in) = CURDATE()";
        break;
    case 'week': 
        $conditions .= " AND WEEK(check_in) = WEEK(CURDATE()) AND YEAR(check_in) = YEAR(CURDATE())";
        break;
    case 'month':
        $conditions .= " AND MONTH(check_in) = MONTH(CURDATE()) AND YEAR(check_in) = YEAR(CURDATE())";
        break;
    case 'all':
        default:
        break;
}

$sql = "SELECT SUM(duration_minutes) AS total_minutes FROM work_log WHERE $conditions";
$stmt = $conn->prepare($sql);
$stmt->bind_param($type, ...$params);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$total_minutes = $row['total_minutes'] ?? 0;
$worked_hours = round($total_minutes/60, 2);

$sql = "SELECT salary_per_hour FROM staff_details WHERE staff_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $staff_id);
if(!$stmt->execute()){
    echo json_encode(
        [
            "status" => "error",
            "message" => "SQL execution error."
        ]
        );
        exit;
}
$salary_result = $stmt->get_result();
$row = $salary_result->fetch_assoc();
$salary_per_hour = $row['salary_per_hour'] ?? 0;

$salary = round($salary_per_hour * $worked_hours, 2);

echo json_encode([
    "status" => "success",
    "staff_id" => $staff_id,
    "period" => $period,
    "hours_worked" => $worked_hours,
    "salary_per_hour" => $salary_per_hour,
    "calculated_salary" => $salary
]);




?>