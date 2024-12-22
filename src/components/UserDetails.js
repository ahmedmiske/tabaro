import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const UserDetails = ({ show, handleClose, donor }) => {
  if (!donor) return null;

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>تفاصيل المتبرع</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>الاسم:</strong> {donor.firstName} {donor.lastName}</p>
        <p><strong>الهاتف:</strong> {donor.phone}</p>
        <p><strong>واتساب:</strong> {donor.whatsapp}</p>
        <p><strong>العنوان:</strong> {donor.address}</p>
        <p><strong>البريد الإلكتروني:</strong> {donor.email}</p>
        <p><strong>نوع المستخدم:</strong> {donor.userType}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          إغلاق
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UserDetails;
