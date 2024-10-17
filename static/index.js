// Questa funzione mostra una sezione specifica dell'app e nasconde le altre
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => section.classList.add('hidden'));
    const currentSection = document.getElementById(sectionId);
    currentSection.classList.remove('hidden');
    if (window.innerWidth <= 640) {
        document.querySelectorAll('.ios-tab-item').forEach(item => item.classList.remove('text-blue-500'));
        document.querySelector(`.ios-tab-item[onclick="showSection('${sectionId}')"]`).classList.add('text-blue-500');
    } else {
        document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('bg-gray-700'));
        document.querySelector(`.sidebar-item[onclick="showSection('${sectionId}')"]`).classList.add('bg-gray-700');
    }

    // Popola il selettore di mese della sezione corrente
    populateMonthSelector(currentSection);
    
    // Carica i dati per il mese selezionato
    const monthSelector = currentSection.querySelector('.monthSelector');
    loadData(sectionId, monthSelector.value);

    // Imposta il mese corrente come valore predefinito per la sezione "Aggiungi Transazione"
    if (sectionId === 'addTransaction') {
        const monthSelector = currentSection.querySelector('.monthSelector');
        if (monthSelector) {
            const currentDate = new Date();
            const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM format
            monthSelector.value = currentMonth;
        }
    }
}

// Questa funzione apre e chiude la barra laterale su dispositivi mobili
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// Questa funzione viene eseguita quando la pagina è completamente caricata
document.addEventListener('DOMContentLoaded', () => {
    // Rimuovi il controllo per Feather Icons qui, poiché lo gestiamo nel file HTML
    loadBalance();
    loadTransactions();
    loadMonthlySummary();

    document.getElementById('transactionForm').addEventListener('submit', addTransaction);

    // Carica la sezione del dashboard all'avvio
    showSection('dashboard');
});

// Questa funzione carica e mostra il saldo attuale
async function loadBalance(month) {
    const response = await fetch(`/api/balance?month=${month}`);
    const data = await response.json();
    document.getElementById('balance').textContent = `€${data.balance.toFixed(2)}`;
}

// Questa funzione carica e mostra l'elenco delle transazioni
async function loadTransactions(month) {
    const response = await fetch(`/api/transactions?month=${month}`);
    const transactions = await response.json();
    const list = document.getElementById('transactionsList');
    const filterSelect = document.getElementById('transactionTypeFilter');
    
    function renderTransactions(filter = 'all') {
        list.innerHTML = '';
        transactions.forEach(tx => {
            if (filter === 'all' || tx.type === filter) {
                const li = document.createElement('li');
                li.className = 'flex justify-between items-center bg-white p-3 rounded shadow';
                li.innerHTML = `
                    <span>${tx.description} - €${tx.amount.toFixed(2)} (${tx.type === 'income' ? 'Entrata' : 'Uscita'})</span>
                    <div>
                        <button onclick="editTransaction(${tx.id}, '${tx.description}', ${tx.amount}, '${tx.type}')" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2">
                            <i data-feather="edit"></i>
                        </button>
                        <button onclick="deleteTransaction(${tx.id})" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                `;
                list.appendChild(li);
            }
        });
        updateIcons();
    }

    renderTransactions();

    filterSelect.addEventListener('change', (event) => {
        renderTransactions(event.target.value);
    });
}

// Questa funzione carica e mostra il riepilogo mensile
async function loadMonthlySummary(month) {
    const response = await fetch(`/api/monthly_summary?month=${month}`);
    const summary = await response.json();
    const list = document.getElementById('monthlySummaryList');
    list.innerHTML = '';
    summary.forEach(month => {
        const li = document.createElement('li');
        li.className = 'bg-white p-3 rounded shadow';
        li.innerHTML = `
            <h3 class="font-semibold">${month.month}</h3>
            <p class="text-green-600">Entrate: €${month.total_income.toFixed(2)}</p>
            <p class="text-red-600">Uscite: €${month.total_expense.toFixed(2)}</p>
        `;
        list.appendChild(li);
    });
}

// Questa funzione aggiunge una nuova transazione
async function addTransaction(event) {
    event.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;

    // Ottieni il mese selezionato dalla sezione "Aggiungi Transazione"
    const addTransactionSection = document.getElementById('addTransaction');
    const monthSelector = addTransactionSection.querySelector('.monthSelector');
    const selectedMonth = monthSelector ? monthSelector.value : '';

    const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount, type, month: selectedMonth }),
    });

    if (response.ok) {
        Swal.fire('Successo', 'Transazione aggiunta con successo', 'success');
        document.getElementById('transactionForm').reset();
        
        // Ricarica i dati per tutte le sezioni
        loadData('dashboard', selectedMonth);
        loadData('recentTransactions', selectedMonth);
        loadData('monthlySummary', selectedMonth);
    } else {
        Swal.fire('Errore', 'Impossibile aggiungere la transazione', 'error');
    }
}

// Questa funzione elimina una transazione esistente
async function deleteTransaction(id) {
    const result = await Swal.fire({
        title: 'Sei sicuro?',
        text: "Non potrai recuperare questa transazione!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sì, elimina!',
        cancelButtonText: 'Annulla'
    });

    if (result.isConfirmed) {
        const response = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
        if (response.ok) {
            await Swal.fire(
                'Eliminata!',
                'La transazione è stata eliminata.',
                'success'
            );
            // Ricarica la pagina
            location.reload();
        } else {
            Swal.fire('Errore', 'Impossibile eliminare la transazione', 'error');
        }
    }
}

// Questa funzione modifica una transazione esistente
async function editTransaction(id, description, amount, type) {
    const { value: formValues } = await Swal.fire({
        title: 'Modifica Transazione',
        html:
            `<input id="swal-description" class="swal2-input" value="${description}" placeholder="Descrizione">` +
            `<input id="swal-amount" class="swal2-input" type="number" value="${amount}" placeholder="Importo">` +
            `<select id="swal-type" class="swal2-input">
                <option value="income" ${type === 'income' ? 'selected' : ''}>Entrata</option>
                <option value="expense" ${type === 'expense' ? 'selected' : ''}>Uscita</option>
            </select>`,
        focusConfirm: false,
        preConfirm: () => {
            return {
                description: document.getElementById('swal-description').value,
                amount: document.getElementById('swal-amount').value,
                type: document.getElementById('swal-type').value
            }
        }
    });

    if (formValues) {
        const response = await fetch(`/api/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formValues),
        });

        if (response.ok) {
            await Swal.fire('Successo', 'Transazione modificata con successo', 'success');
            // Ricarica la pagina
            location.reload();
        } else {
            Swal.fire('Errore', 'Impossibile modificare la transazione', 'error');
        }
    }
}

// Carica la sezione del dashboard all'avvio
showSection('dashboard');

// Aggiungi questo alla fine del file
window.addEventListener('resize', () => {
    if (window.innerWidth > 640) {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebar').classList.remove('hidden');
    } else {
        document.getElementById('sidebar').classList.add('hidden');
    }
});

// Aggiungi questa funzione per gestire il click fuori dalla sidebar su mobile
document.addEventListener('click', (event) => {
    const sidebar = document.getElementById('sidebar');
    const sidebarContent = document.querySelector('.sidebar-content');
    if (window.innerWidth <= 640 && sidebar.classList.contains('active') && !sidebarContent.contains(event.target)) {
        sidebar.classList.remove('active');
    }
});

// Questa funzione popola il selettore dei mesi con le opzioni corrette
function populateMonthSelector(section) {
    const monthSelector = section.querySelector('.monthSelector');
    if (!monthSelector) return;

    monthSelector.innerHTML = ''; // Pulisci le opzioni esistenti

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 0; i < 12; i++) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const option = document.createElement('option');
        option.value = date.toISOString().slice(0, 7); // YYYY-MM format
        option.textContent = date.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
        monthSelector.appendChild(option);
    }

    monthSelector.addEventListener('change', () => {
        loadData(section.id, monthSelector.value);
    });
}

// Questa funzione carica i dati appropriati per ogni sezione
function loadData(sectionId, selectedMonth) {
    const month = selectedMonth || '';
    switch (sectionId) {
        case 'dashboard':
            loadBalance(month);
            break;
        case 'recentTransactions':
            loadTransactions(month);
            break;
        case 'monthlySummary':
            loadMonthlySummary(month);
            break;
        case 'addTransaction':
            // Non è necessario caricare dati per questa sezione
            break;
    }
}

// Questa funzione aggiorna le icone dopo aver caricato nuovi elementi
function updateIcons() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}