from flask import Flask, send_from_directory, request, jsonify
from utils.db_utils import add_transaction, get_all_transactions, remove_transaction, get_balance, get_monthly_summary, update_transaction as db_update_transaction
from utils.database_setup import setup_database

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Questa funzione gestisce le richieste per ottenere o aggiungere transazioni
@app.route('/api/transactions', methods=['GET', 'POST'])
def transactions():
    if request.method == 'POST':
        data = request.json
        add_transaction(data['description'], data['amount'], data['type'], data.get('month'))
        return jsonify({"success": True}), 201
    else:
        year_month = request.args.get('month')
        transactions = get_all_transactions(year_month)
        return jsonify([dict(tx) for tx in transactions])

# Questa funzione gestisce la richiesta per eliminare una transazione
@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    remove_transaction(transaction_id)
    return jsonify({"success": True}), 200


# Questa funzione gestisce la richiesta per aggiornare una transazione
@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction_route(transaction_id):
    data = request.json
    db_update_transaction(transaction_id, data['description'], data['amount'], data['type'])
    return jsonify({"success": True}), 200

# Questa funzione restituisce il saldo attuale
@app.route('/api/balance')
def balance():
    year_month = request.args.get('month')
    return jsonify({"balance": get_balance(year_month)})


# Questa funzione restituisce il riepilogo mensile
@app.route('/api/monthly_summary')
def monthly_summary():
    year_month = request.args.get('month')
    summary = get_monthly_summary(year_month)
    return jsonify([dict(month) for month in summary])

if __name__ == '__main__':
    setup_database()
    app.run(debug=True, host='0.0.0.0', port=5001)
