README

1. Aplikacja służy do rezerwacji sprzętu przez testerów w organizacji.
2. Aby przygotować bazę, należy połączyć się z serwerem, zaimportować plik `setup.sql`, zamienić wartości bazy w `CREATE DATABASE X` i `USE X`, aby nie wykonywać operacji na istniejącej bazie, a następnie go wykonać. 
3. Aby uruchomić API, należy:
	1. Przejść do folderu z plikami package.json, index.js i db.js
	2. Otworzyć terminal i wykonać komendę `npm install`, aby zainstalować wymagane biblioteki
	3. W pliku `db.js` należy podmienić wartość zmiennych `server` i `Database` jeśli pracujemy na serwerze i bazie innych niż zdefiniowane.
	4. Uruchomić API przez terminal poprzez komendę `node index.js`. (Bazowo API znajduje się pod tym adresem po wykonaniu komendy "http://127.0.0.1:3000").
4. Aby wykonać cykl rezerwacja -> konflikt -> anulowanie -> ponowna rezerwacja, należy
	1. Zarezerwować poprzez POST request z odpowiednim body {"device_id":X,"tester_id":X} z wykorzystaniem endpointu /reservations, gdzie X muszą być liczbami całkowitymi (Urządzenie musi być wolne, a tester musi istnieć)(Wartości X są przykładowe, nie jest to gotowe body JSON, X muszą być liczbami całkowitymi).
	2. Dokonać próby rezerwacji ponownie tego samego sprzętu (z tym samym identyfikatorem przesłanym w poprzednim kroku) 
	3. Anulować istniejącą, aktywną rezerwację utworzoną w kroku 1, używając jej identyfikatora, poprzez request PATCH na endpoint /reservations/cancel, z body JSON {"reservation_id":10} (Numer rezerwacji należy wcześniej odczytać z aktualnej bazy, 10 jest tylko przykładem).
	4. Dokonać próby ponownego anulowania tej samej rezerwacji.
	5. Dokonać próby rezerwacji tego samego sprzętu
5. Aby sprawdzić skutki cyklu, należy zaimportować plik `checks.sql`, a następnie go wykonać
Oczekiwane odpowiedzi (USE musi wskazywać tą samą bazę co API):
	1. Utworzenie rezerwacji: 201, created.
	2. Rezerwacja zajętego sprzętu: 409, Device is already reserved.
	3. Anulowane: 200, cancelled.
	4. Ponowienie anulowania: 200, unchanged.
	5. Nowa rezerwacja zwolnionego sprzętu: 201, created.
WAŻNE!
Plik `setup.sql` służy do pierwszego utworzenia  bazy, numery rezerwacji w testach należy odczytywać z aktualnych danych.
IDENTYFIKATORY ORAZ OCZEKIWANE WYNIKI NALEŻY DOPASOWAĆ DO DANEGO TESTU.