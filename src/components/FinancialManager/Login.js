// src/components/FinancialManager/Login.js
import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      navigate('/financial-manager');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg border-0 rounded-3">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-primary">Welcome Back</h2>
                  <p className="text-muted">Sign in to your Financial Manager</p>
                </div>
                {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="username" className="mb-4">
                    <Form.Label className="fw-medium">Username</Form.Label>
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="rounded-3 p-3 shadow-sm"
                      placeholder="Enter your username"
                    />
                  </Form.Group>
                  <Form.Group controlId="password" className="mb-4">
                    <Form.Label className="fw-medium">Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="rounded-3 p-3 shadow-sm"
                      placeholder="Enter your password"
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 rounded-3 py-3 fw-medium mt-3 shadow"
                    style={{ backgroundColor: '#007bff', borderColor: '#007bff', transition: 'all 0.3s ease' }}
                  >
                    Sign In
                  </Button>
                </Form>
                <div className="text-center mt-4">
                  <p className="text-muted small">
                    Don't have an account?{' '}
                    <a href="#" className="text-primary text-decoration-none fw-medium">
                      Sign up
                    </a>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;