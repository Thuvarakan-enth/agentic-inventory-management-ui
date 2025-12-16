import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { invoiceService } from '../services/api';
import type { Invoice, InvoiceCreateRequest, Supplier } from '../types';
import '../styles/Modal.css';

interface InvoiceModalProps {
  invoice: Invoice | null;
  suppliers: Supplier[];
  onSave: () => void;
  onClose: () => void;
}

const InvoiceModal = ({ invoice, suppliers, onSave, onClose }: InvoiceModalProps) => {
  const [invoiceNo, setInvoiceNo] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice) {
      setInvoiceNo(invoice.invoiceNo);
      setSupplierId(invoice.supplierId);
      setDate(invoice.date.split('T')[0]);
    } else {
      // Set today's date as default
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [invoice]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!supplierId) {
      setError('Please select a supplier');
      return;
    }

    setLoading(true);

    try {
      const invoiceData: InvoiceCreateRequest = {
        invoiceNo,
        supplierId,
        date: new Date(date).toISOString(),
      };

      if (invoice) {
        await invoiceService.updateInvoice(invoice.invoiceNo, invoiceData);
      } else {
        await invoiceService.createInvoice(invoiceData);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{invoice ? 'Edit Invoice' : 'Add New Invoice'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="invoiceNo">Invoice Number *</label>
            <input
              id="invoiceNo"
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              required
              disabled={loading || !!invoice}
              placeholder="Enter invoice number"
            />
            {invoice && (
              <small style={{ color: '#666', fontSize: '12px' }}>Invoice number cannot be changed</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="supplierId">Supplier *</label>
            <select
              id="supplierId"
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              <option value="">Select a supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.supplierId} value={supplier.supplierId}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Invoice Date *</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
