import React, { useEffect, useState } from 'react';
import { Table, Button, Modal } from './ui';
import './UserList.css';
import Title from './Title';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

function UserList({ onEdit, onDelete }) {
  const [userList, setUserList] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const getAllUsers = async () => {
    try {
      const resp = await fetchWithInterceptors('/api/users');
      setUserList(Array.isArray(resp.body?.result) ? resp.body.result : []);
    } catch (error) {
      console.error('Error fetching users:', error.message);
      // 401/403 سيتم رميها من fetchWithInterceptors؛ لا نعيد التوجيه من هنا
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await onDelete(userToDelete._id);
      await getAllUsers();
      setShowConfirm(false);
      setUserToDelete(null);
    } catch (e) {
      console.error('Error deleting user:', e);
    }
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
            <th>العنوان</th>
            <th>البريد الإلكتروني</th>
            <th>نوع المستخدم</th>
            <th>اسم المستخدم</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {userList.map(u => (
            <tr key={u._id}>
              <td>{u.firstName}</td>
              <td>{u.lastName}</td>
              <td>{u.phoneNumber}</td>
              <td>{u.address}</td>
              <td>{u.email}</td>
              <td>{u.userType}</td>
              <td>{u.username}</td>
              <td>
                <Button size="sm" variant="warning" onClick={() => onEdit(u)}>تعديل</Button>{' '}
                <Button size="sm" variant="danger" onClick={() => handleDeleteClick(u)}>حذف</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)}>
        <Modal.Header closeButton><Modal.Title>تأكيد الحذف</Modal.Title></Modal.Header>
        <Modal.Body>هل أنت متأكد أنك تريد حذف المستخدم؟</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>إلغاء</Button>
          <Button variant="danger" onClick={confirmDelete}>حذف</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default UserList;
