import React, { useState } from 'react';
import { signin } from '../../api';
import './Auth.css';

function SignIn({ onSignIn, onSwitchToSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await signin(username, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSignIn(data.user);
    } catch (err) {
      setError(err.message || 'Error signing in');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign In</button>
      </form>
      <button className="switch-auth" onClick={onSwitchToSignUp}>
        Don't have an account? Sign Up
      </button>
    </div>
  );
}

export default SignIn;