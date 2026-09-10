Summary:
Utworzenie rezerwacji na sprzęcie z aktywną rezerwacją zwraca kod 500 zamiast 409.

prerequisites:
Urządzenie posiada aktywną rezerwację przypisaną do testera

Steps to Reproduce:
1. Wyślij POST http://127.0.0.1:3000/reservations z body JSON { "device_id":X, "tester_id":X }, gdzie X są liczbami całkowitymi, większymi od zera. device_id musi wskazywać urządzenie z aktywną rezerwacją, a tester_id istniejącego testera.

Expected result:
API zwraca wynik 409 Conflict. Druga rezerwacja tego samego urządzenia nie zostaje utworzona w bazie.
Actual result: 
API zwraca 500 Internal Server Error z odpowiedzią {"error":"Database error"}

SQL verifying query:
SELECT * FROM reservations WHERE device_id = X;
--X jest identyfikatorem uprzednio zarezerwowanego sprzętu.

Cause: Indeks `unique_device` prawidłowo blokował zapis, zgłaszając błąd SQL server `2601`. Api traktowało go jako ogólny błąd bazy.
Fix: Dodano rozpoznawanie tego numeru i odpowiedź `409`.

Results after implementing the fix:
Ponowienie requestu z stepu nr 1 zwraca `409 Conflict` z odpowiedzią {"error":"Device is already reserved"}

SQL potwierdza, że dane rezerwacji pozostały bez zmian.

UWAGA: Przykłady zawierają symbole zastępcze. Przed wykonaniem testu należy podstawić identyfikatory z aktualnych danych.
