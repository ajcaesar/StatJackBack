import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '/authcontext';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/login', { username, password });
      signIn(res.data); // Assuming the API returns user data
      setMessage('Login successful');
    } catch (err) {
      setMessage('Error logging in');
    }
  };

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSignIn}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SignIn;
