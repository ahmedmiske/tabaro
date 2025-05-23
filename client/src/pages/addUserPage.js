import React, { useState, useEffect } from 'react';
import UserForm from '../components/UserForm';
import './addUserPage.css';
import Title from '../components/Title';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function AddUserPage() {
  
  const [users, setUsers] = useState([]);
 

  useEffect(() => {
    
  }, []);

  const addUser = (user) => {
    fetchWithInterceptors('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    })
      .then((data) => {
        setUsers([...users, data.body]);
        // Redirect to dashboard page 
       
      })
      .catch((error) => console.error('Error:', error));
  };
 
  return (
    <div className="addUserPage-container">
      <Title text=" إنشاء حساب جديد"/>
      <div className="container-userform">
        <UserForm addUser={addUser}  />
      </div>
    
    </div>
  );
}

export default AddUserPage;
