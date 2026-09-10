--wybranie bazy device_lab
use device_lab

--Wybranie wszystkich pół z rezerwacji konkretnego urządzenia - rezerwacja 10 anulowana, 15 aktywna
select * from reservations
where device_id=3
GO

--wykrywanie konfliktów - zero konfliktów
SELECT device_id, COUNT(is_active) as reserved_by_amount from reservations
where is_active = 1
GROUP BY device_id
HAVING COUNT(is_active) > 1
GO

--wyświetlenie id rezerwacji, imienia testera i zarezerwowanego urządzenia - anna,rezerwacja 7
SELECT reservations.id as id_rezerwacji, testers.name as imie_rezerwujacego, devices.name as zarezerwowane_urządzenie from reservations
JOIN testers on reservations.tester_id = testers.id
JOIN devices on reservations.device_id = devices.id
where device_id=1 AND is_active=1
GO

--wyświetlenie wolnego sprzętu - tylko steamdeck, urządzenie 4
SELECT devices.name as nazwa_urzadzenia, reservations.id as id_rezerwacji, reservations.is_active as czy_aktywny from devices
LEFT JOIN reservations ON devices.id = reservations.device_id AND reservations.is_active=1
WHERE reservations.is_active IS NULL;

