import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ProgressBar, Alert, Button, Modal, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [formData, setFormData] = useState({ category: '', allocated: '', spent: '' });
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await axiosInstance.get('budgets/');
      setBudgets(response.data);
      localStorage.setItem('budgets', JSON.stringify(response.data));
    } catch (err) {
      console.error('Error fetching budgets:', err);
      setError('Failed to load budgets.');
    }
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      category: budget.category,
      allocated: budget.allocated,
      spent: budget.spent,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axiosInstance.delete(`budgets/${id}/`);
        fetchBudgets();
      } catch (err) {
        console.error('Error deleting budget:', err);
        setError('Error deleting budget.');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`budgets/${selectedBudget.id}/`, formData);
      setShowModal(false);
      setSelectedBudget(null);
      setFormData({ category: '', allocated: '', spent: '' });
      fetchBudgets();
    } catch (err) {
      setError('Error updating budget. Please try again.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category: formData.category,
        allocated: parseFloat(formData.allocated).toFixed(2),
        spent: parseFloat(formData.spent || 0).toFixed(2),
      };
      await axiosInstance.post('budgets/', payload);
      setShowAddModal(false);
      setFormData({ category: '', allocated: '', spent: '' });
      fetchBudgets();
      setError('');
    } catch (err) {
      setError('Error creating budget. Please check the form data.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="px-4 py-5"
      style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%)', minHeight: '100vh' }}
    >
      <h2 className="mb-5 text-center fw-bold" style={{ color: '#1A3C5A', fontSize: '2.5rem', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
        Budgets
      </h2>

      {error && (
        <Alert variant="danger" className="rounded-3 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
          {error}
        </Alert>
      )}

      <div className="text-center mb-5">
        <Button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(45deg, #ff8c00, #ffa726)',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: '500',
            fontSize: '1.1rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 6px 18px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <FaPlus className="me-2" /> Add Budget
        </Button>
      </div>

      <Row className="g-4">
        {budgets.map((budget) => {
          const profitLoss = parseFloat(budget.allocated) - parseFloat(budget.spent);
          return (
            <Col md={6} lg={4} key={budget.id}>
              <motion.div
                className="shadow-lg rounded-3 p-4"
                style={{ background: '#ffffff', border: '1px solid #e0e6ed' }}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#1A3C5A' }}>{budget.category}</h5>
                  <div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEdit(budget)}
                      className="me-2"
                      style={{ borderRadius: '6px' }}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(budget.id)}
                      style={{ borderRadius: '6px' }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </div>
                <div className="d-flex justify-content-between mb-2" style={{ color: '#4A6A88', fontSize: '0.9rem' }}>
                  <span>Spent: ${parseFloat(budget.spent).toLocaleString()}</span>
                  <span>Allocated: ${parseFloat(budget.allocated).toLocaleString()}</span>
                </div>
                <ProgressBar
                  now={(parseFloat(budget.spent) / parseFloat(budget.allocated)) * 100}
                  variant={
                    parseFloat(budget.spent) > parseFloat(budget.allocated) ? 'danger' :
                    parseFloat(budget.spent) > parseFloat(budget.allocated) * 0.8 ? 'warning' : 'success'
                  }
                  className="mb-3"
                  style={{ height: '8px', borderRadius: '4px' }}
                />
                <div className="d-flex justify-content-between" style={{ color: '#4A6A88', fontSize: '0.9rem' }}>
                  <span className={`fw-bold ${profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                    {profitLoss >= 0 ? 'Profit' : 'Loss'}: {profitLoss >= 0 ? '+' : ''}${Math.abs(profitLoss).toLocaleString()}
                  </span>
                </div>
                {parseFloat(budget.spent) > parseFloat(budget.allocated) && (
                  <Alert variant="danger" className="small p-2 mt-2 rounded-3">
                    Over budget by ${(parseFloat(budget.spent) - parseFloat(budget.allocated)).toLocaleString()}!
                  </Alert>
                )}
                {parseFloat(budget.spent) > parseFloat(budget.allocated) * 0.8 && parseFloat(budget.spent) <= parseFloat(budget.allocated) && (
                  <Alert variant="warning" className="small p-2 mt-2 rounded-3">
                    Approaching limit!
                  </Alert>
                )}
              </motion.div>
            </Col>
          );
        })}
      </Row>

      {/* Edit Budget Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1A3C5A' }}>Edit Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="category" className="mb-3">
              <Form.Label className="fw-medium">Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
            <Form.Group controlId="allocated" className="mb-3">
              <Form.Label className="fw-medium">Allocated Amount</Form.Label>
              <Form.Control
                type="number"
                name="allocated"
                value={formData.allocated}
                onChange={handleInputChange}
                required
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
            <Form.Group controlId="spent" className="mb-3">
              <Form.Label className="fw-medium">Spent Amount</Form.Label>
              <Form.Control
                type="number"
                name="spent"
                value={formData.spent}
                onChange={handleInputChange}
                required
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-3">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className="rounded-3 px-3 py-1"
            style={{ borderColor: '#e0e6ed', color: '#4A6A88' }}
          >
            Close
          </Button>
          <Button
            onClick={handleSubmit}
            style={{
              background: 'linear-gradient(45deg, #007bff, #00aaff)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '500',
            }}
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Budget Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1A3C5A' }}>Add Budget</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-4">
          {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
          <Form onSubmit={handleCreate}>
            <Form.Group controlId="category" className="mb-3">
              <Form.Label className="fw-medium">Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
            <Form.Group controlId="allocated" className="mb-3">
              <Form.Label className="fw-medium">Allocated Amount</Form.Label>
              <Form.Control
                type="number"
                name="allocated"
                value={formData.allocated}
                onChange={handleInputChange}
                required
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
            <Form.Group controlId="spent" className="mb-3">
              <Form.Label className="fw-medium">Spent Amount</Form.Label>
              <Form.Control
                type="number"
                name="spent"
                value={formData.spent}
                onChange={handleInputChange}
                placeholder="0"
                className="rounded-3 p-2"
                style={{ borderColor: '#e0e6ed' }}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-3">
          <Button
            variant="outline-secondary"
            onClick={() => setShowAddModal(false)}
            className="rounded-3 px-3 py-1"
            style={{ borderColor: '#e0e6ed', color: '#4A6A88' }}
          >
            Close
          </Button>
          <Button
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(45deg, #ff8c00, #ffa726)',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '500',
            }}
          >
            Add Budget
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default Budgets;