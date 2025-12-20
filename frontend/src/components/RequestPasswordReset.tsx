

javascript
// src/auth/components/RequestPasswordReset.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';


export function RequestPasswordReset() {
const { requestPasswordReset } = useAuth();
const [email, setEmail] = useState('');
const [message, setMessage] = useState(null);


const submit = async (e) => {
e.preventDefault();
try {
await requestPasswordReset(email);
setMessage('If that email exists, you will receive instructions.');
} catch (err) {
setMessage('Request failed');
}
};


return (
<form onSubmit={submit}>
<h3>Request password reset</h3>
{message && <div>{message}</div>}
<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
<button type="submit">Send</button>
</form>
);
}