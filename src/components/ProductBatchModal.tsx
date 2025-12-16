import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { productBatchService } from '../services/api';
import type { ProductBatch, ProductBatchCreateRequest, Product, Invoice } from '../types';
import '../styles/Modal.css';

interface ProductBatchModalProps {
  batch: ProductBatch | null;
  products: Product[];
  invoices: Invoice[];
  onSave: () => void;
  onClose: () => void;
}

const ProductBatchModal = ({ batch, products, invoices, onSave, onClose }: ProductBatchModalProps) => {
  const [productId, setProductId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [qty, setQty] = useState(0);
  const [unitCost, setUnitCost] = useState(0);
  const [unitPrice, setUnitPrice] = useState(0);
  const [exp, setExp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch) {
      setProductId(batch.productId);
      setInvoiceNo(batch.invoiceNo);
      setBatchNo(batch.batchNo);
      setQty(batch.qty);
      setUnitCost(batch.unitCost);
      setUnitPrice(batch.unitPrice);
      setExp(batch.exp ? batch.exp.split('T')[0] : '');
    }
  }, [batch]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productId) {
      setError('Please select a product');
      return;
    }

    if (!invoiceNo) {
      setError('Please select an invoice');
      return;
    }

    if (qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (unitCost < 0) {
      setError('Unit cost cannot be negative');
      return;
    }

    if (unitPrice < 0) {
      setError('Unit price cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const batchData: ProductBatchCreateRequest = {
        productId,
        invoiceNo,
        batchNo,
        qty,
        unitCost,
        unitPrice,
        exp: exp ? new Date(exp).toISOString() : undefined,
      };

      if (batch) {
        await productBatchService.updateBatch(batch.productId, batch.invoiceNo, batchData);
      } else {
        await productBatchService.createBatch(batchData);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save batch');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{batch ? 'Edit Product Batch' : 'Add New Product Batch'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="productId">Product *</label>
            <select
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              disabled={loading || !!batch}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.name}
                </option>
              ))}
            </select>
            {batch && (
              <small style={{ color: '#666', fontSize: '12px' }}>Product cannot be changed</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="invoiceNo">Invoice *</label>
            <select
              id="invoiceNo"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              required
              disabled={loading || !!batch}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
              }}
            >
              <option value="">Select an invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.invoiceNo} value={invoice.invoiceNo}>
                  {invoice.invoiceNo} - {new Date(invoice.date).toLocaleDateString()}
                </option>
              ))}
            </select>
            {batch && (
              <small style={{ color: '#666', fontSize: '12px' }}>Invoice cannot be changed</small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="batchNo">Batch Number *</label>
            <input
              id="batchNo"
              type="text"
              value={batchNo}
              onChange={(e) => setBatchNo(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter batch number"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="qty">Quantity *</label>
              <input
                id="qty"
                type="number"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                required
                disabled={loading}
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unitCost">Unit Cost ($) *</label>
              <input
                id="unitCost"
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                required
                disabled={loading}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="unitPrice">Unit Price ($) *</label>
              <input
                id="unitPrice"
                type="number"
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                required
                disabled={loading}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="exp">Expiry Date</label>
              <input
                id="exp"
                type="date"
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductBatchModal;
