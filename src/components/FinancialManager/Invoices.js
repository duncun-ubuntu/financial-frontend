// src/components/FinancialManager/Invoices.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal } from 'react-bootstrap';
import axios, { downloadFile } from '../../api/axiosInstance';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clientName, setClientName] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTin, setClientTin] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [date, setDate] = useState('');
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: '', unit_price: '', days: '' }]);
  const [vatRate, setVatRate] = useState('');
  const [includeDays, setIncludeDays] = useState(false);
  const [includeAgentFee, setIncludeAgentFee] = useState(false);
  const [agentFee, setAgentFee] = useState('');
  const [signatureChoice, setSignatureChoice] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(null);
  const [clientNames, setClientNames] = useState([]);
  const [selectedClientName, setSelectedClientName] = useState('');
  const [filteredClientNames, setFilteredClientNames] = useState([]);

  const billTypeOptions = [
    { value: '', label: 'Select Bill Type' },
    { value: 'Tax Invoice', label: 'Tax Invoice' },
    { value: 'Performance Invoice', label: 'Performance Invoice' },
    { value: 'Purchase Order', label: 'Purchase Order' },
  ];

  const signatureOptions = [
    { value: '', label: 'Select Signature' },
    { value: 'elisha', label: 'Elisha Signature' },
    { value: 'ginye', label: 'Ginye Signature' },
    { value: 'siza', label: 'Siza Signature' },
  ];

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/invoices/');
      setInvoices(response.data);
    } catch (err) {
      setError('Failed to fetch invoices.');
    }
  };

  const fetchClientNames = async () => {
    try {
      const response = await axios.get('/invoices/client_names/');
      setClientNames(response.data.client_names);
      setFilteredClientNames(response.data.client_names);
    } catch (err) {
      setError('Failed to fetch client names.');
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchClientNames();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: '', unit_price: '', days: '' }]);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const days = includeDays ? (parseInt(item.days) || 1) : 1;
      return sum + quantity * unitPrice * days;
    }, 0);
    const totalWithAgent = subtotal + (includeAgentFee ? (parseFloat(agentFee) || 0) : 0);
    const vatAmount = (totalWithAgent * (parseFloat(vatRate) || 0)) / 100;
    return totalWithAgent + vatAmount;
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const totalAmount = calculateTotal();

    if (!clientName.trim()) {
      setError('Client Name is required.');
      return;
    }
    if (!clientLocation.trim()) {
      setError('Client Location is required.');
      return;
    }
    if (!clientAddress.trim()) {
      setError('Client Address is required.');
      return;
    }
    if (!clientTin.trim()) {
      setError('Client TIN is required.');
      return;
    }
    if (!clientEmail.trim()) {
      setError('Client Email is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }
    if (!heading) {
      setError('Bill Type is required.');
      return;
    }
    if (!subtitle.trim()) {
      setError('Invoice Title is required.');
      return;
    }
    if (items.length === 0 || items.some(item => !item.description.trim())) {
      setError('At least one item with a description is required.');
      return;
    }
    if (items.some(item => !item.quantity || parseInt(item.quantity) <= 0)) {
      setError('All items must have a valid quantity greater than 0.');
      return;
    }
    if (items.some(item => !item.unit_price || parseFloat(item.unit_price) < 0)) {
      setError('All items must have a valid rate (non-negative).');
      return;
    }
    if (includeDays && items.some(item => !item.days || parseInt(item.days) <= 0)) {
      setError('All items must have a valid number of days greater than 0 when "Include Days" is checked.');
      return;
    }
    if (!vatRate || parseFloat(vatRate) < 0) {
      setError('VAT Rate must be a non-negative number.');
      return;
    }
    if (includeAgentFee && (!agentFee || parseFloat(agentFee) < 0)) {
      setError('Agent Fee must be a non-negative number when "Include Agent Fee" is checked.');
      return;
    }
    if (!signatureChoice) {
      setError('Please select a signature.');
      return;
    }

    const invoiceData = {
      client_name: clientName,
      client_location: clientLocation,
      client_address: clientAddress,
      client_tin: clientTin,
      client_email: clientEmail,
      date,
      heading,
      subtitle,
      items: items.map(item => {
        const formattedItem = {
          description: item.description,
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unit_price),
        };
        if (includeDays) {
          formattedItem.days = parseInt(item.days);
        }
        return formattedItem;
      }),
      vat_rate: parseFloat(vatRate),
      include_days: includeDays,
      include_agent_fee: includeAgentFee,
      agent_fee: includeAgentFee ? parseFloat(agentFee) : 0,
      total_amount: totalAmount,
      signature_choice: signatureChoice,
    };

    try {
      await axios.post('/invoices/', invoiceData);
      setClientName('');
      setClientLocation('');
      setClientAddress('');
      setClientTin('');
      setClientEmail('');
      setDate('');
      setHeading('');
      setSubtitle('');
      setItems([{ description: '', quantity: '', unit_price: '', days: '' }]);
      setVatRate('');
      setIncludeDays(false);
      setIncludeAgentFee(false);
      setAgentFee('');
      setSignatureChoice('');
      setError('');
      fetchInvoices();
      setShowModal(false);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Failed to create invoice.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/invoices/${id}/`);
      fetchInvoices();
    } catch (err) {
      setError('Failed to delete invoice.');
    }
  };

  const handleGeneratePDF = async (id) => {
    try {
      const response = await downloadFile(`/invoices/${id}/pdf/`);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to generate PDF.');
    }
  };

  const handleUserTypeSelection = (isNew) => {
    setIsNewUser(isNew);
    setShowUserModal(false);
    if (isNew) {
      setClientName('');
      setClientLocation('');
      setClientAddress('');
      setClientTin('');
      setClientEmail('');
      setSelectedClientName('');
      setShowModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleClientNameSearch = async (value) => {
    setSelectedClientName(value);
    if (value === '') {
      setFilteredClientNames(clientNames);
      setClientName('');
      setClientLocation('');
      setClientAddress('');
      setClientTin('');
      setClientEmail('');
      return;
    }
    const filtered = clientNames.filter(name =>
      name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClientNames(filtered);

    if (filtered.includes(value)) {
      try {
        const response = await axios.get(`/invoices/client_details/?name=${value}`);
        const client = response.data;
        setClientName(client.client_name);
        setClientLocation(client.client_location);
        setClientAddress(client.client_address);
        setClientTin(client.client_tin);
        setClientEmail(client.client_email);
      } catch (err) {
        setError('Failed to fetch client details.');
      }
    }
  };

  return (
    <Container>
      <h2 className="mb-4">Manage Invoices</h2>
      {error && <p className="text-danger">{error}</p>}
      <Button
        variant="primary"
        onClick={() => setShowUserModal(true)}
        className="mb-4"
      >
        Create Invoice
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Client Name</th>
            <th>Date</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.invoice_number}</td>
              <td>{invoice.client_name}</td>
              <td>{invoice.date}</td>
              <td>${parseFloat(invoice.total_amount).toFixed(2)}</td>
              <td>
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => handleGeneratePDF(invoice.id)}
                  className="me-2"
                >
                  Download PDF
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(invoice.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>User Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you a new user or an existing user?</p>
          <Button
            variant="primary"
            onClick={() => handleUserTypeSelection(true)}
            className="me-2"
          >
            New User
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleUserTypeSelection(false)}
          >
            Existing User
          </Button>
        </Modal.Body>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateInvoice}>
            {!isNewUser && (
              <Form.Group className="mb-3">
                <Form.Label>Select Client Name</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedClientName}
                  onChange={(e) => handleClientNameSearch(e.target.value)}
                  placeholder="Start typing to search..."
                  list="clientNames"
                />
                <datalist id="clientNames">
                  {filteredClientNames.map((name, idx) => (
                    <option key={idx} value={name} />
                  ))}
                </datalist>
              </Form.Group>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client Name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="Client Location"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Client Address"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client TIN</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientTin}
                    onChange={(e) => setClientTin(e.target.value)}
                    placeholder="Client TIN"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Client Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="Client Email"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Bill Type</Form.Label>
                  <Form.Select
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    required
                  >
                    {billTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Invoice Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="INVOICE TITLE"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Signature</Form.Label>
                  <Form.Select
                    value={signatureChoice}
                    onChange={(e) => setSignatureChoice(e.target.value)}
                    required
                  >
                    {signatureOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>VAT Rate (%)</Form.Label>
              <Form.Control
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="VAT Rate (%)"
                min="0"
                step="0.1"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Days?"
                checked={includeDays}
                onChange={(e) => setIncludeDays(e.target.checked)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Include Agent Fee?"
                checked={includeAgentFee}
                onChange={(e) => setIncludeAgentFee(e.target.checked)}
              />
            </Form.Group>
            {includeAgentFee && (
              <Form.Group className="mb-3">
                <Form.Label>Agent Fee (TZS)</Form.Label>
                <Form.Control
                  type="number"
                  value={agentFee}
                  onChange={(e) => setAgentFee(e.target.value)}
                  placeholder="Agent Fee (TZS)"
                  min="0"
                  step="0.01"
                  required
                />
              </Form.Group>
            )}
            <h5>Items</h5>
            {items.map((item, index) => (
              <Row key={index} className="mb-2">
                <Col md={includeDays ? 3 : 5}>
                  <Form.Control
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="QUANTITY"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    min="1"
                    required
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="RATE"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </Col>
                {includeDays && (
                  <Col md={2}>
                    <Form.Control
                      type="number"
                      placeholder="DAYS"
                      value={item.days}
                      onChange={(e) => handleItemChange(index, 'days', e.target.value)}
                      min="1"
                      required
                    />
                  </Col>
                )}
                <Col md={includeDays ? 2 : 2}>
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={handleAddItem} className="mb-3">
              Add Item
            </Button>
            <p>Total: ${calculateTotal().toFixed(2)}</p>
            <Button type="submit" variant="primary">
              Create Invoice
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Invoices;