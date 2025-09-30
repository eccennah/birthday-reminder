import React, { useEffect, useState } from 'react';
import { createUser, getUsers, deleteUser, getToday } from './api';
import "./App.css";

export default function App() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [todayList, setTodayList] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchToday();
  }, []);

  async function fetchUsers() {
    const data = await getUsers();
    setUsers(Array.isArray(data) ? data : []);
  }

  async function fetchToday() {
    const data = await getToday();
    setTodayList(Array.isArray(data) ? data : []);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg(null);

    if (!username || !email || !dateOfBirth) {
      setMsg({ type: 'error', text: 'Please fill all fields' });
      return;
    }

    try {
      const res = await createUser({ username, email, dateOfBirth });
      if (res && res.error) {
        setMsg({ type: 'error', text: res.error });
        return;
      }
      setMsg({ type: 'success', text: 'Saved!' });
      setUsername('');
      setEmail('');
      setDateOfBirth('');
      fetchUsers();
      fetchToday();
    } catch (err) {
      setMsg({ type: 'error', text: 'Network error' });
    }
  }

  async function onDelete(id) {
    await deleteUser(id);
    fetchUsers();
    fetchToday();
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', fontFamily: 'Arial, sans-serif', padding: 12 }}>
      <h1>Birthday Reminder</h1>
      <p>Collect username, email and date of birth. <br /><br /> Emails are sent automatically at 7:00 each day.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label style={{ display: 'flex', flexDirection: 'column', marginBottom: '8px' }}>
          <span>Date of Birth</span>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
          />
        </label>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit">Save</button>
          <button type="button" onClick={() => { setUsername(''); setEmail(''); setDateOfBirth(''); }}>Clear</button>
          <button type="button" onClick={() => { fetchUsers(); fetchToday(); }}>Refresh</button>
        </div>
      </form>

      {msg && (
        <div style={{ padding: 8, background: msg.type === 'error' ? '#ffdddd' : '#ddffdd', marginBottom: 12, width: '300px' }}>
          {msg.text}
        </div>
      )}

      <section style={{ marginBottom: 18 }}>
        <h2>Today's Celebrants</h2>
        {todayList.length === 0 ? (
          <div>No birthdays today.</div>
        ) : (
          <ul>
            {todayList.map(user => <li key={user._id}>{user.username} — {user.email}</li>)}
          </ul>
        )}
      </section>

      <section>
        <h2>Saved Users</h2>
        <table style={{ width: '90%', borderCollapse: 'collapse', borderColor: 'indigo' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #eee', padding: 8 }}>#</th>
              <th style={{ border: '1px solid #eee', padding: 8 }}>Name</th>
              <th style={{ border: '1px solid #eee', padding: 8 }}>Email</th>
              <th style={{ border: '1px solid #eee', padding: 8 }}>DOB</th>
              <th style={{ border: '1px solid #eee', padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: 12 }}>No users yet</td></tr>
            )}
            {users.map((user, i) => (
              <tr key={user._id}>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{i + 1}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{user.username}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>{user.email}</td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </td>
                <td style={{ padding: 8, border: '1px solid #eee' }}>
                  <button onClick={() => onDelete(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer style={{ marginTop: 20, fontSize: 13, color: '#ccc' }}>
        Tip: Use a Gmail App Password for EMAIL_PASS in the server .env (or your chosen provider's SMTP password).
      </footer>
    </div>
  );
}
