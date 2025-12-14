import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaChartPie } from 'react-icons/fa';
import { motion } from 'framer-motion';

function BudgetTracker({ budgets }) {
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.allocated), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + parseFloat(budget.spent), 0);

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="custom-card shadow-lg h-100"
      style={{
        background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-3">
          <FaChartPie className="widget-icon text-white me-3" />
          <div>
            <h5 className="card-title mb-1 fw-bold text-white">Budget Tracker</h5>
            <p className="mb-1 small text-white">Total Budget: ${totalBudget.toLocaleString()}</p>
            <p className="mb-0 small text-white">Total Spent: ${totalSpent.toLocaleString()}</p>
          </div>
        </div>
        <Link to="/financial-manager/budgets" className="btn btn-outline-light btn-sm w-100 rounded-3">
          View Details
        </Link>
      </Card.Body>
    </motion.div>
  );
}

export default BudgetTracker;