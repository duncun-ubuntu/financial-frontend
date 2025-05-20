// src/components/FinancialManager/Profile.js
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    profile_picture: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    date_of_birth: '',
    language: '',
    theme: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('profile/');
      setProfile(response.data);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('profile/', formData);
      setProfile(formData);
      setEditMode(false);
      setSuccess('Profile updated successfully!');
      setError('');
    } catch (err) {
      setError('Error updating profile. Please try again.');
      setSuccess('');
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="mb-4 text-center">User Profile</h2>
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              {!editMode ? (
                <>
                  <div className="text-center mb-4">
                    <img
                      src={profile.profile_picture || 'https://via.placeholder.com/150'}
                      alt="Profile"
                      className="rounded-circle mb-3"
                      style={{ width: '150px', height: '150px' }}
                    />
                    <h4>{profile.name}</h4>
                    <p className="text-muted">{profile.email}</p>
                  </div>
                  <div className="mb-3">
                    <p><strong>Phone:</strong> {profile.phone}</p>
                    <p><strong>Address:</strong> {profile.address || 'N/A'}</p>
                    <p><strong>Date of Birth:</strong> {profile.date_of_birth || 'N/A'}</p>
                    <p><strong>Account Created:</strong> {profile.account_created}</p>
                    <p><strong>Language:</strong> {profile.language}</p>
                    <p><strong>Theme:</strong> {profile.theme}</p>
                  </div>
                  <div className="text-center">
                    <Button variant="primary" onClick={() => setEditMode(true)}>
                      Edit Profile
                    </Button>
                  </div>
                </>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="profile_picture" className="mb-3">
                    <Form.Label>Profile Picture URL</Form.Label>
                    <Form.Control
                      type="text"
                      name="profile_picture"
                      value={formData.profile_picture}
                      onChange={handleInputChange}
                      placeholder="Enter image URL"
                    />
                  </Form.Group>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="phone" className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="date_of_birth" className="mb-3">
                    <Form.Label>Date of Birth</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="language" className="mb-3">
                    <Form.Label>Language</Form.Label>
                    <Form.Select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="theme" className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      name="theme"
                      value={formData.theme}
                      onChange={handleInputChange}
                    >
                      <option value="Light">Light</option>
                      <option value="Dark">Dark</option>
                    </Form.Select>
                  </Form.Group>
                  <div className="text-center">
                    <Button variant="secondary" onClick={() => setEditMode(false)} className="me-2">
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
}

export default Profile;