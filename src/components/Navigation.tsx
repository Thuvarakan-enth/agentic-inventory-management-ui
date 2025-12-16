import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/Navigation.css';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navigation">
      <div className="nav-header">
        <h2 className="nav-title">Inventory System</h2>
        <div className="user-info-nav">
          <span className="user-name-nav">{user?.username}</span>
          <span className="user-role-nav">{user?.roles[1] ? user.roles[1] : user?.roles[0]}</span>
        </div>
      </div>
      <ul className="nav-menu">
        <li>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <span className="nav-icon">📦</span>
            Inventory
          </Link>
        </li>
        <li>
          <Link to="/suppliers" className={`nav-link ${isActive('/suppliers')}`}>
            <span className="nav-icon">🏢</span>
            Suppliers
          </Link>
        </li>
        <li>
          <Link to="/invoices" className={`nav-link ${isActive('/invoices')}`}>
            <span className="nav-icon">📄</span>
            Invoices
          </Link>
        </li>
        <li>
          <Link to="/batches" className={`nav-link ${isActive('/batches')}`}>
            <span className="nav-icon">📋</span>
            Product Batches
          </Link>
        </li>
        <li>
          <Link to="/sales" className={`nav-link ${isActive('/sales')}`}>
            <span className="nav-icon">💰</span>
            Sales
          </Link>
        </li>
        {isAdmin() && (
          <li>
            <Link to="/users" className={`nav-link ${isActive('/users')}`}>
              <span className="nav-icon">👥</span>
              Users
            </Link>
          </li>
        )}
      </ul>
      <div className="nav-footer">
        <button onClick={logout} className="btn-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
