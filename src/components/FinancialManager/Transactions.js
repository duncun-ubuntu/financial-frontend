// src/components/FinancialManager/Transactions.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import TransactionTable from './TransactionTable';
import axiosInstance from '../../api/axiosInstance';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    // Removed description
    category: '',
    amount: '',
    type: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get('transactions/');
      // Assuming the response structure is { transactions: [...] }
      // Adjust this line if the structure is just [...]
      setTransactions(response.data.transactions || response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err.response?.data || err.message);
      setError('Failed to load transactions.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      date: transaction.date,
      // Removed description from setting form data
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload based on type, similar to Dashboard.js logic
      const payload = {
        date: formData.date,
        amount: parseFloat(formData.amount).toFixed(2), // Ensure amount is a fixed-point number
      };

      let response;

      if (formData.type === 'Income') {
        // Assuming 'project' is used for Income description in backend
        payload.project = formData.category || 'Income'; // Use category as project
        response = await axiosInstance.post('earnings/', payload); // Post to earnings endpoint
      } else if (formData.type === 'Expense') {
        // Assuming 'category' is used for Expense description in backend
        payload.category = formData.category || 'Expense'; // Use category
        // You might need to add budget_id here if your expense endpoint requires it
        // payload.budget = formData.budget_id; // Add this if needed and you add a budget select
        response = await axiosInstance.post('expenses/', payload); // Post to expenses endpoint
      } else {
         // Handle cases where type is not selected or is neither Income nor Expense
         setError('Please select a valid transaction type (Income or Expense).');
         return; // Stop submission
      }

      console.log(`Saved transaction:`, response.data);
      setShowModal(false);
      setSelectedTransaction(null);
      setFormData({ date: '', category: '', amount: '', type: '' }); // Reset form without description
      setError(''); // Clear any previous errors
      fetchTransactions(); // Refresh the list

    } catch (err) {
      console.error('Error saving transaction:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.project || err.response?.data?.category || err.response?.data?.non_field_errors || err.response?.data?.amount || 'Please check the form data and try again.';
      setError(`Error saving record: ${errorMsg}`);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-center">Transactions</h2>
      <div className="mb-3 text-end">
        <Button variant="primary" onClick={() => {
            setSelectedTransaction(null); // Ensure selectedTransaction is null for adding
            setFormData({ date: '', category: '', amount: '', type: '' }); // Clear form data
            setError(''); // Clear previous errors
            setShowModal(true); // Open the modal
        }}>
          Add Transaction
        </Button>
      </div>
      <TransactionTable transactions={transactions} onEdit={handleEdit} />

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="date" className="mb-3">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            {/* Removed Description Field */}
            {/*
            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            */}

            <Form.Group controlId="category" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                placeholder="Enter category (e.g., Salary, Rent)"
              />
            </Form.Group>
            <Form.Group controlId="amount" className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                placeholder="Enter amount"
              />
            </Form.Group>
            <Form.Group controlId="type" className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Select>
            </Form.Group>

             {/* Add budget selection here if needed for expenses */}
            {/*
            {formData.type === 'Expense' && (
              <Form.Group controlId="budget_id" className="mb-3">
                <Form.Label>Budget</Form.Label>
                 // You would need to fetch budgets here as well
                <Form.Control as="select" name="budget_id" value={formData.budget_id || ''} onChange={handleInputChange} required>
                  <option value="">Select Budget</option>
                   // Map over budgets here
                </Form.Control>
              </Form.Group>
            )}
            */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default Transactions;