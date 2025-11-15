<Form.Control
  type="text"
  placeholder={`رقم هاتف ${method}`}
  value={selected.phone}
  onChange={(e) => {
    const phone = e.target.value;
    setDonation((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((m) =>
        m.method === method ? { ...m, phone } : m
      )
    }));
  }}
  onBlur={() => {
    setErrors((prev) => ({
      ...prev,
      paymentPhones: {
        ...prev.paymentPhones,
        [method]: !validatePhoneNumber(selected.phone)
      }
    }));
  }}
  isInvalid={errors.paymentPhones[method]}
/>
{errors.paymentPhones[method] && (
  <small className="text-danger">رقم غير صحيح (8 أرقام)</small>
)}
>