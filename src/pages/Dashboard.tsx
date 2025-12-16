import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/api';
import type { Product, ProductCreateRequest } from '../types';
import Navigation from '../components/Navigation';
import ProductModal from '../components/ProductModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProducts(data);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete product';
      setError(message);
    }
  };

  const handleSaveProduct = async (productData: ProductCreateRequest) => {
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.productId, {
          productId: editingProduct.productId,
          ...productData
        });
      } else {
        await productService.createProduct(productData);
      }
      setShowModal(false);
      await loadProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save product';
      throw new Error(message);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>Inventory Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {isAdmin() && (
              <button onClick={handleAddProduct} className="btn btn-primary">
                Add Product
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="table-container">
              {filteredProducts.length === 0 ? (
                <p className="no-data">No products found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Name</th>
                      <th>Latest Batch</th>
                      <th>Remaining Qty</th>
                      <th>Unit Price</th>
                      <th>Last Updated</th>
                      {isAdmin() && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.productId}>
                        <td>{product.productId}</td>
                        <td>{product.name}</td>
                        <td>{product.latestBatchNo || '-'}</td>
                        <td>{product.remainingQty}</td>
                        <td>${product.latestUnitPrice.toFixed(2)}</td>
                        <td>{new Date(product.updatedAt).toLocaleDateString()}</td>
                        {isAdmin() && (
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="btn btn-small btn-secondary"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.productId)}
                                className="btn btn-small btn-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {showModal && (
          <ProductModal
            product={editingProduct}
            onSave={handleSaveProduct}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
