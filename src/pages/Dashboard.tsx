import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/api';
import type { Product, ProductCreateRequest } from '../types';
import ProductModal from '../components/ProductModal';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
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

  const handleDeleteProduct = async (id: number) => {
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
        await productService.updateProduct(editingProduct.id, {
          id: editingProduct.id,
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
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Inventory Management Dashboard</h1>
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.role}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="toolbar-actions">
            {isAdmin() && (
              <>
                <Link to="/users" className="btn btn-secondary">
                  User Management
                </Link>
                <button onClick={handleAddProduct} className="btn btn-primary">
                  Add Product
                </button>
              </>
            )}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p className="no-products">No products found</p>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <h3>{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-details">
                    <span className="product-category">{product.category}</span>
                    <span className="product-quantity">Qty: {product.quantity}</span>
                    <span className="product-price">${product.price.toFixed(2)}</span>
                  </div>
                  {isAdmin() && (
                    <div className="product-actions">
                      <button 
                        onClick={() => handleEditProduct(product)} 
                        className="btn btn-small btn-secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className="btn btn-small btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))
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
  );
};

export default Dashboard;
