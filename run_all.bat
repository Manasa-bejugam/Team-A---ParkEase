@echo off
echo Starting Smart Parking Components...

echo Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "cd parking-validator && mvn spring-boot:run"

echo Waiting for backend to start (15 seconds)...
timeout /t 15 /nobreak

echo Starting Frontend...
start "Frontend" cmd /k "cd myapp2/myapp && npm install && npm start"

echo All services launched in separate windows.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
