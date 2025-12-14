// src/components/FinancialManager/ChartCard.js
import React from 'react';
import { Card } from 'react-bootstrap';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function ChartCard({ title, type, data }) {
  const chartComponents = {
    line: Line,
    pie: Pie,
    bar: Bar,
  };
  const ChartComponent = chartComponents[type];

  return (
    <motion.div
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
      className="custom-card shadow-lg"
    >
      <Card.Body className="p-4">
        <h5 className="card-title mb-3 fw-bold text-dark">{title}</h5>
        <ChartComponent data={data} options={{ maintainAspectRatio: false }} height={300} />
      </Card.Body>
    </motion.div>
  );
}

export default ChartCard;