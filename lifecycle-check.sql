USE device_lab_verify;
GO

SELECT id AS identyfikator_rezerwacji, tester_id AS identyfikator_testera, is_active AS czy_aktywne FROM reservations
WHERE device_id=3;