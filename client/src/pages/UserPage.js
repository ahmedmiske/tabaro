import React, { useState, useEffect } from 'react';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import './UserPage.css';
import Title from '../components/Title';

function UserPage() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);

  const getAllUsers = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error:', error));
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const addUser = (user) => {
    fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers([...users, data]);
      })
      .catch((error) => console.error('Error:', error));
  };

  const updateUser = (user) => {
    fetch(`/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsers(users.map((u) => (u.id === data.id ? data : u)));
        setEditingUser(null);
      })
      .catch((error) => console.error('Error:', error));
  };

  const deleteUser = (id) => {
    fetch(`/users/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        setUsers(users.filter((user) => user.id !== id));
      })
      .catch((error) => console.error('Error:', error));
  };

  const editUser = (user) => {
    setEditingUser(user);
  };

  return (
    <div className="userpage-container">
      <Title text="إدارة المستخدمين"/>
      <div className="container-userform">
        <UserForm addUser={addUser} editingUser={editingUser} updateUser={updateUser} />
      </div>
      <div className="container-userlist">
        <UserList onEdit={editUser} onDelete={deleteUser} />
      </div>
    </div>
  );
}

export default UserPage;
