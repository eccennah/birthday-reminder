const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export async function createUser(payload) {
  const res = await fetch(`${API}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create user');
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function deleteUser(id) {
  const res = await fetch(`${API}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete user');
  return res.json();
}

export async function getToday() {
  const res = await fetch(`${API}/users/today`); // ✅ fixed path
  if (!res.ok) throw new Error('Failed to fetch today\'s birthdays');
  return res.json();
}
