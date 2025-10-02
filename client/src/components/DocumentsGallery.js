// src/components/DocumentsGallery.jsx
import React, { useMemo, useState } from 'react';
import { Modal, Button } from './ui';
import { FaFilePdf, FaFileAlt, FaDownload, FaTimes } from 'react-icons/fa';

const isImg = (url = '') => /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url);
const isPdf = (url = '') => /\.pdf(\?|$)/i.test(url);

const fileNameOf = (u = '') => {
  try {
    const url = new URL(u, window.location.origin);
    const f = url.pathname.split('/').pop();
    return decodeURIComponent(f || 'file');
  } catch {
    return decodeURIComponent((u || '').split('/').pop() || 'file');
  }
};

const DocumentsGallery = ({ files = [] }) => {
  const [preview, setPreview] = useState({ open: false, url: '', title: '' });

  const normalized = useMemo(
    () => (files || []).filter(Boolean).map(String),
    [files]
  );

  if (normalized.length === 0) return null;

  return (
    <>
      <div className="docs-grid">
        {normalized.map((u, i) => {
          const img = isImg(u);
          const pdf = isPdf(u);
          const name = fileNameOf(u);

          return (
            <div key={i} className="doc-card">
              <div
                className={`doc-thumb ${img ? 'is-img' : pdf ? 'is-pdf' : 'is-file'}`}
                onClick={() => setPreview({ open: true, url: u, title: name })}
                role="button"
                aria-label={`معاينة ${name}`}
                title="معاينة"
              >
                {img ? (
                  <img src={u} alt={name} onError={(e) => (e.currentTarget.style.opacity = 0)} />
                ) : pdf ? (
                  <div className="doc-icon"><FaFilePdf /></div>
                ) : (
                  <div className="doc-icon"><FaFileAlt /></div>
                )}
              </div>

              <div className="doc-meta" title={name}>{name}</div>

              <a className="doc-download" href={u} download target="_blank" rel="noreferrer">
                <FaDownload /> <span>تنزيل</span>
              </a>
            </div>
          );
        })}
      </div>

      <Modal
        show={preview.open}
        onHide={() => setPreview({ open: false, url: '', title: '' })}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="truncate">{preview.title || 'معاينة'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="doc-modal-body">
          {isImg(preview.url) ? (
            <img className="doc-modal-img" src={preview.url} alt={preview.title} />
          ) : isPdf(preview.url) ? (
            <iframe
              className="doc-modal-iframe"
              src={preview.url}
              title={preview.title}
            />
          ) : (
            <div className="doc-modal-fallback">
              <FaFileAlt />
              <div>لا يمكن معاينة هذا النوع، يمكنك تنزيله.</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <a className="btn btn-outline-primary" href={preview.url} download target="_blank" rel="noreferrer">
            <FaDownload className="ms-1" /> تنزيل
          </a>
          <Button variant="secondary" onClick={() => setPreview({ open: false, url: '', title: '' })}>
            <FaTimes className="ms-1" /> إغلاق
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DocumentsGallery;
