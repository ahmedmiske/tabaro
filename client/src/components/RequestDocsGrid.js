import React from 'react';
import { Card, Button } from 'react-bootstrap';

const RequestDocsGrid = ({ documents = [] }) => {
  if (!documents.length) return null;

  const fileUrl = (d) =>
    d.url?.startsWith('/uploads')
      ? `${process.env.REACT_APP_API_BASE || ''}${d.url}`
      : d.url;

  const isPdf = (d) => (d.mimeType || '').includes('pdf') || d.filename?.endsWith('.pdf');

  return (
    <div className="docs-grid">
      {documents.map((d, i) => (
        <div key={i} className="doc-tile">
          <div className="doc-thumb">
            {isPdf(d) ? (
              <i className="fas fa-file-pdf pdf-icon" />
            ) : (
              <img alt={d.originalName || d.filename} src={fileUrl(d)} />
            )}
          </div>
          <div className="doc-name" title={d.originalName || d.filename}>
            {d.originalName || d.filename}
          </div>
          <div className="doc-actions">
            <Button
              size="sm"
              variant="outline-secondary"
              as="a"
              href={fileUrl(d)}
              target="_blank"
              rel="noopener noreferrer"
            >
              فتح
            </Button>
            <Button
              size="sm"
              variant="outline-primary"
              as="a"
              href={fileUrl(d)}
              download
            >
              تنزيل
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestDocsGrid;
