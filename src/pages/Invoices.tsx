import { useState, useEffect } from 'react';
import { invoiceService, supplierService } from '../services/api';
import type { Invoice, Supplier } from '../types';
import Navigation from '../components/Navigation';
import InvoiceModal from '../components/InvoiceModal';
import '../styles/Suppliers.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, suppliersData] = await Promise.all([
        invoiceService.getAllInvoices(),
        supplierService.getAllSuppliers(),
      ]);
      setInvoices(invoicesData);
      setSuppliers(suppliersData);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await invoiceService.deleteInvoice(id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete invoice';
      setError(message);
    }
  };

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    return supplier ? supplier.name : supplierId;
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSupplierName(invoice.supplierId).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>Invoice Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleAddInvoice} className="btn btn-primary">
              Add Invoice
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading invoices...</div>
          ) : (
            <div className="table-container">
              {filteredInvoices.length === 0 ? (
                <p className="no-data">No invoices found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.invoiceNo}>
                        <td>{invoice.invoiceNo}</td>
                        <td>{getSupplierName(invoice.supplierId)}</td>
                        <td>{new Date(invoice.date).toLocaleDateString()}</td>
                        <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="btn btn-small btn-secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.invoiceNo)}
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
          <InvoiceModal
            invoice={editingInvoice}
            suppliers={suppliers}
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

export default Invoices;
