import React from 'react';
import { Form, Button } from 'react-bootstrap';

function AccountDetails({ userDetails }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    // هنا يمكنك التعامل مع تحديث معلومات الحساب
    console.log('Account Details Updated');
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>اسم المستخدم</Form.Label>
        <Form.Control type="text" defaultValue={userDetails?.username} />
      </Form.Group>
      <Form.Group>
        <Form.Label>كلمة المرور</Form.Label>
        <Form.Control type="password" placeholder="********" />
      </Form.Group>
      <Button variant="primary" type="submit">حفظ التعديلات</Button>
    </Form>
  );
}

export default AccountDetails;
