import React from 'react';
import { Card, Button } from 'react-bootstrap';

const RequestDocsGrid = ({ documents = [], emptyMessage = "لا توجد مستندات مرفقة" }) => {
  if (!documents.length) {
    return (
      <div className="docs-empty-state">
        <i className="fas fa-folder-open" style={{ fontSize: '3rem', color: '#cbd5e1', marginBottom: '1rem' }} />
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{emptyMessage}</p>
      </div>
    );
  }

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
              title="عرض المستند في نافذة جديدة"
            >
              <i className="fas fa-external-link-alt" style={{ marginLeft: '0.3rem' }} />
              معاينة
            </Button>
            <Button
              size="sm"
              variant="outline-primary"
              as="a"
              href={fileUrl(d)}
              download
              title="تحميل المستند على جهازك"
            >
              <i className="fas fa-download" style={{ marginLeft: '0.3rem' }} />
              حفظ
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RequestDocsGrid;
