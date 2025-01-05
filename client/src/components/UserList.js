import React, { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom'; // استيراد هوك useNavigate للتوجيه
import './UserList.css';
import Title from './Title';

function UserList({ onEdit, onDelete }) {
  const [userList, setUserList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate(); // 

  const getAllUsers = () => {
// <<<<<<< HEAD
    const token = sessionStorage.getItem('token');

    fetch('/api/users', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then((res) => {
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized. Redirecting to login.');
        }
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => setUserList(data))
    .catch((error) => {
      console.error('Error fetching users:', error.message);
      if (error.message.includes('Unauthorized')) {
       console.error('this is not authorized', error.message);
      }
    });
// // =======
//     fetch('/api/users')
//       .then((res) => res.json())
//       .then((data) => setUserList(data));
// // >>>>>>> 5c80fed0b3a2bb3daedce0d843125982af0cebb8
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
        getAllUsers(); // Update the list after deletion
        setShowConfirm(false);
        setUserToDelete(null);
      })
      .catch((error) => console.error('Error deleting user:', error));
  };

  return (
    <div className="container mt-5">
      <Title text='المستخدمين'/>
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
              <td>test</td>
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

export default UserList;
