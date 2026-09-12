USE device_lab_verify
GO
--Testerzy bez żadnych rezerwacji
select name as imie_testera, id as id_testera  from testers as t
where not exists (select 1 from reservations as r where t.id = r.tester_id);
GO
--Znalezienie urządzenia bez aktywnej rezerwacji z wykorzystaniem NOT EXISTS
SELECT id as id_urządzenia, name as nazwa_urządzenia from devices as devices
where not exists (select 1 from reservations as reservations where devices.id = reservations.device_id AND reservations.is_active=1)
GO
--Znajdź testerów, którzy nie mają żadnej aktywnej rezerwacji
SELECT id as id_testera, name as imię_testera from testers as t
where not exists(select 1 from reservations as r where t.id = r.tester_id AND r.is_active = 1)
GO
--Znajdź testerów, którzy mają historię rezerwacji, ale obecnie nie mają żadnej aktywnej rezerwacji
SELECT id as id_testera, name as imię_testera from testers as t
where exists(select 1 from reservations as r where t.id = r.tester_id) 
AND NOT EXISTS (select 1 from reservations as r where t.id = r.tester_id AND r.is_active=1)
GO