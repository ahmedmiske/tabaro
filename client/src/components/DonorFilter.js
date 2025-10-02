import React from 'react';
import PropTypes from 'prop-types';
import { Form } from './ui';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './DonorFilter.css';

const DonorFilter = ({
  filter, setFilter,
  startDate, setStartDate,
  endDate, setEndDate,
  donationTypes,
}) => {
  const types = Array.isArray(donationTypes) ? donationTypes : [];
  return (
    <div className="filter-donor">
      <Form.Control
        as="select"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="mb-4 form-control"
      >
        <option value="">كل الحالات</option>
        {types.map(type => (
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

DonorFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  setFilter: PropTypes.func.isRequired,
  startDate: PropTypes.instanceOf(Date),
  setStartDate: PropTypes.func.isRequired,
  endDate: PropTypes.instanceOf(Date),
  setEndDate: PropTypes.func.isRequired,
  donationTypes: PropTypes.arrayOf(PropTypes.string),
};

DonorFilter.defaultProps = {
  startDate: null,
  endDate: null,
  donationTypes: [],
};

export default DonorFilter;
