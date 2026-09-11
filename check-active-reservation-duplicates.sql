USE device_lab_verify;

--Sprawdzenie, czy istnieje urządzenie, które ma więcej niż jedną, aktywną rezerwację
select device_id as id_urządzenia,COUNT(*) as liczba_aktywnych_rezerwacji from reservations
where is_active = 1
GROUP BY device_id
HAVING COUNT(*)>1
go
