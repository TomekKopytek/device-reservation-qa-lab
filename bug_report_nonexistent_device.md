Summary: Tworzenie rezerwacji z nieistniejącym w bazie urządzeniem zwraca status code 500, zamiast 404

Prerequisite: Brak sprzętu w tabeli devices o id=999, istnienie testera w tabeli testers o id=2

request: POST http://127.0.0.1:3000/reservations z body JSON {"device_id":999, "tester_id":2}

Expected result: Zwrócenie response status 404 z wiadomością o treści error: Device does not exist

Actual result: Zwrócenie response status 500 z error: Database error

Cause: Błąd klucza obcego 547 trafiał do ogólnej odpowiedzi o kodzie 500

Fix: Dodanie obsługi błędu 547 z rozróżnieniem na nieistniejące urządzenie (kod 404 i error:Device does not exist) i nieistniejącego użytkownika (kod 404 i error:Tester does not exist)

SQL verifying query: SELECT * FROM reservations WHERE device_id = 999; 
result after sending request - 0 wierszy - nie utworzono rezerwacji dla urządzenia o id = 999

Regression's results:
1. Utworzenie rezerwacji wolnego urządzenia =3 przez istniejącego testera=1 - status code 201, nowy rekord istnieje
2. Próba utworzenia rezerwacji urządzenia =3 przez innego, istniejącego testera=2 - status code 409, brak nowego rekordu

Retests' results:
-Nieistniejące urządzenie - 404, error:"Device does not exist"
-Nieistniejący tester - 404, error:"Tester does not exist"
-SQL potwierdził brak rezerwacji z device_id=999 lub tester_id=999