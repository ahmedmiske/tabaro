import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Alert } from 'react-bootstrap';
import './UserPage.css';
import Title from '../components/Title';

function UserPage({ onEdit, onDelete }) {
  const [userList, setUserList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [error, setError] = useState('');

  const getAllUsers = () => {
    const token = localStorage.getItem('token'); //     

    fetch('/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` //   
      }
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`); // 
      }
      return res.json();
    })
    .then((data) => {
      setUserList(data); //   
      setError(''); //    
    })
    .catch((error) => {
      console.error('Error fetching users:', error.message);
      setError('Error fetching users: Unauthorized. Redirecting to login.'); // 
      
    });
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(userToDelete.id)
      .then(() => {
        getAllUsers(); // تحديث القائمة بعد الحذف
        setShowConfirm(false);
        setUserToDelete(null);
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  return (
    <div className="container mt-5">
      <Title text='المستخدمين'/>
      {error && <Alert variant="danger">{error}</Alert>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>الاسم</th>
            <th>الاسم العائلي</th>
            <th>الهاتف</th>
            <th>الواتساب</th>
            <th>العنوان</th>
            <th>البريد الإلكتروني</th>
            <th>نوع المستخدم</th>
            <th>اسم المستخدم</th>
            <th>كلمة المرور</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(user => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.username}</td>
              <td>{user.address}</td>
              <td>{user.email}</td>
              <td>{user.userType}</td>
              <td>{user.username}</td>
              <td>{'****'}</td>
              <td>
                <Button variant="warning" onClick={() => onEdit(user)}>تعديل</Button>{' '}
                <Button variant="danger" onClick={() => handleDeleteClick(user)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>تأكيد الحذف</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          هل أنت متأكد أنك تريد حذف المستخدم؟
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            إلغاء
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            حذف
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserPage;
