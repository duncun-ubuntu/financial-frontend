import React, { useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axiosInstance from '../../api/axiosInstance';

function TransactionTable({ transactions, onEdit }) {
  const [editTransaction, setEditTransaction] = useState(null);

  const handleEdit = (txn) => {
    setEditTransaction(txn);
    onEdit(txn);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axiosInstance.delete(`transactions/${id}/`);
        window.location.reload(); // Consider a more sophisticated state update instead of reload
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  return (
    <div className="card shadow-sm">
      <div className="card-body p-3">
        <h5 className="card-title mb-3">Recent Transactions</h5>
        <Table responsive hover>
          <thead>
            <tr>
              <th>Date</th>
              {/* Removed Description Header */}
              {/* <th>Description</th> */}
              <th>Category</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.date}</td>
                {/* Removed Description Data Cell */}
                {/* <td>{txn.description}</td> */}
                <td>{txn.category}</td>
                <td className={txn.amount >= 0 ? 'text-success' : 'text-danger'}>
                  {txn.amount >= 0 ? '+' : ''}${Math.abs(parseFloat(txn.amount)).toLocaleString()}
                </td>
                <td>{txn.type}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(txn)}
                    className="me-2"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(txn.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

export default TransactionTable;