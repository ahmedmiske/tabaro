import React from 'react';
import { Card, Badge } from './ui';

function DonationConfirmationCard({ confirmation }) {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>
          المتبرع: {confirmation.donor?.firstName} {confirmation.donor?.lastName}
        </Card.Title>
        <Card.Text>
          💬 {confirmation.message} <br />
          🕒 {new Date(confirmation.proposedTime).toLocaleString()} <br />
          🩸 الطريقة: {confirmation.method}
        </Card.Text>
        <Badge bg={
          confirmation.status === 'accepted' ? 'success' :
          confirmation.status === 'rejected' ? 'danger' :
          confirmation.status === 'fulfilled' ? 'info' : 'warning'
        }>
          {confirmation.status === 'accepted' ? 'تم القبول' :
           confirmation.status === 'rejected' ? 'مرفوض' :
           confirmation.status === 'fulfilled' ? 'تم التنفيذ' :
           'قيد الانتظار'}
        </Badge>
      </Card.Body>
    </Card>
  );
}

export default DonationConfirmationCard;
// This component represents a card that displays the details of a donation confirmation.
// It includes the donor's name, message, proposed time, method of donation, and the