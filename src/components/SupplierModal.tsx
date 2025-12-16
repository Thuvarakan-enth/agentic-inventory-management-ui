import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { supplierService } from '../services/api';
import type { Supplier, SupplierCreateRequest } from '../types';
import '../styles/Modal.css';

interface SupplierModalProps {
  supplier: Supplier | null;
  onSave: () => void;
  onClose: () => void;
}

const SupplierModal = ({ supplier, onSave, onClose }: SupplierModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setName(supplier.name);
      setEmail(supplier.email || '');
      setContact(supplier.contact || '');
      setAddress(supplier.address || '');
    }
  }, [supplier]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supplierData: SupplierCreateRequest = {
        name,
        email: email || undefined,
        contact: contact || undefined,
        address: address || undefined,
      };

      if (supplier) {
        await supplierService.updateSupplier(supplier.supplierId, {
          supplierId: supplier.supplierId,
          ...supplierData,
        });
      } else {
        await supplierService.createSupplier(supplierData);
      }
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save supplier');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Supplier Name *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact Number</label>
            <input
              id="contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              disabled={loading}
              placeholder="Enter contact number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={loading}
              placeholder="Enter supplier address"
              rows={3}
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierModal;
