// src/components/FinancialManager/IncomeWidget.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { FaDollarSign } from 'react-icons/fa';
import { motion } from 'framer-motion';

function IncomeWidget({ totalEarnings }) {
  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="custom-card shadow-lg h-100"
      style={{
        background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
      }}
    >
      <Card.Body className="p-4 d-flex align-items-center">
        <FaDollarSign className="widget-icon text-white me-3" />
        <div>
          <h5 className="card-title mb-1 fw-bold text-white">Income</h5>
          <h4 className="text-white fw-medium">
            {totalEarnings !== undefined ? `+$${parseFloat(totalEarnings).toLocaleString()}` : 'N/A'}
          </h4>
        </div>
      </Card.Body>
    </motion.div>
  );
}

export default IncomeWidget;