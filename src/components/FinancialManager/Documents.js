import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table } from 'react-bootstrap';
import axios, { uploadFile } from '../../api/axiosInstance';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('pdf');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/documents/');
      console.log('Fetched documents:', response.data); // Debug log
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to fetch documents.');
      console.error('Fetch documents error:', err); // Debug log
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
      console.log('Selected file:', selectedFile.name); // Debug log
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Please provide a title and select a file.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    formData.append('file_type', fileType);

    try {
      const response = await uploadFile('/documents/', formData);
      console.log('Upload response:', response.data); // Debug log
      setTitle('');
      setFile(null);
      setFileType('pdf');
      fetchDocuments();
    } catch (err) {
      setError(err.response?.data?.file?.[0] || 'Failed to upload document.');
      console.error('Upload error:', err); // Debug log
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/documents/${id}/`);
      console.log('Deleted document ID:', id); // Debug log
      fetchDocuments();
    } catch (err) {
      setError('Failed to delete document.');
      console.error('Delete error:', err); // Debug log
    }
  };

  const handleDownload = (fileUrl) => {
    console.log('Downloading file from:', fileUrl); // Debug log
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container>
      <h2 className="mb-4">Manage Documents</h2>
      {error && <p className="text-danger">{error}</p>}
      <Form onSubmit={handleUpload} className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>File Type</Form.Label>
              <Form.Select value={fileType} onChange={(e) => setFileType(e.target.value)}>
                <option value="pdf">PDF</option>
                <option value="docx">Word</option>
                <option value="xlsx">Excel</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>File (Max 1MB)</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.docx,.doc,.xlsx,.xls"
              />
            </Form.Group>
          </Col>
          <Col md={2} className="d-flex align-items-end">
            <Button type="submit" variant="primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </Col>
        </Row>
      </Form>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Title</th>
            <th>File Type</th>
            <th>Uploaded At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.title}</td>
              <td>{doc.file_type.toUpperCase()}</td>
              <td>{new Date(doc.uploaded_at).toLocaleDateString()}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleDownload(doc.file_url)}
                  className="me-2"
                >
                  Download
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Documents;