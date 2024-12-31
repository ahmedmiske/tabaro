import React, { useEffect, useState } from 'react';
import { Table, Button, Modal } from 'react-bootstrap';
import './UserList.css';
import Title from './Title';

function UserList({ onEdit, onDelete }) {
  const [userList, setUserList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const getAllUsers = () => {
    fetch('/users')
      .then((res) => res.json())
      .then((data) => setUserList(data));
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(userToDelete.id);
    setShowConfirm(false);
    setUserToDelete(null);
    getAllUsers(); // Update the list after deletion
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
              <td>{user.phone}</td>
              <td>{user.whatsapp}</td>
              <td>{user.address}</td>
              <td>{user.email}</td>
              <td>{user.userType}</td>
              <td>{user.username}</td>
              <td>{user.password}</td>
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
