// src/components/FinancialManager/ExpenseWidget.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { FaMoneyBillAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

function ExpenseWidget({ data }) {
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="custom-card shadow-lg h-100"
      style={{
        background: 'linear-gradient(135deg, #dc3545 0%, #a71d2a 100%)',
      }}
    >
      <Card.Body className="p-4 d-flex align-items-center">
        <FaMoneyBillAlt className="widget-icon text-white me-3" />
        <div>
          <h5 className="card-title mb-1 fw-bold text-white">Expenses</h5>
          <h4 className="text-white fw-medium">
            {data !== undefined ? `$${parseFloat(data).toLocaleString()}` : 'N/A'}
          </h4>
        </div>
      </Card.Body>
    </motion.div>
  );
}

export default ExpenseWidget;