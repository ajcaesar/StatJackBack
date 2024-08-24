import React, { useState } from 'react';
import { signup } from '../../api';
import './Auth.css';
import {Filter} from 'bad-words';

function SignUp({ onSignUp, onSwitchToSignIn }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const filter = new Filter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (filter.isProfane(username)) {
      setError("Username contains inappropriate language");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const data = await signup(username, email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onSignUp(data.user);
    } catch (err) {
      setError(err.message || 'Error signing up');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
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
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Sign Up</button>
      </form>
      <button className="switch-auth" onClick={onSwitchToSignIn}>
        Already have an account? Sign In
      </button>
    </div>
  );
}

export default SignUp;