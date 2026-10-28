import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo,
  Code,
  Eye,
  Upload,
  X
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, token }) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);

  // Link state
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // Image state
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Table state
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const editorRef = useRef(null);
  const savedSelectionRef = useRef(null);

  // Sync value into contentEditable when not in HTML mode and content differs
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isHtmlMode]);

  // Save current selection for modal restorations
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedSelectionRef.current = sel.getRangeAt(0);
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRef.current) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    }
  };

  const executeCommand = (command, val = null) => {
    if (isHtmlMode) return;
    document.execCommand(command, false, val);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormatBlock = (tag) => {
    if (isHtmlMode) return;
    executeCommand('formatBlock', tag);
  };

  // Insert Link
  const handleInsertLink = () => {
    restoreSelection();
    if (!linkUrl) return;
    if (linkText) {
      const a = document.createElement('a');
      a.href = linkUrl;
      a.target = linkUrl.startsWith('http') ? '_blank' : '_self';
      a.rel = linkUrl.startsWith('http') ? 'noopener noreferrer' : '';
      a.textContent = linkText;
      if (savedSelectionRef.current) {
        savedSelectionRef.current.deleteContents();
        savedSelectionRef.current.insertNode(a);
      }
    } else {
      executeCommand('createLink', linkUrl);
    }
    handleEditorInput();
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  };

  // Upload or Insert Image
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setUploadError('');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'blog_inline');
      formData.append('altText', imageAlt || file.name);

      const res = await fetch('/api/v1/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.asset?.url) {
        setImageUrl(data.asset.url);
      } else {
        setUploadError(data.error || 'Failed to upload image.');
      }
    } catch (err) {
      setUploadError('Failed to upload image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInsertImage = () => {
    restoreSelection();
    if (!imageUrl) return;
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = imageAlt || '';
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.borderRadius = '12px';
    img.style.margin = '1.5rem 0';
    img.style.display = 'block';

    if (savedSelectionRef.current) {
      savedSelectionRef.current.insertNode(img);
    } else if (editorRef.current) {
      editorRef.current.appendChild(img);
    }
    handleEditorInput();
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setUploadError('');
  };

  // Insert Table
  const handleInsertTable = () => {
    restoreSelection();
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;"><thead><tr>';
    for (let c = 1; c <= tableCols; c++) {
      tableHtml += `<th style="padding: 0.75rem; border: 1px solid #E6D8C3; background-color: #FAF8F4; font-weight: 700;">Header ${c}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 1; r <= tableRows; r++) {
      tableHtml += '<tr>';
      for (let c = 1; c <= tableCols; c++) {
        tableHtml += `<td style="padding: 0.75rem; border: 1px solid #E6D8C3;">Cell ${r},${c}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table><p><br></p>';

    executeCommand('insertHTML', tableHtml);
    handleEditorInput();
    setShowTableModal(false);
  };

  return (
    <div className="vdt-rte-container" style={{ border: '1px solid #E6D8C3', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
      {/* Rich Text Toolbar */}
      <div
        className="vdt-rte-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.65rem 0.85rem',
          backgroundColor: '#FAF8F4',
          borderBottom: '1px solid #E6D8C3',
        }}
      >
        {/* Paragraph & Headings Selector */}
        <select
          onChange={(e) => handleFormatBlock(e.target.value)}
          disabled={isHtmlMode}
          style={{
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            border: '1px solid #E6D8C3',
            fontSize: '0.82rem',
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            cursor: 'pointer',
          }}
          defaultValue="<p>"
        >
          <option value="<p>">Paragraph</option>
          <option value="<h2>">Heading 2 (H2)</option>
          <option value="<h3>">Heading 3 (H3)</option>
          <option value="<h4>">Heading 4 (H4)</option>
        </select>

        <span style={{ width: '1px', height: '20px', backgroundColor: '#E6D8C3', margin: '0 0.25rem' }} />

        {/* Text Styles */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          disabled={isHtmlMode}
          title="Bold (Ctrl+B)"
          style={btnStyle}
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('italic')}
          disabled={isHtmlMode}
          title="Italic (Ctrl+I)"
          style={btnStyle}
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('underline')}
          disabled={isHtmlMode}
          title="Underline (Ctrl+U)"
          style={btnStyle}
        >
          <UnderlineIcon size={15} />
        </button>

        <span style={{ width: '1px', height: '20px', backgroundColor: '#E6D8C3', margin: '0 0.25rem' }} />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          disabled={isHtmlMode}
          title="Bullet List"
          style={btnStyle}
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          disabled={isHtmlMode}
          title="Numbered List"
          style={btnStyle}
        >
          <ListOrdered size={15} />
        </button>
        <button
          type="button"
          onClick={() => handleFormatBlock('<blockquote>')}
          disabled={isHtmlMode}
          title="Blockquote"
          style={btnStyle}
        >
          <Quote size={15} />
        </button>

        <span style={{ width: '1px', height: '20px', backgroundColor: '#E6D8C3', margin: '0 0.25rem' }} />

        {/* Insert Elements */}
        <button
          type="button"
          onClick={() => {
            saveSelection();
            setShowLinkModal(true);
          }}
          disabled={isHtmlMode}
          title="Insert Link"
          style={btnStyle}
        >
          <LinkIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => {
            saveSelection();
            setShowImageModal(true);
          }}
          disabled={isHtmlMode}
          title="Insert Image (Upload or URL)"
          style={btnStyle}
        >
          <ImageIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => {
            saveSelection();
            setShowTableModal(true);
          }}
          disabled={isHtmlMode}
          title="Insert Responsive Table"
          style={btnStyle}
        >
          <TableIcon size={15} />
        </button>

        <span style={{ width: '1px', height: '20px', backgroundColor: '#E6D8C3', margin: '0 0.25rem' }} />

        {/* History */}
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          disabled={isHtmlMode}
          title="Undo"
          style={btnStyle}
        >
          <Undo size={15} />
        </button>
        <button
          type="button"
          onClick={() => executeCommand('redo')}
          disabled={isHtmlMode}
          title="Redo"
          style={btnStyle}
        >
          <Redo size={15} />
        </button>

        {/* Source / HTML Toggle Button */}
        <div style={{ marginLeft: 'auto' }}>
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            style={{
              ...btnStyle,
              backgroundColor: isHtmlMode ? '#17191C' : '#FFFFFF',
              color: isHtmlMode ? '#FAF8F4' : '#17191C',
              padding: '0.35rem 0.75rem',
              gap: '0.4rem',
              display: 'inline-flex',
            }}
            title="Toggle Raw HTML Source Mode"
          >
            {isHtmlMode ? <Eye size={14} /> : <Code size={14} />}
            <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
              {isHtmlMode ? 'WYSIWYG Mode' : 'HTML Source'}
            </span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {isHtmlMode ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or write clean HTML..."
          style={{
            width: '100%',
            minHeight: '380px',
            padding: '1.25rem',
            border: 'none',
            outline: 'none',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            resize: 'vertical',
            boxSizing: 'border-box',
            backgroundColor: '#FAF8F4',
            color: '#17191C',
          }}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onBlur={handleEditorInput}
          style={{
            minHeight: '380px',
            padding: '1.5rem',
            outline: 'none',
            fontFamily: 'Lora, Georgia, serif',
            fontSize: '1.05rem',
            lineHeight: 1.8,
            color: '#2B2F36',
            boxSizing: 'border-box',
          }}
        />
      )}

      {/* =========================================================================
          MODALS FOR INSERT LINK, IMAGE, TABLE
          ========================================================================= */}

      {/* Insert Link Modal */}
      {showLinkModal && (
        <div style={modalBackdropStyle} onClick={() => setShowLinkModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Insert Hyperlink</h4>
              <button type="button" onClick={() => setShowLinkModal(false)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div>
                <label style={labelStyle}>URL Destination *</label>
                <input
                  type="text"
                  placeholder="https://example.com or /hallstatt-day-trip/"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <label style={labelStyle}>Link Text (optional if text is already selected)</label>
                <input
                  type="text"
                  placeholder="e.g. View Private Hallstatt Tour"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowLinkModal(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="button" onClick={handleInsertLink} style={primaryBtnStyle}>
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Image Modal */}
      {showImageModal && (
        <div style={modalBackdropStyle} onClick={() => setShowImageModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Insert Article Image</h4>
              <button type="button" onClick={() => setShowImageModal(false)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div>
                <label style={labelStyle}>Upload From Computer (Sanity CDN Persistent Storage)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <label
                    style={{
                      ...primaryBtnStyle,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Upload size={14} />
                    <span>{uploadingImage ? 'Uploading...' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                  {imageUrl && <span style={{ fontSize: '0.8rem', color: '#C69C50', fontWeight: 600 }}>Image Ready!</span>}
                </div>
                {uploadError && <div style={{ color: '#E53E3E', fontSize: '0.8rem', marginTop: '0.35rem' }}>{uploadError}</div>}
              </div>

              <div>
                <label style={labelStyle}>Or Enter Direct Image URL</label>
                <input
                  type="text"
                  placeholder="https://... or /blog-images/image.png"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Image ALT Description (SEO)</label>
                <input
                  type="text"
                  placeholder="Descriptive ALT text for accessibility & Google Image Search"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {imageUrl && (
                <div style={{ maxHeight: '180px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #E6D8C3' }}>
                  <img src={imageUrl} alt={imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowImageModal(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="button" onClick={handleInsertImage} disabled={!imageUrl} style={primaryBtnStyle}>
                  Insert Into Content
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insert Table Modal */}
      {showTableModal && (
        <div style={modalBackdropStyle} onClick={() => setShowTableModal(false)}>
          <div style={modalCardStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Insert Responsive Table</h4>
              <button type="button" onClick={() => setShowTableModal(false)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(Number(e.target.value))}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowTableModal(false)} style={cancelBtnStyle}>
                  Cancel
                </button>
                <button type="button" onClick={handleInsertTable} style={primaryBtnStyle}>
                  Insert Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E6D8C3',
  borderRadius: '6px',
  padding: '0.35rem 0.55rem',
  color: '#62666D',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.15s ease',
};

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(23, 25, 28, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  padding: '1rem',
};

const modalCardStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '14px',
  padding: '1.5rem',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
  border: '1px solid #E6D8C3',
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid #F0ECE4',
  paddingBottom: '0.75rem',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#8E929B',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#17191C',
  marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #E6D8C3',
  fontSize: '0.88rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const cancelBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: '1px solid #E6D8C3',
  backgroundColor: '#FFFFFF',
  color: '#62666D',
  fontSize: '0.84rem',
  fontWeight: 600,
  cursor: 'pointer',
};

const primaryBtnStyle = {
  padding: '0.5rem 1.15rem',
  borderRadius: '8px',
  border: 'none',
  backgroundColor: '#C69C50',
  color: '#FFFFFF',
  fontSize: '0.84rem',
  fontWeight: 700,
  cursor: 'pointer',
};
