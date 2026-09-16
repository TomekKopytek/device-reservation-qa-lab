# Device Lab API — projekt QA

Projekt edukacyjny służący do ćwiczenia testowania API, weryfikacji danych w SQL i testów współbieżności. Aplikacja umożliwia pobieranie listy urządzeń, rezerwowanie sprzętu przez testerów oraz anulowanie rezerwacji.

Zakres prac obejmuje testy pozytywne i negatywne w Postmanie, cykl rezerwacji, kontrolę skutków operacji w bazie, dokumentację OpenAPI oraz testy w Apache JMeter. Raporty z wykonanych scenariuszy znajdują się w `rezultaty.txt`.

## Technologie i wymagania

| Element | Zastosowanie |
|---|---|
| Windows | Środowisko, w którym wykonano testy |
| Node.js i npm | Uruchomienie API i instalacja zależności |
| SQL Server Express | Baza danych |
| SQL Server Management Studio | Uruchamianie skryptów i kontrola danych |
| ODBC Driver 18 for SQL Server | Połączenie API z bazą |
| `mssql` i `msnodesqlv8` | Obsługa SQL Server w Node.js |
| Postman | Testy funkcjonalne API |
| Apache JMeter 5.6.3 i Java | Testy obciążenia i równoczesnych rezerwacji |

API korzysta z wbudowanego modułu `node:http` oraz uwierzytelniania Windows do SQL Server. Konto uruchamiające API musi mieć dostęp do bazy. W testowanym środowisku JMeter uruchamiano z Java 25; nie jest to deklaracja minimalnej wymaganej wersji Javy.

## Pliki projektu

| Plik lub folder | Zawartość |
|---|---|
| `index.js` | Routing HTTP, walidacja żądań i odpowiedzi API |
| `db.js` | Połączenie z bazą i zapytania SQL |
| `setup.sql` | Utworzenie bazy, tabel, indeksu i danych początkowych |
| `checks.sql` | Zapytania kontrolne |
| `openapi.yaml` | Kontrakt API |
| `Postman_v2_1609.json` | Aktualna kolekcja Postmana |
| `JMeter/` | Plany JMetera i zapisane wyniki |
| `rezultaty.txt` | Raporty z testów |
| `bug_report*.md` | Opisy wykrytych wcześniej błędów |

Starsze eksporty Postmana dokumentują wcześniejsze etapy pracy. Do odtwarzania aktualnych testów należy używać kolekcji wskazanej powyżej.

## Przygotowanie bazy

1. Połącz się w SSMS ze swoją instancją SQL Server.
2. Otwórz `setup.sql` i sprawdź nazwę tworzonej bazy.
3. Uruchom skrypt dla nowej bazy. Domyślna nazwa to `device_lab_verify`.

Skrypt służy do pierwszego przygotowania środowiska; nie jest skryptem resetującym istniejącą bazę. Jeśli używasz innej nazwy, zmień ją w `CREATE DATABASE`, `USE`, konfiguracji `db.js` i uruchamianych skryptach kontrolnych.

Powstają tabele `devices`, `testers` i `reservations`. Klucze obce wymagają istnienia urządzenia i testera. Unikalny indeks filtrowany `unique_device` na `reservations(device_id)` dla `is_active = 1` chroni przed wieloma aktywnymi rezerwacjami jednego urządzenia.

### Dane początkowe

| ID urządzenia | Nazwa |
|---|---|
| 1 | PC testowy 01 |
| 2 | PC testowy 02 |
| 3 | XBOX testowy 01 |
| 4 | Steam Deck 01 |

| ID testera | Imię |
|---|---|
| 1 | Tomek |
| 2 | Anna |
| 3 | Paweł |

Na świeżej bazie tabela `reservations` jest pusta, więc wszystkie cztery urządzenia są dostępne. Lista urządzeń 1 i 4 widoczna w części raportów wynika ze stanu bazy podczas tamtych testów.

## Uruchomienie API

W folderze zawierającym `package.json` wykonaj:

```powershell
npm ci
```

W `db.js` sprawdź konfigurację:

| Ustawienie | Wartość domyślna |
|---|---|
| Serwer | `localhost\SQLEXPRESS` |
| Baza | `device_lab_verify` |
| Sterownik | `ODBC Driver 18 for SQL Server` |
| Uwierzytelnianie | Windows (`Trusted_Connection=Yes`) |

Następnie uruchom:

```powershell
node index.js
```

API nasłuchuje pod `http://127.0.0.1:3000`. Terminal musi pozostać uruchomiony. Po zmianach w kodzie zatrzymaj proces przez `Ctrl+C` i uruchom go ponownie.

Wywołaj `GET /health`. Oczekiwana odpowiedź to HTTP 200 i `{"status":"ok"}`. Ten endpoint potwierdza działanie serwera HTTP, ale nie sprawdza połączenia z bazą.

## Endpointy

Body żądań POST i PATCH należy wysyłać jako JSON z nagłówkiem `Content-Type: application/json`.

| Metoda | Ścieżka | Działanie i odpowiedzi |
|---|---|---|
| GET | `/health` | 200: serwer działa |
| GET | `/devices` | 200: wszystkie urządzenia; 500: błąd bazy |
| GET | `/devices/available` | 200: urządzenia bez aktywnej rezerwacji, także pusta tablica; 500: błąd bazy |
| POST | `/reservations` | 201: utworzono; 400: błędne dane; 404: brak urządzenia lub testera; 409: urządzenie zajęte; 500: błąd bazy |
| PATCH | `/reservations/cancel` | 200: `cancelled` lub `unchanged`; 400: błędne dane; 500: błąd bazy |

Listy urządzeń zawierają pola `identyfikator` i `nazwa_urządzenia`. Dokładne schematy i komunikaty odpowiedzi opisuje `openapi.yaml`.

Przykład utworzenia rezerwacji:

```json
{"device_id": 4, "tester_id": 1}
```

Odpowiedź 201 zawiera `status: created` oraz liczbowe `reservation_id`. Do anulowania użyj właśnie tego identyfikatora. Przykładowe body PATCH:

```json
{"reservation_id": 68}
```

Liczba 68 jest przykładem; należy zastąpić ją ID z własnego przebiegu. Anulowanie ustawia `is_active = 0`, zachowując historię. Ponowne anulowanie lub podanie nieistniejącego dodatniego ID zwraca HTTP 200 i `status: unchanged`.

## Testy w Postmanie

Zaimportuj `Postman_v2_1609.json`. Sprawdź zmienną kolekcji `base_url`, domyślnie `http://127.0.0.1:3000`. Jeśli korzystasz ze środowiska Postmana, upewnij się, że nie nadpisuje jej innym adresem.

### Powtarzalny cykl rezerwacji

Warunki: urządzenie 4 jest wolne, tester 1 istnieje, API i baza działają.

W Collection Runner uruchom wyłącznie folder **Cykl rezerwacji**. Zawiera on siedem kroków:

1. Sprawdzenie dostępności urządzenia 4.
2. Utworzenie rezerwacji i zapisanie `reservation_id` w zmiennej kolekcji.
3. Sprawdzenie, że urządzenie 4 nie jest dostępne.
4. Ponowna próba rezerwacji tego urządzenia — oczekiwany konflikt 409.
5. Anulowanie rezerwacji z wykorzystaniem zapisanej zmiennej.
6. Sprawdzenie ponownej dostępności urządzenia 4.
7. Ponowne anulowanie — oczekiwany status `unchanged`.

Jedna iteracja zawiera 24 testy Postmana. Dwie poprawne iteracje dają 48 testów PASSED. Po zakończeniu cyklu urządzenie 4 powinno być wolne. Jeśli przebieg przerwano, sprawdź stan rezerwacji przed ponowieniem.

### Pozostałe przypadki

Nie uruchamiaj całej kolekcji jako jednego scenariusza bez przygotowania danych. Poszczególne żądania wymagają różnych stanów środowiska.

| Przypadek | Przygotowanie i oczekiwanie |
|---|---|
| Nieistniejące urządzenie lub tester | Użyj ID, którego rzeczywiście nie ma w bazie; przy teście testera wybierz wolne urządzenie |
| Anulowanie aktywnej rezerwacji | Podstaw ID aktualnie aktywnej rezerwacji |
| Niepoprawne identyfikatory | Oczekiwane 400 i `Invalid identifiers` |
| Body `null` | Osobne żądania POST i PATCH; oczekiwane 400 i `Invalid identifiers` |
| Body `[]` i `{}` | Przypadki sprawdzone ręcznie; oczekiwane 400 i `Invalid identifiers` |
| Błędna składnia JSON | Oczekiwane 400 i `Invalid JSON` |
| Pusta lista dostępnych urządzeń | Zarezerwuj wszystkie aktualnie wolne urządzenia; oczekiwane 200 i `[]`; następnie anuluj rezerwacje utworzone na potrzeby testu |
| Niedostępność bazy | W lokalnym środowisku testowym zatrzymaj właściwą usługę SQL Server, pozostawiając API uruchomione; GET `/devices/available` powinien zwrócić 500 i `Database error`; przywróć usługę i sprawdź odpowiedź 200 |

Sam zapis odpowiedzi 500 w OpenAPI nie oznacza, że wykonano test awarii dla każdego endpointu. Udokumentowany test niedostępności bazy dotyczy GET `/devices/available`.

## Kontrola SQL

Uruchamiaj zapytania w bazie używanej przez API. W `checks.sql` filtry urządzeń 1 i 3 są przykładami; dopasuj je do scenariusza.

Do kontroli testów urządzenia 4 można użyć:

```sql
USE device_lab_verify;
GO
SELECT id, device_id, tester_id, is_active
FROM reservations
WHERE device_id = 4 AND is_active = 1;
```

Po udanym utworzeniu rezerwacji oczekiwany jest jeden rekord, a po anulowaniu — brak aktywnych rekordów dla tego urządzenia. Zapytanie wykrywające wiele aktywnych rezerwacji jednego urządzenia powinno zwracać pusty wynik.

Identyfikatory rezerwacji mogą zawierać luki. Nie należy określać liczby rekordów na podstawie największego ID ani zakładać, jaki numer otrzyma następna rezerwacja.

## Testy JMeter

Plany przygotowano w GUI, a właściwe przebiegi wykonywano z konsoli. Podczas uruchamiania API i baza muszą działać. Listener `View Results Tree` powinien być wyłączony w planach obciążeniowych.

Poniższe polecenia uruchamiaj w folderze `JMeter`. Zmień ścieżkę programu, jeśli JMeter jest zainstalowany w innym miejscu. Każdy przebieg powinien mieć nowy plik wyników oraz nowy lub pusty folder raportu.

### Pobieranie dostępnych urządzeń

| Parametr | Przebieg 1 | Przebieg 2 |
|---|---|---|
| Plan | `devices-available-10-users.jmx` | `devices-available-20-users.jmx` |
| Użytkownicy | 10 | 20 |
| Ramp-up | 5 s | 5 s |
| Czas | 60 s | 60 s |
| Pętla | Infinite | Infinite |
| Żądanie | GET `/devices/available` | GET `/devices/available` |
| Asercja | HTTP 200 | HTTP 200 |

Żądania ponawiane są bez dodatkowych przerw. Przykład uruchomienia:

```powershell
& "D:\JMeter\apache-jmeter-5.6.3\bin\jmeter.bat" -n -t ".\devices-available-10-users.jmx" -l ".\available-10-users-new.jtl" -e -o ".\report-10-users-new"
```

Dla 20 użytkowników wskaż odpowiedni plan i odrębne nazwy pliku wyników oraz raportu. Raport otworzysz przez `index.html` w wygenerowanym folderze.

Wyniki wykonanych lokalnie przebiegów:

| Wskaźnik | 10 użytkowników | 20 użytkowników |
|---|---:|---:|
| Żądania | 195 672 | 187 903 |
| Błędy | 0 | 0 |
| Średni czas | 2,93 ms | 6,11 ms |
| p95 | 4 ms | 7 ms |
| p99 | 5 ms | 10 ms |
| Przepustowość | 3263,05 żądania/s | 3133,39 żądania/s |

W tych przebiegach zwiększenie liczby użytkowników podniosło czasy odpowiedzi bez wzrostu przepustowości. Wyniki nie określają maksymalnej wydajności API ani przyczyny ograniczenia. Nie ustalono progów akceptacji czasów odpowiedzi.

### Równoczesna rezerwacja

Plan: `reservation-concurrency.jmx`.

Warunki: wolne urządzenie 4, istniejący tester 1. Konfiguracja: 10 użytkowników, ramp-up 1 sekunda, po jednym żądaniu POST `/reservations` z body `{"device_id":4,"tester_id":1}`. Synchronizing Timer grupuje 10 użytkowników z timeoutem 10 000 ms.

Response Assertion sprawdza Response Code, ma zaznaczone Equals, Or i Ignore Status. Kody 201 i 409 muszą być zapisane w dwóch osobnych wierszach.

```powershell
& "D:\JMeter\apache-jmeter-5.6.3\bin\jmeter.bat" -n -t ".\reservation-concurrency.jmx" -l ".\reservation-concurrency-new.jtl"

Import-Csv ".\reservation-concurrency-new.jtl" | Group-Object responseCode | Select-Object Name, Count
```

Oczekiwany wynik to dokładnie jedna odpowiedź 201, dziewięć odpowiedzi 409 oraz zero błędów asercji. Samo zaakceptowanie obu kodów nie wystarcza — trzeba sprawdzić ich liczby.

Przed anulowaniem sprawdź w SQL, że urządzenie 4 ma dokładnie jedną aktywną rezerwację. Zapisz jej ID, anuluj ją przez API i potwierdź dostępność urządzenia. Dopiero po przywróceniu tego stanu ponawiaj test.

Udokumentowany przebieg spełnił te oczekiwania. Szczegóły znajdują się w teście 16 w `rezultaty.txt`.

## Ograniczenia i zakres

Projekt jest lokalnym laboratorium QA. Nie zawiera uwierzytelniania użytkowników ani kontroli uprawnień. Parametry połączenia z bazą oraz adres i port API są zapisane w kodzie.

CORS skonfigurowano tylko dla GET `/health` i originu `https://editor.swagger.io`. Pozostałe endpointy należy testować np. w Postmanie lub JMeterze; obsługa wywołań z przeglądarki nie jest kompletna.

Testy zależne od danych wymagają przygotowania stanu początkowego. Kolekcja jako całość nie stanowi automatycznie odtwarzalnego scenariusza; taką sekwencją jest folder `Cykl rezerwacji` przy opisanych warunkach.

Skrypt `npm test` jest domyślnym placeholderem i nie uruchamia testów projektu. Testy wykonuje się opisanymi narzędziami. Pomiary wydajności dotyczą lokalnego środowiska i nie są deklaracją parametrów produkcyjnych.
