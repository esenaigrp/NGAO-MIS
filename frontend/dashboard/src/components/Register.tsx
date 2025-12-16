javascript
// src/auth/components/Register.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';


export default function Register({ onSuccess }) {
const { register } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [error, setError] = useState(null);


const submit = async (e) => {
e.preventDefault();
setError(null);
try {
await register({ email, password });
if (onSuccess) onSuccess();
} catch (err) {
setError(err.response?.data || String(err));
}
};


return (
<form onSubmit={submit}>
<h3>Create account</h3>
{error && <div style={{ color: 'red' }}>{JSON.stringify(error)}</div>}
<div>
<label>Email</label>
<input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
</div>
<div>
<label>Password</label>
<input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
</div>
<button type="submit">Register</button>
</form>
);
}