import sqlite3
from datetime import datetime
import os

# Funzione per ottenere una connessione al database
def get_db_connection():
    # Assicura che la cartella del database esista
    os.makedirs('database', exist_ok=True)
    # Crea una connessione al database SQLite
    conn = sqlite3.connect('database/expenses.db')
    conn.row_factory = sqlite3.Row
    return conn

# Funzione per aggiungere una nuova transazione
def add_transaction(description, amount, transaction_type, selected_month=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if selected_month:
        date = datetime.strptime(selected_month + '-01', '%Y-%m-%d')
    else:
        date = datetime.now()
    year = date.year
    month = date.month
    date_str = date.strftime("%Y-%m-%d")
    cursor.execute('INSERT INTO transactions (description, amount, date, type, year, month) VALUES (?, ?, ?, ?, ?, ?)',
                   (description, amount, date_str, transaction_type, year, month))
    conn.commit()
    conn.close()

# Funzione per ottenere tutte le transazioni
def get_all_transactions(year_month=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if year_month and year_month != 'undefined':
        year, month = map(int, year_month.split('-'))
        cursor.execute('SELECT * FROM transactions WHERE year = ? AND month = ? ORDER BY date DESC', (year, month))
    else:
        cursor.execute('SELECT * FROM transactions ORDER BY date DESC')
    transactions = cursor.fetchall()
    conn.close()
    return transactions

# Funzione per rimuovere una transazione
def remove_transaction(transaction_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Elimina la transazione con l'ID specificato
    cursor.execute('DELETE FROM transactions WHERE id = ?', (transaction_id,))
    conn.commit()
    conn.close()

# Funzione per ottenere il saldo attuale
def get_balance(year_month=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if year_month and year_month != 'undefined':
        year, month = map(int, year_month.split('-'))
        cursor.execute('SELECT SUM(CASE WHEN type = "income" THEN amount ELSE -amount END) as balance FROM transactions WHERE year = ? AND month = ?', (year, month))
    else:
        cursor.execute('SELECT SUM(CASE WHEN type = "income" THEN amount ELSE -amount END) as balance FROM transactions')
    balance = cursor.fetchone()['balance']
    conn.close()
    return balance or 0

# Funzione per ottenere il riepilogo mensile
def get_monthly_summary(year_month=None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if year_month and year_month != 'undefined':
        year, month = map(int, year_month.split('-'))
        cursor.execute('''
        SELECT 
            year || '-' || SUBSTR('0' || month, -2) as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        WHERE year = ? AND month = ?
        GROUP BY year, month
        ORDER BY year DESC, month DESC
        ''', (year, month))
    else:
        cursor.execute('''
        SELECT 
            year || '-' || SUBSTR('0' || month, -2) as month,
            SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
            SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
        FROM transactions
        GROUP BY year, month
        ORDER BY year DESC, month DESC
        ''')
    summary = cursor.fetchall()
    conn.close()
    return summary

def update_transaction(transaction_id, description, amount, transaction_type):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE transactions SET description = ?, amount = ?, type = ? WHERE id = ?',
                   (description, amount, transaction_type, transaction_id))
    conn.commit()
    conn.close()
