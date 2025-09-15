import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import NoteModal from './NoteModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('/api/notes');
      setNotes(response.data);
      
      // Show upgrade banner if user is on free plan and has 3 notes
      if (user.tenant.subscription === 'free' && response.data.length >= 3) {
        setShowUpgradeBanner(true);
      }
    } catch (error) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setShowModal(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`/api/notes/${noteId}`);
        setNotes(notes.filter(note => note._id !== noteId));
        setError('');
      } catch (error) {
        setError('Failed to delete note');
        console.error('Error deleting note:', error);
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      await axios.post(`/api/tenants/${user.tenant.slug}/upgrade`);
      setShowUpgradeBanner(false);
      setError('');
      // Refresh user data to get updated subscription
      window.location.reload();
    } catch (error) {
      setError('Failed to upgrade subscription');
      console.error('Error upgrading:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingNote(null);
    fetchNotes(); // Refresh notes after modal closes
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1>Notes Dashboard</h1>
          <div className="tenant-info">
            <strong>{user.tenant.name}</strong> ({user.tenant.subscription.toUpperCase()}) - 
            Role: {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {showUpgradeBanner && user.role === 'admin' && (
        <div className="upgrade-banner">
          <h3>🚀 Upgrade to Pro!</h3>
          <p>You've reached the 3-note limit. Upgrade to Pro for unlimited notes!</p>
          <button onClick={handleUpgrade} className="btn btn-success">
            Upgrade to Pro
          </button>
        </div>
      )}

      {showUpgradeBanner && user.role === 'member' && (
        <div className="alert alert-warning">
          <strong>Note Limit Reached!</strong> You've reached the 3-note limit. 
          Contact your admin to upgrade to Pro for unlimited notes.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Notes ({notes.length})</h2>
        <button 
          onClick={handleCreateNote} 
          className="btn btn-primary"
          disabled={user.tenant.subscription === 'free' && notes.length >= 3}
        >
          Create Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#666' }}>
            No notes yet. Create your first note!
          </p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>
                Created: {new Date(note.createdAt).toLocaleDateString()}
              </div>
              <div className="note-actions">
                <button 
                  onClick={() => handleEditNote(note)}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteNote(note._id)}
                  className="btn btn-danger"
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <NoteModal
          note={editingNote}
          onClose={handleModalClose}
          user={user}
        />
      )}
    </div>
  );
};

export default Dashboard;
