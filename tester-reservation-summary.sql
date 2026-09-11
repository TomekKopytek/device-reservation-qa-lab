USE device_lab_verify;
GO
--Wypisanie id testera, imienia testera, sumy wszystkich rezerwacji(aktywnych i nieaktywnych),  a także rozgraniczenie na sumę wszystkich aktywnych i sumę wszystkich nieaktywnych rezerwacji.
SELECT testers.id as identyfikator_testera, testers.name as imię_testera, COUNT(reservations.id) as liczba_rezerwacji, SUM(CASE WHEN reservations.is_active=1 THEN 1 ELSE 0 END) as suma_aktywnych_rezerwacji, SUM(CASE WHEN is_active=0 then 1 else 0 END) as suma_anulowanych_rezerwacji FROM testers
LEFT JOIN reservations ON reservations.tester_id = testers.id
GROUP BY testers.id, testers.name;
GO

SELECT * FROM reservations where tester_id=1