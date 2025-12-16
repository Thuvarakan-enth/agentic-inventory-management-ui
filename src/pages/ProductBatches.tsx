import { useState, useEffect } from 'react';
import { productBatchService, productService, invoiceService } from '../services/api';
import type { ProductBatch, Product, Invoice } from '../types';
import Navigation from '../components/Navigation';
import ProductBatchModal from '../components/ProductBatchModal';
import '../styles/Suppliers.css';

const ProductBatches = () => {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<ProductBatch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchesData, productsData, invoicesData] = await Promise.all([
        productBatchService.getAllBatches(),
        productService.getAllProducts(),
        invoiceService.getAllInvoices(),
      ]);
      setBatches(batchesData);
      setProducts(productsData);
      setInvoices(invoicesData);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatch = () => {
    setEditingBatch(null);
    setShowModal(true);
  };

  const handleEditBatch = (batch: ProductBatch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleDeleteBatch = async (productId: string, invoiceNo: string) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return;
    }

    try {
      await productBatchService.deleteBatch(productId, invoiceNo);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete batch';
      setError(message);
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.productId === productId);
    return product ? product.name : productId;
  };

  const filteredBatches = batches.filter(batch =>
    batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getProductName(batch.productId).toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>Product Batch Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleAddBatch} className="btn btn-primary">
              Add Batch
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading batches...</div>
          ) : (
            <div className="table-container">
              {filteredBatches.length === 0 ? (
                <p className="no-data">No batches found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Batch No</th>
                      <th>Product</th>
                      <th>Invoice No</th>
                      <th>Quantity</th>
                      <th>Unit Cost</th>
                      <th>Unit Price</th>
                      <th>Expiry Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBatches.map((batch) => (
                      <tr key={`${batch.productId}-${batch.invoiceNo}`}>
                        <td>{batch.batchNo}</td>
                        <td>{getProductName(batch.productId)}</td>
                        <td>{batch.invoiceNo}</td>
                        <td>{batch.qty}</td>
                        <td>${batch.unitCost.toFixed(2)}</td>
                        <td>${batch.unitPrice.toFixed(2)}</td>
                        <td>{batch.exp ? new Date(batch.exp).toLocaleDateString() : '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditBatch(batch)}
                              className="btn btn-small btn-secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch.productId, batch.invoiceNo)}
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
          <ProductBatchModal
            batch={editingBatch}
            products={products}
            invoices={invoices}
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

export default ProductBatches;
