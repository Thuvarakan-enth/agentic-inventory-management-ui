import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { transactionService } from '../services/api';
import type { Transaction, TransactionCreateRequest, TransactionItemCreateRequest, Product } from '../types';
import '../styles/Modal.css';
import '../styles/SaleModal.css';

interface SaleModalProps {
  transaction: Transaction | null;
  products: Product[];
  onSave: () => void;
  onClose: () => void;
}

interface SaleItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

const SaleModal = ({ transaction, products, onSave, onClose }: SaleModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [items, setItems] = useState<SaleItem[]>([{ productId: '', qty: 1, unitPrice: 0 }]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transaction && transaction.items) {
      setPaymentMethod(transaction.paymentMethod);
      setDiscountAmount(transaction.discountAmount);
      setPaidAmount(transaction.paidAmount);
      setItems(transaction.items.map(item => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.unitPrice,
      })));
    }
  }, [transaction]);

  const calculateGrossAmount = () => {
    return items.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  };

  const calculateNetAmount = () => {
    return calculateGrossAmount() - discountAmount;
  };

  const calculateBalance = () => {
    return calculateNetAmount() - paidAmount;
  };

  const handleAddItem = () => {
    setItems([...items, { productId: '', qty: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof SaleItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index][field] = value as string;
      // Auto-populate unit price from product
      const product = products.find(p => p.productId === value);
      if (product) {
        newItems[index].unitPrice = product.latestUnitPrice;
      }
    } else {
      newItems[index][field] = value as number;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (items.some(item => !item.productId)) {
      setError('Please select a product for all items');
      return;
    }

    if (items.some(item => item.qty <= 0)) {
      setError('Quantity must be greater than 0 for all items');
      return;
    }

    if (items.some(item => item.unitPrice < 0)) {
      setError('Unit price cannot be negative');
      return;
    }

    if (discountAmount < 0) {
      setError('Discount amount cannot be negative');
      return;
    }

    if (paidAmount < 0) {
      setError('Paid amount cannot be negative');
      return;
    }

    setLoading(true);

    try {
      const transactionData: TransactionCreateRequest = {
        paymentMethod,
        grossAmount: calculateGrossAmount(),
        discountAmount,
        netAmount: calculateNetAmount(),
        paidAmount,
        balanceAmount: calculateBalance(),
        items: items.map((item): TransactionItemCreateRequest => ({
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
      };

      await transactionService.createTransaction(transactionData);
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sale');
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : '';
  };

  // View mode for existing transaction
  if (transaction) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Transaction Details</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="transaction-details">
            <div className="detail-row">
              <span className="detail-label">Transaction ID:</span>
              <span className="detail-value">{transaction.transactionId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{transaction.paymentMethod}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{new Date(transaction.createdAt).toLocaleString()}</span>
            </div>

            {transaction.items && transaction.items.length > 0 && (
              <div className="items-section">
                <h3>Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transaction.items.map((item, index) => (
                      <tr key={index}>
                        <td>{getProductName(item.productId)}</td>
                        <td>{item.qty}</td>
                        <td>${item.unitPrice.toFixed(2)}</td>
                        <td>${(item.qty * item.unitPrice).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="amounts-section">
              <div className="amount-row">
                <span>Gross Amount:</span>
                <span>${transaction.grossAmount.toFixed(2)}</span>
              </div>
              <div className="amount-row">
                <span>Discount:</span>
                <span>-${transaction.discountAmount.toFixed(2)}</span>
              </div>
              <div className="amount-row total">
                <span>Net Amount:</span>
                <span>${transaction.netAmount.toFixed(2)}</span>
              </div>
              <div className="amount-row">
                <span>Paid Amount:</span>
                <span>${transaction.paidAmount.toFixed(2)}</span>
              </div>
              <div className="amount-row balance">
                <span>Balance:</span>
                <span>${transaction.balanceAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create mode
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Sale</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="paymentMethod">Payment Method *</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
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
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="MOBILE_PAYMENT">Mobile Payment</option>
            </select>
          </div>

          <div className="items-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Items</h3>
              <button type="button" onClick={handleAddItem} className="btn btn-small btn-secondary">
                Add Item
              </button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Product *</label>
                  <select
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
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
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.productId} value={product.productId}>
                        {product.name} (Stock: {product.remainingQty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Qty *</label>
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                    required
                    disabled={loading}
                    min="1"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                    }}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                    required
                    disabled={loading}
                    min="0"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                    }}
                  />
                </div>

                <div style={{ paddingTop: '24px' }}>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="btn btn-small btn-danger"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="amounts-section">
            <div className="amount-row">
              <span>Gross Amount:</span>
              <span>${calculateGrossAmount().toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label htmlFor="discountAmount">Discount Amount ($)</label>
              <input
                id="discountAmount"
                type="number"
                step="0.01"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                disabled={loading}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="amount-row total">
              <span>Net Amount:</span>
              <span>${calculateNetAmount().toFixed(2)}</span>
            </div>

            <div className="form-group" style={{ marginTop: '10px' }}>
              <label htmlFor="paidAmount">Paid Amount ($) *</label>
              <input
                id="paidAmount"
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                required
                disabled={loading}
                min="0"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                }}
              />
            </div>

            <div className="amount-row balance">
              <span>Balance:</span>
              <span>${calculateBalance().toFixed(2)}</span>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaleModal;
