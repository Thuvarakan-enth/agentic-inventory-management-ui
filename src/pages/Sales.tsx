import { useState, useEffect } from 'react';
import { transactionService, productService } from '../services/api';
import type { Transaction, Product } from '../types';
import Navigation from '../components/Navigation';
import SaleModal from '../components/SaleModal';
import '../styles/Suppliers.css';

const Sales = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, productsData] = await Promise.all([
        transactionService.getAllTransactions(),
        productService.getAllProducts(),
      ]);
      setTransactions(transactionsData);
      setProducts(productsData);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSale = () => {
    setViewingTransaction(null);
    setShowModal(true);
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await transactionService.deleteTransaction(id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete transaction';
      setError(message);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>Sales Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleCreateSale} className="btn btn-primary">
              Create Sale
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading transactions...</div>
          ) : (
            <div className="table-container">
              {filteredTransactions.length === 0 ? (
                <p className="no-data">No transactions found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Payment Method</th>
                      <th>Gross Amount</th>
                      <th>Discount</th>
                      <th>Net Amount</th>
                      <th>Paid Amount</th>
                      <th>Balance</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.transactionId}>
                        <td>{transaction.transactionId}</td>
                        <td>{transaction.paymentMethod}</td>
                        <td>${transaction.grossAmount.toFixed(2)}</td>
                        <td>${transaction.discountAmount.toFixed(2)}</td>
                        <td>${transaction.netAmount.toFixed(2)}</td>
                        <td>${transaction.paidAmount.toFixed(2)}</td>
                        <td>${transaction.balanceAmount.toFixed(2)}</td>
                        <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleViewTransaction(transaction)}
                              className="btn btn-small btn-secondary"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction.transactionId)}
                              className="btn btn-small btn-danger"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <SaleModal
            transaction={viewingTransaction}
            products={products}
            onSave={async () => {
              setShowModal(false);
              await loadData();
            }}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Sales;
