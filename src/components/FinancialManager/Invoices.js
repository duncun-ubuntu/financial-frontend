// src/components/FinancialManager/Invoices.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Table, Modal, ProgressBar, Card, Badge, Pagination, InputGroup } from 'react-bootstrap';
import { FaUser, FaFileInvoice, FaListUl, FaCog, FaCheck, FaArrowRight, FaArrowLeft, FaSearch } from 'react-icons/fa';
import axios, { downloadFile } from '../../api/axiosInstance';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [clientName, setClientName] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientTin, setClientTin] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [date, setDate] = useState('');
  const [heading, setHeading] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [items, setItems] = useState([{ description: '', quantity: '', unit_price: '', days: '' }]);
  const [vatRate, setVatRate] = useState('0');
  const [includeVat, setIncludeVat] = useState(false);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const steps = [
    { title: 'Client Info', icon: FaUser },
    { title: 'Invoice Details', icon: FaFileInvoice },
    { title: 'Items', icon: FaListUl },
    { title: 'Options', icon: FaCog },
    { title: 'Review', icon: FaCheck },
  ];

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('/invoices/');
      // Sort invoices by date/id in descending order (latest first)
      const sortedInvoices = response.data.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA || b.id - a.id;
      });
      setInvoices(sortedInvoices);
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

  // Handle VAT checkbox change
  const handleVatChange = (checked) => {
    setIncludeVat(checked);
    setVatRate(checked ? '18' : '0');
  };

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  const validateStep = (step) => {
    setError('');
    switch (step) {
      case 0: // Client Info
        if (!clientName.trim()) {
          setError('Client Name is required.');
          return false;
        }
        if (!clientLocation.trim()) {
          setError('Client Location is required.');
          return false;
        }
        if (!clientAddress.trim()) {
          setError('Client Address is required.');
          return false;
        }
        if (!clientTin.trim()) {
          setError('Client TIN is required.');
          return false;
        }
        if (!clientEmail.trim()) {
          setError('Client Email is required.');
          return false;
        }
        return true;
      case 1: // Invoice Details
        if (!date) {
          setError('Date is required.');
          return false;
        }
        if (!heading) {
          setError('Bill Type is required.');
          return false;
        }
        if (!subtitle.trim()) {
          setError('Invoice Title is required.');
          return false;
        }
        if (!signatureChoice) {
          setError('Please select a signature.');
          return false;
        }
        return true;
      case 2: // Items
        if (items.length === 0 || items.some(item => !item.description.trim())) {
          setError('At least one item with a description is required.');
          return false;
        }
        if (items.some(item => !item.quantity || parseInt(item.quantity) <= 0)) {
          setError('All items must have a valid quantity greater than 0.');
          return false;
        }
        if (items.some(item => !item.unit_price || parseFloat(item.unit_price) < 0)) {
          setError('All items must have a valid rate (non-negative).');
          return false;
        }
        if (includeDays && items.some(item => !item.days || parseInt(item.days) <= 0)) {
          setError('All items must have a valid number of days greater than 0.');
          return false;
        }
        return true;
      case 3: // Options - VAT is now handled by checkbox
        if (includeAgentFee && (!agentFee || parseFloat(agentFee) < 0)) {
          setError('Agent Fee must be a non-negative number.');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setError('');
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    const totalAmount = calculateTotal();

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
      resetForm();
      fetchInvoices();
      setShowModal(false);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Failed to create invoice.');
    }
  };

  const resetForm = () => {
    setClientName('');
    setClientLocation('');
    setClientAddress('');
    setClientTin('');
    setClientEmail('');
    setDate('');
    setHeading('');
    setSubtitle('');
    setItems([{ description: '', quantity: '', unit_price: '', days: '' }]);
    setVatRate('0');
    setIncludeVat(false);
    setIncludeDays(false);
    setIncludeAgentFee(false);
    setAgentFee('');
    setSignatureChoice('');
    setError('');
    setCurrentStep(0);
    setSelectedClientName('');
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
      resetForm();
    }
    setShowModal(true);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Client Info
        return (
          <div className="step-content">
            {!isNewUser && (
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Search Existing Client</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedClientName}
                  onChange={(e) => handleClientNameSearch(e.target.value)}
                  placeholder="Start typing to search..."
                  list="clientNames"
                  className="modern-input"
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
                  <Form.Label className="fw-bold">Client Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter client name"
                    className="modern-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Client Location</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    placeholder="Enter location"
                    className="modern-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Client Address</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Enter address"
                    className="modern-input"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Client TIN</Form.Label>
                  <Form.Control
                    type="text"
                    value={clientTin}
                    onChange={(e) => setClientTin(e.target.value)}
                    placeholder="Enter TIN"
                    className="modern-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Client Email</Form.Label>
              <Form.Control
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="Enter email address"
                className="modern-input"
              />
            </Form.Group>
          </div>
        );

      case 1: // Invoice Details
        return (
          <div className="step-content">
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Bill Type</Form.Label>
                  <Form.Select
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    className="modern-select"
                  >
                    {billTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="modern-input"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Invoice Title</Form.Label>
              <Form.Control
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Enter invoice title"
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Signature</Form.Label>
              <Form.Select
                value={signatureChoice}
                onChange={(e) => setSignatureChoice(e.target.value)}
                className="modern-select"
              >
                {signatureOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        );

      case 2: // Items
        return (
          <div className="step-content">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Invoice Items</h5>
              <Button variant="primary" onClick={handleAddItem} className="modern-btn-secondary">
                + Add Item
              </Button>
            </div>
            {items.map((item, index) => (
              <Card key={index} className="mb-3 item-card">
                <Card.Body>
                  <Row>
                    <Col md={includeDays ? 3 : 4}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">Description</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="modern-input-sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={includeDays ? 2 : 3}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">Quantity</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          className="modern-input-sm"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={includeDays ? 2 : 3}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">Rate</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0.00"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                          min="0"
                          step="0.01"
                          className="modern-input-sm"
                        />
                      </Form.Group>
                    </Col>
                    {includeDays && (
                      <Col md={2}>
                        <Form.Group className="mb-2">
                          <Form.Label className="small fw-bold">Days</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="1"
                            value={item.days}
                            onChange={(e) => handleItemChange(index, 'days', e.target.value)}
                            min="1"
                            className="modern-input-sm"
                          />
                        </Form.Group>
                      </Col>
                    )}
                    <Col md={includeDays ? 3 : 2} className="d-flex align-items-end">
                      <Button
                        variant="outline-danger"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="w-100 modern-btn-danger"
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            ))}
          </div>
        );

      case 3: // Options
        return (
          <div className="step-content">
            <Card className="mb-3 option-card">
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="include-vat"
                  label={`Include VAT (${includeVat ? '18%' : '0%'})`}
                  checked={includeVat}
                  onChange={(e) => handleVatChange(e.target.checked)}
                  className="modern-switch"
                />
                <small className="text-muted">
                  {includeVat ? 'VAT is set to 18%' : 'No VAT will be applied'}
                </small>
              </Card.Body>
            </Card>
            <Card className="mb-3 option-card">
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="include-days"
                  label="Include Days in Calculation"
                  checked={includeDays}
                  onChange={(e) => setIncludeDays(e.target.checked)}
                  className="modern-switch"
                />
                <small className="text-muted">Enable if you want to multiply items by number of days</small>
              </Card.Body>
            </Card>
            <Card className="option-card">
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="include-agent"
                  label="Include Agent Fee"
                  checked={includeAgentFee}
                  onChange={(e) => setIncludeAgentFee(e.target.checked)}
                  className="modern-switch mb-2"
                />
                {includeAgentFee && (
                  <Form.Group className="mt-3">
                    <Form.Label className="fw-bold">Agent Fee (TZS)</Form.Label>
                    <Form.Control
                      type="number"
                      value={agentFee}
                      onChange={(e) => setAgentFee(e.target.value)}
                      placeholder="Enter agent fee"
                      min="0"
                      step="0.01"
                      className="modern-input"
                    />
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
          </div>
        );

      case 4: // Review
        const subtotal = items.reduce((sum, item) => {
          const quantity = parseInt(item.quantity) || 0;
          const unitPrice = parseFloat(item.unit_price) || 0;
          const days = includeDays ? (parseInt(item.days) || 1) : 1;
          return sum + quantity * unitPrice * days;
        }, 0);
        const agentFeeAmount = includeAgentFee ? (parseFloat(agentFee) || 0) : 0;
        const totalBeforeVat = subtotal + agentFeeAmount;
        const vatAmount = (totalBeforeVat * (parseFloat(vatRate) || 0)) / 100;
        const grandTotal = totalBeforeVat + vatAmount;

        return (
          <div className="step-content review-section">
            <h5 className="mb-4">Review Your Invoice</h5>
            
            <Card className="mb-3 review-card">
              <Card.Header className="bg-primary text-white">
                <strong>Client Information</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Name:</strong> {clientName}</p>
                    <p><strong>Location:</strong> {clientLocation}</p>
                    <p><strong>Address:</strong> {clientAddress}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>TIN:</strong> {clientTin}</p>
                    <p><strong>Email:</strong> {clientEmail}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3 review-card">
              <Card.Header className="bg-success text-white">
                <strong>Invoice Details</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p><strong>Type:</strong> {heading}</p>
                    <p><strong>Title:</strong> {subtitle}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Signature:</strong> {signatureChoice}</p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-3 review-card">
              <Card.Header className="bg-info text-white">
                <strong>Items ({items.length})</strong>
              </Card.Header>
              <Card.Body>
                {items.map((item, idx) => (
                  <div key={idx} className="mb-2 pb-2 border-bottom">
                    <p className="mb-1"><strong>{item.description}</strong></p>
                    <small className="text-muted">
                      Qty: {item.quantity} × Rate: ${parseFloat(item.unit_price).toFixed(2)}
                      {includeDays && ` × Days: ${item.days}`}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </Card>

            <Card className="summary-card">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal:</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                {includeAgentFee && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Agent Fee:</span>
                    <strong>${agentFeeAmount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-2">
                  <span>VAT ({vatRate}%):</span>
                  <strong>${vatAmount.toFixed(2)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <h5>Grand Total:</h5>
                  <h5 className="text-primary">${grandTotal.toFixed(2)}</h5>
                </div>
              </Card.Body>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // Render pagination component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container d-flex justify-content-center align-items-center my-4">
        <Pagination className="modern-pagination mb-0">
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {startPage > 1 && (
            <>
              <Pagination.Item onClick={() => handlePageChange(1)}>1</Pagination.Item>
              {startPage > 2 && <Pagination.Ellipsis disabled />}
            </>
          )}

          {pageNumbers.map(number => (
            <Pagination.Item
              key={number}
              active={number === currentPage}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </Pagination.Item>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <Pagination.Ellipsis disabled />}
              <Pagination.Item onClick={() => handlePageChange(totalPages)}>{totalPages}</Pagination.Item>
            </>
          )}

          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container fluid className="invoice-container">
      <div className="invoice-header">
        <h2>Invoice Management</h2>
        <Button
          variant="primary"
          onClick={() => setShowUserModal(true)}
          className="modern-btn-primary"
        >
          + Create New Invoice
        </Button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Search Bar */}
      <Card className="search-card mb-4">
        <Card.Body>
          <InputGroup className="search-input-group">
            <InputGroup.Text className="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search by client name, invoice number, or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="modern-search-input"
            />
            {searchQuery && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
              >
                Clear
              </Button>
            )}
          </InputGroup>
          <small className="text-muted mt-2 d-block">
            Showing {currentInvoices.length} of {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </small>
        </Card.Body>
      </Card>

      {/* Desktop Table View */}
      <Card className="invoice-table-card d-none d-md-block">
        <Card.Body>
          <Table responsive hover className="modern-table">
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
              {currentInvoices.length > 0 ? (
                currentInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><Badge bg="secondary">{invoice.invoice_number}</Badge></td>
                    <td>{invoice.client_name}</td>
                    <td>{invoice.date}</td>
                    <td><strong>${parseFloat(invoice.total_amount).toFixed(2)}</strong></td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleGeneratePDF(invoice.id)}
                        className="me-2"
                      >
                        Download PDF
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(invoice.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    {searchQuery ? 'No invoices found matching your search.' : 'No invoices available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Mobile Card View */}
      <div className="invoice-mobile-cards d-md-none">
        {currentInvoices.length > 0 ? (
          currentInvoices.map((invoice) => (
            <Card key={invoice.id} className="invoice-mobile-card mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Badge bg="secondary" className="mb-2">{invoice.invoice_number}</Badge>
                    <h6 className="mb-1">{invoice.client_name}</h6>
                    <small className="text-muted">{invoice.date}</small>
                  </div>
                  <div className="text-end">
                    <div className="invoice-amount">${parseFloat(invoice.total_amount).toFixed(2)}</div>
                  </div>
                </div>
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleGeneratePDF(invoice.id)}
                  >
                    📄 Download PDF
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(invoice.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))
        ) : (
          <Card className="text-center py-5">
            <Card.Body>
              <p className="text-muted">
                {searchQuery ? 'No invoices found matching your search.' : 'No invoices available.'}
              </p>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {renderPagination()}

      {/* User Type Selection Modal */}
      <Modal 
        show={showUserModal} 
        onHide={() => setShowUserModal(false)}
        centered
        className="user-type-modal"
      >
        <Modal.Body className="text-center p-5">
          <h4 className="mb-4">Select User Type</h4>
          <p className="text-muted mb-4">Are you creating an invoice for a new or existing client?</p>
          <div className="d-grid gap-3">
            <Button
              variant="outline-primary"
              onClick={() => handleUserTypeSelection(true)}
              className="py-3 modern-btn-outline"
            >
              <FaUser className="me-2" />
              New Client
            </Button>
            <Button
              variant="primary"
              onClick={() => handleUserTypeSelection(false)}
              className="py-3 modern-btn-primary"
            >
              <FaFileInvoice className="me-2" />
              Existing Client
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Multi-Step Invoice Creation Modal */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          resetForm();
        }} 
        size="lg"
        className="invoice-wizard-modal"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title>Create Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {/* Progress Steps */}
          <div className="wizard-steps mb-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div 
                  key={index} 
                  className={`wizard-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-icon">
                    {isCompleted ? <FaCheck /> : <Icon />}
                  </div>
                  <div className="step-title">{step.title}</div>
                  {index < steps.length - 1 && <div className="step-connector" />}
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <ProgressBar 
            now={(currentStep / (steps.length - 1)) * 100} 
            className="mb-4 modern-progress"
            style={{ height: '8px' }}
          />

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="wizard-content">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="wizard-navigation mt-4 pt-3 border-top">
            <div className="d-flex justify-content-between">
              <Button
                variant="outline-secondary"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="modern-btn-outline"
              >
                <FaArrowLeft className="me-2" />
                Previous
              </Button>
              
              {currentStep < steps.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  className="modern-btn-primary"
                >
                  Next
                  <FaArrowRight className="ms-2" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={handleCreateInvoice}
                  className="modern-btn-success"
                >
                  <FaCheck className="me-2" />
                  Create Invoice
                </Button>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Invoices;