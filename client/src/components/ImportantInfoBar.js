import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import Marquee from 'react-fast-marquee';

import './ImportantInfoBar.css';
import fetchWithInterceptors from '../services/fetchWithInterceptors';

const ImportantInfoBar = ({ apiUrl }) => {
  const [info, setInfo] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { ok, body } = await fetchWithInterceptors(apiUrl);
        if (ok && mounted) setInfo(Array.isArray(body) ? body : (body?.data || []));
      } catch (e) {
        console.error('Error fetching important info:', e);
      }
    })();
    return () => { mounted = false; };
  }, [apiUrl]);

  return (
    <Container fluid className="important-info-bar">
      <Marquee gradient={false} pauseOnHover>
        {info.map((item, i) => (
          <span key={i} className="info-item">{item.description || String(item)}</span>
        ))}
      </Marquee>
    </Container>
  );
};

ImportantInfoBar.propTypes = {
  apiUrl: PropTypes.string,
};

ImportantInfoBar.defaultProps = {
  apiUrl: '/important-info',
};

export default React.memo(ImportantInfoBar);
