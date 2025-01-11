import React from 'react';
import { Form, Button } from 'react-bootstrap';

function UserDetails({ userDetails }) {
    
  const handleSubmit = (event) => {
    event.preventDefault();
    // هنا يمكنك التعامل مع تحديث المعلومات الشخصية
    console.log('Personal Details Updated');
  };

  const isOrganization = userDetails?.userType === 'organization'; // تحقق مما إذا كان نوع الحساب مؤسسي

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>الاسم الأول</Form.Label>
        <Form.Control type="text" defaultValue={userDetails?.firstName} />
      </Form.Group>
      <Form.Group>
        <Form.Label>الاسم العائلي</Form.Label>
        <Form.Control type="text" defaultValue={userDetails?.lastName} />
      </Form.Group>
      <Form.Group>
        <Form.Label>العنوان</Form.Label>
        <Form.Control type="text" defaultValue={userDetails?.address} />
      </Form.Group>
      {isOrganization && (
        <>
          <Form.Group>
            <Form.Label>اسم المؤسسة</Form.Label>
            <Form.Control type="text" defaultValue={userDetails?.institutionName} />
          </Form.Group>
          <Form.Group>
            <Form.Label>رقم ترخيص المؤسسة</Form.Label>
            <Form.Control type="text" defaultValue={userDetails?.institutionLicenseNumber} />
          </Form.Group>
          <Form.Group>
            <Form.Label>عنوان المؤسسة</Form.Label>
            <Form.Control type="text" defaultValue={userDetails?.institutionAddress} />
          </Form.Group>
        </>
      )}
      <Button variant="primary" type="submit">حفظ التعديلات</Button>
    </Form>
  );
}

export default UserDetails;
