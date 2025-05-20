import React from 'react';
import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown, FaBalanceScale } from 'react-icons/fa';

function BalanceWidget({ totalIncome, totalExpense, balance }) {
  return (
    <motion.div
      className="custom-card shadow-lg rounded-3 p-2"
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid #e0e6ed',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <h5 className="fw-bold mb-2" style={{ color: '#1A3C5A', fontSize: '1.25rem' }}>
        Financial Overview
      </h5>
      
      <div className="d-flex flex-column gap-2">
        {/* Total Income */}
        <div className="d-flex align-items-center">
          <FaArrowUp className="text-success me-2" size={16} />
          <div>
            <p className="mb-0" style={{ color: '#4A6A88', fontSize: '0.8rem', fontWeight: '500' }}>
              Total Income
            </p>
            <p className="mb-0 fw-bold" style={{ color: '#28a745', fontSize: '1rem' }}>
              ${totalIncome.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Total Expense */}
        <div className="d-flex align-items-center">
          <FaArrowDown className="text-danger me-2" size={16} />
          <div>
            <p className="mb-0" style={{ color: '#4A6A88', fontSize: '0.8rem', fontWeight: '500' }}>
              Total Expense
            </p>
            <p className="mb-0 fw-bold" style={{ color: '#dc3545', fontSize: '1rem' }}>
              ${totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
        
        {/* Balance */}
        <div className="d-flex align-items-center">
          <FaBalanceScale className={`me-2 ${balance >= 0 ? 'text-success' : 'text-danger'}`} size={16} />
          <div>
            <p className="mb-0" style={{ color: '#4A6A88', fontSize: '0.8rem', fontWeight: '500' }}>
              Balance
            </p>
            <p
              className="mb-0 fw-bold"
              style={{
                color: balance >= 0 ? '#28a745' : '#dc3545',
                fontSize: '1rem',
              }}
            >
              {balance >= 0 ? '+' : ''}${Math.abs(balance).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BalanceWidget;