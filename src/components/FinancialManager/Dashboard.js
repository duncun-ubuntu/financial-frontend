import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Modal, Form, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaMoneyBillWave, FaChartPie, FaPlus } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import BalanceWidget from './BalanceWidget';
import TransactionTable from './TransactionTable';
import BudgetTracker from './BudgetTracker';
import axiosInstance from '../../api/axiosInstance';

// Register Chart.js components
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    budgets: [],
    transactions: [],
  });
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllData();
    fetchBudgets();
  }, []);

  const fetchAllData = async () => {
    try {
      const [budgetsRes, transactionsRes] = await Promise.all([
        axiosInstance.get('budgets/'),
        axiosInstance.get('transactions/'),
      ]);
      setFinancialData({
        balance: transactionsRes.data.balance || 0,
        budgets: budgetsRes.data || [],
        transactions: transactionsRes.data.transactions || transactionsRes.data || [],
      });
    } catch (err) {
      console.error('Error fetching financial data:', err.response?.data || err.message);
      setError('Failed to load financial data.');
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axiosInstance.get('budgets/');
      setBudgets(response.data);
    } catch (err) {
      console.error('Error fetching budgets:', err.response?.data || err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreate = async (type) => {
    try {
      let response;
      const payload = { ...formData };
      
      if (type === 'earnings') {
        payload.project = formData.category || 'Income';
        payload.amount = parseFloat(formData.amount).toFixed(2);
        delete payload.budget_id;
        delete payload.type;
        delete payload.description;
        response = await axiosInstance.post('earnings/', payload);
      } else if (type === 'expenses') {
        payload.category = formData.category || 'Expense';
        payload.amount = parseFloat(formData.amount).toFixed(2);
        payload.budget = formData.budget_id;
        delete payload.type;
        delete payload.description;
        response = await axiosInstance.post('expenses/', payload);
      }
      
      setShowModal(null);
      setFormData({});
      await fetchAllData();
      setError('');
    } catch (err) {
      const errorMsg = err.response?.data?.project || err.response?.data?.budget || 
        err.response?.data?.non_field_errors || err.response?.data?.amount || 
        'Please check the form data and try again.';
      setError(`Error creating record: ${errorMsg}`);
    }
  };

  const handleDownloadReport = async (format) => {
    try {
      const response = await axiosInstance.get(`weekly-report/?format=${format}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_report_${format}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Weekly report endpoint not found.');
      } else if (err.response?.status === 500) {
        setError('Server error generating report.');
      } else {
        setError('Error downloading report. Please try again.');
      }
    }
  };

  const sortedTransactions = [...financialData.transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });
  const displayedTransactions = sortedTransactions.slice(0, 5);

  const totalEarnings = financialData.transactions
    .filter((transaction) => transaction.type === 'Income')
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

  const totalExpenses = financialData.transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);

  const companyProfitLoss = totalEarnings - totalExpenses;

  const topExpenseCategory = financialData.transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((max, exp) => parseFloat(exp.amount) > parseFloat(max.amount || 0) ? exp : max, {})
    .category || 'N/A';

  const topExpenseAmount = financialData.transactions
    .filter((transaction) => transaction.type === 'Expense')
    .reduce((max, exp) => Math.max(max, parseFloat(exp.amount)), 0) || 0;

  // Pie Chart Data for Budget Breakdown
  const budgetPieData = {
    labels: financialData.budgets.map(budget => budget.category),
    datasets: [{
      data: financialData.budgets.map(budget => parseFloat(budget.spent)),
      backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'],
      borderColor: '#ffffff',
      borderWidth: 1,
    }],
  };

  // Histogram Data for Budgets
  const budgetHistogramData = {
    labels: financialData.budgets.map(budget => budget.category),
    datasets: [
      {
        label: 'Allocated',
        data: financialData.budgets.map(budget => parseFloat(budget.allocated)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Spent',
        data: financialData.budgets.map(budget => parseFloat(budget.spent)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      className="dashboard-container px-2 py-3"
      style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 100%)', minHeight: '100vh', overflowX: 'hidden' }}
    >
      <h2
        className="mb-3 text-center fw-bold"
        style={{ color: '#1A3C5A', fontSize: '1.75rem', textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}
      >
        Financial Dashboard
      </h2>

      {error && (
        <Alert variant="danger" className="rounded-3 mb-3 mx-auto" style={{ maxWidth: '100%', width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* Top Row: Balance and Budget Pie Chart */}
      <Row className="g-2 mb-3">
        <Col xs={12} md={6} lg={4}>
          <BalanceWidget
            totalIncome={totalEarnings}
            totalExpense={totalExpenses}
            balance={financialData.balance}
          />
        </Col>
        <Col xs={12} md={6} lg={8}>
          <motion.div
            className="shadow-lg rounded-3 p-2 chart-container"
            style={{ background: '#ffffff', border: '1px solid #e0e6ed', maxWidth: '100%' }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <h5 className="fw-bold mb-2" style={{ color: '#1A3C5A', fontSize: '1.25rem' }}>
              Budget Breakdown
            </h5>
            {financialData.budgets.length > 0 ? (
              <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <Pie
                  data={budgetPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          font: { size: 10, family: 'Inter' },
                          color: '#4A6A88',
                          padding: 10,
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(26, 60, 90, 0.8)',
                        titleFont: { family: 'Inter', size: 10 },
                        bodyFont: { family: 'Inter', size: 8 },
                        callbacks: {
                          label: (context) => `$${context.parsed.toLocaleString()}`,
                        },
                      },
                    },
                  }}
                  style={{ maxHeight: '200px', width: '100%' }}
                />
              </div>
            ) : (
              <p className="text-center" style={{ color: '#4A6A88', fontSize: '0.9rem' }}>
                No budget data available
              </p>
            )}
          </motion.div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-2 mb-3">
        <Col xs={12} md={6}>
          <motion.div
            className="shadow-lg rounded-3 p-2"
            style={{ background: '#ffffff', border: '1px solid #e0e6ed', maxWidth: '100%' }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <div className="d-flex align-items-center">
              <FaMoneyBillWave className="text-success me-2" size={18} />
              <div>
                <h6 className="fw-bold mb-1" style={{ color: '#1A3C5A', fontSize: '1rem' }}>
                  Company Profit/Loss
                </h6>
                <p className="mb-0" style={{ color: '#4A6A88', fontSize: '0.8rem' }}>
                  {companyProfitLoss >= 0 ? 'Profit' : 'Loss'}:
                  <span className={`ms-1 fw-bold ${companyProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                    {companyProfitLoss >= 0 ? '+' : ''}${Math.abs(companyProfitLoss).toLocaleString()}
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </Col>
        <Col xs={12} md={6}>
          <motion.div
            className="shadow-lg rounded-3 p-2"
            style={{ background: '#ffffff', border: '1px solid #e0e6ed', maxWidth: '100%' }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <div className="d-flex align-items-center">
              <FaChartPie className="text-danger me-2" size={18} />
              <div>
                <h6 className="fw-bold mb-1" style={{ color: '#1A3C5A', fontSize: '1rem' }}>
                  Top Expense
                </h6>
                <p className="mb-0" style={{ color: '#4A6A88', fontSize: '0.8rem' }}>
                  {topExpenseCategory}: ${topExpenseAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>
        </Col>
      </Row>

      {/* Budget Histogram */}
      <Row className="g-2 mb-3">
        <Col xs={12}>
          <motion.div
            className="shadow-lg rounded-3 p-2 chart-container"
            style={{ background: '#ffffff', border: '1px solid #e0e6ed', maxWidth: '100%' }}
            whileHover={{ scale: 1.01, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <h5 className="fw-bold mb-2" style={{ color: '#1A3C5A', fontSize: '1.25rem' }}>
              Budget Allocation vs. Spending
            </h5>
            {financialData.budgets.length > 0 ? (
              <div style={{ maxWidth: '100%', overflowX: 'hidden' }}>
                <Bar
                  data={budgetHistogramData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: { size: 10, family: 'Inter' },
                          color: '#4A6A88',
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(26, 60, 90, 0.8)',
                        titleFont: { family: 'Inter', size: 10 },
                        bodyFont: { family: 'Inter', size: 8 },
                        callbacks: {
                          label: (context) => `$${context.parsed.y.toLocaleString()}`,
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: { font: { family: 'Inter', size: 8 }, color: '#4A6A88' },
                        grid: { display: false },
                      },
                      y: {
                        ticks: {
                          font: { family: 'Inter', size: 8 },
                          color: '#4A6A88',
                          callback: (value) => `$${value.toLocaleString()}`,
                        },
                        grid: { color: '#e0e6ed' },
                      },
                    },
                  }}
                  style={{ maxHeight: '250px', width: '100%' }}
                />
              </div>
            ) : (
              <p className="text-center" style={{ color: '#4A6A88', fontSize: '0.9rem' }}>
                No budget data available
              </p>
            )}
          </motion.div>
        </Col>
      </Row>

      {/* Main Content */}
      <Row className="g-2 mb-3">
        <Col xs={12} lg={4}>
          <BudgetTracker budgets={financialData.budgets} />
        </Col>
        <Col xs={12} lg={8}>
          <div style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <TransactionTable transactions={displayedTransactions} onEdit={() => setShowModal('transaction')} />
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowModal('transaction')}
            className="mt-2 w-100 custom-btn custom-btn-primary"
            style={{
              background: 'linear-gradient(45deg, #007bff, #00aaff)',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              fontWeight: '500',
              color: '#ffffff',
              fontSize: '0.9rem',
            }}
          >
            <FaPlus /> Add Transaction
          </Button>
        </Col>
      </Row>

      {/* Report Buttons */}
      <Row className="g-2">
        <Col xs={12} className="d-flex flex-column gap-2">
          <Button
            onClick={() => handleDownloadReport('excel')}
            className="w-100"
            style={{
              background: 'linear-gradient(45deg, #28a745, #34c759)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '0.9rem',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            Download Excel Report
          </Button>
          <Button
            onClick={() => handleDownloadReport('pdf')}
            className="w-100"
            style={{
              background: 'linear-gradient(45deg, #17a2b8, #20c4de)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '0.9rem',
            }}
            onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          >
            Download PDF Report
          </Button>
        </Col>
      </Row>

      {/* Transaction Modal */}
      <Modal show={showModal === 'transaction'} onHide={() => setShowModal(null)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: '#1A3C5A', fontSize: '1rem' }}>
            Add Transaction
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-2 py-2">
          {error && <Alert variant="danger" className="rounded-3" style={{ fontSize: '0.8rem' }}>
            {error}
          </Alert>}
          <Form>
            <Form.Group controlId="date" className="mb-2">
              <Form.Label className="fw-medium" style={{ fontSize: '0.8rem' }}>
                Date
              </Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={formData.date || ''}
                onChange={handleInputChange}
                required
                className="rounded-3 p-1"
                style={{ borderColor: '#e0e6ed', fontSize: '0.8rem' }}
              />
            </Form.Group>
            <Form.Group controlId="category" className="mb-2">
              <Form.Label className="fw-medium" style={{ fontSize: '0.8rem' }}>
                Category
              </Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                required
                className="rounded-3 p-1"
                style={{ borderColor: '#e0e6ed', fontSize: '0.8rem' }}
              />
            </Form.Group>
            <Form.Group controlId="amount" className="mb-2">
              <Form.Label className="fw-medium" style={{ fontSize: '0.8rem' }}>
                Amount
              </Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                required
                className="rounded-3 p-1"
                style={{ borderColor: '#e0e6ed', fontSize: '0.8rem' }}
              />
            </Form.Group>
            <Form.Group controlId="type" className="mb-2">
              <Form.Label className="fw-medium" style={{ fontSize: '0.8rem' }}>
                Type
              </Form.Label>
              <Form.Select
                name="type"
                value={formData.type || ''}
                onChange={handleInputChange}
                required
                className="rounded-3 p-1"
                style={{ borderColor: '#e0e6ed', fontSize: '0.8rem' }}
              >
                <option value="">Select Type</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </Form.Select>
            </Form.Group>
            {formData.type === 'Expense' && (
              <Form.Group controlId="budget_id" className="mb-2">
                <Form.Label className="fw-medium" style={{ fontSize: '0.8rem' }}>
                  Budget
                </Form.Label>
                <Form.Select
                  name="budget_id"
                  value={formData.budget_id || ''}
                  onChange={handleInputChange}
                  required
                  className="rounded-3 p-1"
                  style={{ borderColor: '#e0e6ed', fontSize: '0.8rem' }}
                >
                  <option value="">Select Budget</option>
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.category} (Remaining: ${(budget.allocated - budget.spent).toLocaleString()})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-2 pb-2">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(null)}
            className="rounded-3 px-2 py-1"
            style={{ borderColor: '#e0e6ed', color: '#4A6A88', fontSize: '0.8rem' }}
          >
            Close
          </Button>
          <Button
            onClick={() => handleCreate(formData.type === 'Expense' ? 'expenses' : 'earnings')}
            style={{
              background: 'linear-gradient(45deg, #007bff, #00aaff)',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '8px',
              fontWeight: '500',
              fontSize: '0.8rem',
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
}

export default Dashboard;