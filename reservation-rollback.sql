--Wybór bazy device_lab_verify
USE device_lab_verify;
GO
--ROZPOCZĘCIE TRANSAKCJI
BEGIN TRANSACTION;
GO

--Zmiana statusu rezerwacji z aktywnej na nieaktywną
UPDATE reservations
SET is_active=0 where id=3;
GO

--weryfikacja zmiany statusu rezerwacji
SELECT testers.id as identyfikator_testera, testers.name as imię_testera, COUNT(reservations.id) as liczba_rezerwacji, SUM(CASE WHEN reservations.is_active=1 THEN 1 ELSE 0 END) as suma_aktywnych_rezerwacji, SUM(CASE WHEN is_active=0 then 1 else 0 END) as suma_anulowanych_rezerwacji FROM testers
LEFT JOIN reservations ON reservations.tester_id = testers.id
GROUP BY testers.id, testers.name;

--Wycofanie transakcji
ROLLBACK;
GO

--QUERY do podsumowania rezerwacji testerów
SELECT testers.id as identyfikator_testera, testers.name as imię_testera, COUNT(reservations.id) as liczba_rezerwacji, SUM(CASE WHEN reservations.is_active=1 THEN 1 ELSE 0 END) as suma_aktywnych_rezerwacji, SUM(CASE WHEN is_active=0 then 1 else 0 END) as suma_anulowanych_rezerwacji FROM testers
LEFT JOIN reservations ON reservations.tester_id = testers.id
GROUP BY testers.id, testers.name;