import React from 'react';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import './DonorList.css';
import './DonorFilter.css';

const DonorFilter = ({ filter, setFilter, startDate, setStartDate, endDate, setEndDate, donationTypes }) => {
  return (
    <div className='filter-donor'>
      <Form.Control
        as="select"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 form-control"
      >
        <option value="">كل الحالات</option>
        {donationTypes.map(type => (
          <option key={type} value={type}>{type}</option>
        ))}
      </Form.Control>
      <div className="mb-4 filter-date">
        <label>اختر التاريخ</label>
        <div className="d-flex input-date">
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={new Date(2024, 0, 1)}
            placeholderText="إلى"
            className="form-control"
          />
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date(2024, 0, 1)}
            placeholderText="من"
            className="form-control"
          />
        </div>
      </div>
    </div>
  );
};

export default DonorFilter;
