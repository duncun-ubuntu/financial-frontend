// src/components/FinancialManager/InvestmentWidget.js
import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

function InvestmentWidget({ data }) {
  const total = data && typeof data.total === 'number' ? data.total : 0;
  const breakdown = data && Array.isArray(data.breakdown) ? data.breakdown : [];

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="custom-card shadow-lg h-100"
      style={{
        background: 'linear-gradient(135deg, #17a2b8 0%, #117a8b 100%)',
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <FaChartLine className="widget-icon text-white me-3" />
          <div>
            <h5 className="card-title mb-1 fw-bold text-white">Investments</h5>
            <h4 className="text-white fw-medium">
              {total !== 0 ? `$${total.toLocaleString()}` : 'N/A'}
            </h4>
          </div>
        </div>
        {breakdown.length > 0 && (
          <ListGroup variant="flush" className="small text-white">
            {breakdown.map((investment, index) => (
              <ListGroup.Item
                key={index}
                className="d-flex justify-content-between p-2 bg-transparent border-0"
              >
                <span>{investment.type}</span>
                <span>${parseFloat(investment.amount).toLocaleString()}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </motion.div>
  );
}

export default InvestmentWidget;