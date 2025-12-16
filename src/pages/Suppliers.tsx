import { useState, useEffect } from 'react';
import { supplierService } from '../services/api';
import type { Supplier } from '../types';
import Navigation from '../components/Navigation';
import SupplierModal from '../components/SupplierModal';
import '../styles/Suppliers.css';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load suppliers';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) {
      return;
    }

    try {
      await supplierService.deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(message);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.contact && supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>Supplier Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button onClick={handleAddSupplier} className="btn btn-primary">
              Add Supplier
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading suppliers...</div>
          ) : (
            <div className="table-container">
              {filteredSuppliers.length === 0 ? (
                <p className="no-data">No suppliers found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Supplier ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => (
                      <tr key={supplier.supplierId}>
                        <td>{supplier.supplierId}</td>
                        <td>{supplier.name}</td>
                        <td>{supplier.email || '-'}</td>
                        <td>{supplier.contact || '-'}</td>
                        <td>{supplier.address || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="btn btn-small btn-secondary"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSupplier(supplier.supplierId)}
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
          <SupplierModal
            supplier={editingSupplier}
            onSave={async () => {
              setShowModal(false);
              await loadSuppliers();
            }}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Suppliers;
