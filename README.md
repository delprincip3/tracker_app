# Expenses Tracker App

Expenses Tracker è un'applicazione web per il monitoraggio delle spese personali, sviluppata utilizzando Flask per il backend e JavaScript vanilla per il frontend.

## Caratteristiche

- Dashboard con visualizzazione del saldo attuale
- Aggiunta di nuove transazioni (entrate e uscite)
- Visualizzazione delle transazioni recenti con possibilità di filtraggio
- Riepilogo mensile delle entrate e delle uscite
- Interfaccia responsive con design ispirato a macOS per desktop e iOS per mobile
- Selezione del mese per visualizzare i dati specifici
- Possibilità di modificare ed eliminare le transazioni esistenti

## Tecnologie utilizzate

- Backend: Python con Flask
- Frontend: HTML, CSS (Tailwind CSS), JavaScript
- Database: SQLite
- Icone: Feather Icons
- Alert: SweetAlert2

## Struttura del progetto

- `app.py`: Il file principale dell'applicazione Flask
- `static/`:
  - `index.html`: La pagina HTML principale
  - `index.js`: Il file JavaScript principale per la logica del frontend
- `utils/`:
  - `db_utils.py`: Funzioni di utilità per l'interazione con il database
  - `database_setup.py`: Script per l'inizializzazione del database

## Installazione e avvio

1. Clona il repository:
   ```
   git clone https://github.com/delprincip3/expenses-tracker.git
   cd expenses-tracker
   ```

2. Crea un ambiente virtuale e attivalo:
   ```
   python -m venv venv
   source venv/bin/activate  # Per Linux/macOS
   venv\Scripts\activate  # Per Windows
   ```

3. Installa le dipendenze:
   ```
   pip install -r requirements.txt
   ```

4. Inizializza il database:
   ```
   python utils/database_setup.py
   ```

5. Avvia l'applicazione:
   ```
   python app.py
   ```

6. Apri un browser e vai all'indirizzo `http://localhost:5001`

## Contribuire

Sei libero di contribuire a questo progetto. Per favore, apri una issue o una pull request per eventuali miglioramenti o correzioni di bug.

## Licenza

Questo progetto è rilasciato sotto la licenza MIT. Vedi il file `LICENSE` per maggiori dettagli.
