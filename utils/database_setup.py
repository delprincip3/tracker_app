import sqlite3
import os

def setup_database():
    # Assicuriamoci che la cartella database esista
    os.makedirs('database', exist_ok=True)
    conn = sqlite3.connect('database/expenses.db')
    cursor = conn.cursor()

    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL
    )
    ''')

    conn.commit()
    conn.close()

if __name__ == '__main__':
    setup_database()
