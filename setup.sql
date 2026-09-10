--Utworzenie bazy device_lab i wybranie jej
CREATE DATABASE device_lab_verify
GO
USE device_lab_verify
GO

--Utworzenie tabeli devices
CREATE TABLE devices(
	id INT IDENTITY(1,1) PRIMARY KEY,
	name NVARCHAR(100) NOT NULL,
	platform NVARCHAR(30) NOT NULL
)
GO
--Utworzenie tabeli testers
CREATE TABLE testers(
	id INT IDENTITY(1,1) PRIMARY KEY,
	name NVARCHAR(100) NOT NULL
)
GO
--UTWORZENIE TABELI RESERVATIONS z kluczami obcymi
CREATE TABLE reservations(
	id INT IDENTITY(1,1) PRIMARY KEY,
	device_id INT NOT NULL,
	tester_id INT NOT NULL,
	is_active BIT NOT NULL,
	CONSTRAINT fk_devices_id FOREIGN KEY (device_id) REFERENCES devices(id),
	CONSTRAINT fk_testers_id FOREIGN KEY (tester_id) REFERENCES testers(id)
)
GO
--UTWORZENIE UNIQUE INDEX 
CREATE UNIQUE INDEX unique_device ON reservations(device_id) WHERE is_active=1 

--UTWORZENIE REKORDÓW W DEVICES
INSERT INTO devices(name,platform)
VALUES
	(N'PC testowy 01','Windows'),
	(N'PC testowy 02', 'Windows'),
	(N'XBOX testowy 01', 'Xbox'),
	(N'Steam Deck 01', 'SteamOS')
GO

--UTWORZENIE REKORDÓW W TESTERS
INSERT INTO testers(name)
VALUES
	(N'Tomek'),
	(N'Anna'),
	(N'Paweł')
GO
