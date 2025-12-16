javascript
// src/auth/components/OTPVerify.jsx
import React, { useState } from 'react';
import authApi from '../../api/authApi';


export default function OTPVerify({ onVerified }) {
const [code, setCode] = useState('');
const [error, setError] = useState(null);


const submit = async (e) => {
e.preventDefault();
try {
const resp = await authApi.post('/auth/verify-otp/', { code });
onVerified && onVerified(resp.data);
} catch (err) {
setError(err.response?.data || 'Invalid code');
}
};


return (
<form onSubmit={submit}>
<label>Enter code</label>
<input value={code} onChange={e=>setCode(e.target.value)} />
{error && <div style={{color:'red'}}>{JSON.stringify(error)}</div>}
<button type="submit">Verify</button>
</form>
);
}
