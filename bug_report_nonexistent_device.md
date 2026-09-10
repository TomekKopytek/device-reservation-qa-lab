Summary: Tworzenie rezerwacji z nieistniejącym w bazie urządzeniem zwraca status code 500, zamiast 404

Prerequisite: Brak sprzętu w tabeli devices o id=999, istnienie testera w tabeli testers o id=2

request: POST http://127.0.0.1:3000/reservations z body JSON {"device_id":999, "tester_id":2}

Expected result: Zwrócenie response status 404 z wiadomością o treści error: Device does not exist

Actual result: Zwrócenie response status 500 z error: Database error

Cause: Niepotwierdzona, wymaga inwestygacji

Fix: Wymaga odnalezienia przyczyny

SQL verifying query: SELECT * FROM reservations WHERE device_id = 999; 
result after sending request - 0 wierszy - nie utworzono rezerwacji dla urządzenia o id = 999