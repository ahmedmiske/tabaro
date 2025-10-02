import React from 'react';
import { Card, Container } from './ui';
import './FindeNot.css';

const FindeNot = () => {
  return (
    <Container className="finde-not-container">
      <Card className="text-center">
        <Card.Body>
          <Card.Title>نتائج غير موجودة</Card.Title>
          <Card.Text>
            لا توجد نتائج مطابقة للبحث. يرجى تعديل معايير البحث والمحاولة مرة أخرى.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FindeNot;
