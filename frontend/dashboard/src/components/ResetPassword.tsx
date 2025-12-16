javascript
// src/auth/components/ResetPassword.jsx
import React, { useState } from 'react';
import { useAuth } from '../AuthContext';


export function ResetPassword({ uid, token }) {
const { confirmReset } = useAuth();
const [password, setPassword] = useState('');
const [status, setStatus] = useState(null);


const submit = async (e) => {
e.preventDefault();
try {
await confirmReset({ uid, token, new_password: password });
setStatus('ok');
} catch (err) {
setStatus('error');
}
};


if (status === 'ok') return <div>Password reset — you may login now.</div>;


return (
<form onSubmit={submit}>
<h3>Set new password</h3>
<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
<button type="submit">Save</button>
</form>
);
}
