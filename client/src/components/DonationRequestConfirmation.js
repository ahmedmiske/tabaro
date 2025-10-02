import React from 'react';
import { Form, Button, InputGroup, Alert } from './ui';
function DonationRequestConfirmation() {
    const [confirmMsg, setConfirmMsg] = React.useState('');
    const [confirmAmount, setConfirmAmount] = React.useState('');
    const [evidenceFiles, setEvidenceFiles] = React.useState([]);
    const [submittingConfirm, setSubmittingConfirm] = React.useState(false);
    const [existingOffer, setExistingOffer] = React.useState(null); 
    const [activeSection, setActiveSection] = React.useState(null);
    const req = {}; // Assuming this is passed as a prop or fetched from context
    const submitConfirmation = async (e) => {
        e.preventDefault();
        setSubmittingConfirm(true);
        
        // Here you would handle the submission logic, e.g., API call
        // Simulating a delay for the example
        setTimeout(() => {
            setSubmittingConfirm(false);
            // Reset form or handle success
        }, 2000);
    };
  return (
    <div>
    <Form onSubmit={submitConfirmation}>
                    <Form.Group className="mb-3">
                      <Form.Label>رسالة لصاحب الطلب (اختياري)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={confirmMsg}
                        onChange={(e) => setConfirmMsg(e.target.value)}
                        placeholder="اكتب رسالة قصيرة…"
                      />
                    </Form.Group>
    
                    {'amount' in (req || {}) && (
                      <Form.Group className="mb-3">
                        <Form.Label>مبلغ التبرع (اختياري)</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            min="0"
                            value={confirmAmount}
                            onChange={(e) => setConfirmAmount(e.target.value)}
                            placeholder="مثال: 100"
                          />
                          <InputGroup.Text>أوقية جديدة</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    )}
    
                    <Form.Group className="mb-3">
                      <Form.Label>إرفاق إثبات التبرع (صور/‏PDF) — اختياري</Form.Label>
                      <Form.Control
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) => setEvidenceFiles(Array.from(e.target.files || []))}
                      />
                      {evidenceFiles?.length > 0 && (
                        <div className="text-muted mt-1">تم اختيار {evidenceFiles.length} ملف/ملفات.</div>
                      )}
                    </Form.Group>
    
                    <Alert variant="light" className="border">
                      بعد إرسال التأكيد، سيُخطر صاحب الطلب فورًا وتظهر وسائل التواصل مباشرة. نوصي بإرفاق إثبات إن وُجد.
                    </Alert>
    
                    <div className="d-flex gap-2">
                      <Button type="submit" variant="success" disabled={submittingConfirm || !!existingOffer}>
                        {submittingConfirm ? 'جارٍ الإرسال…' : (!!existingOffer ? 'لديك تأكيد سابق' : 'إرسال التأكيد')}
                      </Button>
                      <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>إغلاق</Button>
                    </div>
                  </Form>
    </div>
  );
}