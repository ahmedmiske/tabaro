import React, { useState } from 'react';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import './HomePage.css';

function HomePage() {
  const [users, setUsers] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);

  const addUser = (user) => {
    setUsers([...users, user]);
  };

  const editUser = (updatedUser) => {
    setUsers(users.map((user) => (user.email === updatedUser.email ? updatedUser : user)));
  };

  const deleteUser = (email) => {
    setUsers(users.filter((user) => user.email !== email));
  };

  return (
    <div className="home-page">
     
      <div className='col-3 m-auto'>
      <h1>إدارة المستخدمين</h1>
      <UserForm addUser={addUser} editUser={editUser} userToEdit={userToEdit} setUserToEdit={setUserToEdit} />

      </div>
      <UserList users={users} deleteUser={deleteUser} setUserToEdit={setUserToEdit} />
    
    </div>
  );
}

export default HomePage;
