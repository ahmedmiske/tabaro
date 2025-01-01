import React, { useState, useEffect } from 'react';
import UserForm from '../components/UserForm';
import './addUserPage.css';
import Title from '../components/Title';

function AddUserPage() {
  
  const [users, setUsers] = useState([]);
 

  useEffect(() => {
    
  }, []);

  const addUser = (user) => {
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`  //     token
      },
      body: JSON.stringify(user)
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers([...users, data]);
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
