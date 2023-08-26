# Set environment variables for the session
$env:SERVER_ADDRESS = "localhost"
$env:SERVER_PORT = "8080"
$env:DB_USER = "root"
$env:DB_PASSWORD = "codecamp"
$env:DB_ADDRESS = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "banking"

# Run app
go run main.go