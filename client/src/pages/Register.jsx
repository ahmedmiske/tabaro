import React, { useState } from 'react';
import UserForm from '../components/UserForm.jsx';
import './Register.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function Register() {
  const [users, setUsers] = useState([]);

  const addUser = (user) => {
    fetchWithInterceptors('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(data => {
        setUsers([...users, data]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="register">
      <h2>تسجيل مستخدم جديد</h2>
      <UserForm addUser={addUser} className='user-register' />
    </div>
  );
}

export default Register;
