import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import type { User } from '../types';
import Navigation from '../components/Navigation';
import '../styles/Suppliers.css';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load users';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await userService.deleteUser(username);
      await loadUsers();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      setError(message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-with-nav">
      <Navigation />
      <div className="page-content">
        <div className="page-header">
          <h1>User Management</h1>
        </div>

        <div className="content-wrapper">
          <div className="toolbar">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-container">
              {filteredUsers.length === 0 ? (
                <p className="no-data">No users found</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.username}>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.roles[0].toLowerCase()}`}>
                            {user.roles[0]}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {currentUser?.email !== user.email && (
                              <button
                                onClick={() => handleDeleteUser(user.username)}
                                className="btn btn-small btn-danger"
                              >
                                Delete
                              </button>
                            )}
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
      </div>
    </div>
  );
};

export default UserManagement;
