import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Dashboard() {
  const [form, setForm] = useState({ name: '', age: '', email: '', hobby: '' });
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      loadEntries();
    }
  }, [token, navigate]);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('https://capsitech-task4.onrender.com/data', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError('Failed to load entries. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `https://capsitech-task4.onrender.com/data/${editingId}`
      : 'https://capsitech-task4.onrender.com/data';
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      setForm({ name: '', age: '', email: '', hobby: '' });
      setEditingId(null);
      loadEntries();
    } catch (err) {
      setError(`Failed to ${editingId ? 'update' : 'add'} entry. Please try again.`);
    }
  };

  const deleteEntry = async (id) => {
    setError(null);
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }
    try {
      const res = await fetch(`https://capsitech-task4.onrender.com/data/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + token },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      loadEntries();
    } catch (err) {
      setError('Failed to delete entry. Please try again.');
    }
  };

  const startEdit = (entry) => {
    setForm({
      name: entry.name,
      age: entry.age,
      email: entry.email,
      hobby: entry.hobby,
    });
    setEditingId(entry._id);
  };

  const cancelEdit = () => {
    setForm({ name: '', age: '', email: '', hobby: '' });
    setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
        <h2 className="mb-0">Dashboard</h2>
        <button className="btn btn-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card p-4 mb-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="row gy-3">
            <div className="col-12 col-md-3">
              <input
                className="form-control"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="col-6 col-md-2">
              <input
                className="form-control"
                placeholder="Age"
                type="number"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-3">
              <input
                className="form-control"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-2">
              <input
                className="form-control"
                placeholder="Qualification"
                value={form.hobby}
                onChange={(e) => setForm({ ...form, hobby: e.target.value })}
                required
              />
            </div>
            <div className="col-12 col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-primary w-100">
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button type="button" className="btn btn-secondary w-100" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading entries...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="alert alert-info text-center">No entries found. Add a new one!</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Email</th>
                <th>Qualification</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e._id}>
                  <td>{e.name}</td>
                  <td>{e.age}</td>
                  <td>{e.email}</td>
                  <td>{e.hobby}</td>
                  <td className="text-center">
                    <button className="btn btn-sm btn-warning me-2" onClick={() => startEdit(e)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteEntry(e._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
