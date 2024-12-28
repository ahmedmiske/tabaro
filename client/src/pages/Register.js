import React, { useState } from 'react';
import UserForm from '../components/UserForm';
import './Register.css';

function Register() {
  const [users, setUsers] = useState([]);

  const addUser = (user) => {
    fetch('http://localhost:5000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(user)
    })
      .then(response => response.json())
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
