// src/components/FinancialManager/Login.js
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  FaUser, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight,
  FaChartLine,
  FaShieldAlt,
  FaBolt
} from 'react-icons/fa';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 991);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 575);
  const [isExtraSmallMobile, setIsExtraSmallMobile] = useState(window.innerWidth <= 374);
  const navigate = useNavigate();

  // Prevent scroll on mobile
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, [isMobile]);

  // Handle window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowWidth(width);
      setWindowHeight(height);
      setIsMobile(width <= 767);
      setIsTablet(width <= 991);
      setIsSmallMobile(width <= 575);
      setIsExtraSmallMobile(width <= 374);
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate particles (fewer on mobile)
  useEffect(() => {
    const particleCount = isMobile ? 8 : 20;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (isMobile ? 2 : 4) + (isMobile ? 1 : 2),
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, [isMobile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password,
      });
      const { access, refresh } = response.data;
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      
      setTimeout(() => {
        navigate('/financial-manager');
      }, 800);
    } catch (err) {
      setIsLoading(false);
      setError('Invalid credentials. Please try again.');
    }
  };

  // Calculate responsive values
  const getResponsiveValue = (desktop, tablet, mobile, smallMobile, extraSmallMobile) => {
    if (isExtraSmallMobile && extraSmallMobile !== undefined) return extraSmallMobile;
    if (isSmallMobile && smallMobile !== undefined) return smallMobile;
    if (isMobile && mobile !== undefined) return mobile;
    if (isTablet && tablet !== undefined) return tablet;
    return desktop;
  };

  // Calculate mobile height - ensure it fits exactly
  const getMobileHeight = () => {
    if (isExtraSmallMobile) return '100svh'; // Use svh for mobile browsers
    if (isSmallMobile) return '100svh';
    if (isMobile) return '100svh';
    return '100vh';
  };

  const styles = {
    // Main container - FIXED: No scroll on mobile
    container: {
      display: 'flex',
      height: getMobileHeight(), // Use svh on mobile for better fit
      width: '100vw',
      position: 'fixed', // Changed from relative to fixed
      top: 0,
      left: 0,
      overflow: 'hidden', // Prevent any overflow
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      flexDirection: getResponsiveValue('row', 'row', 'column', 'column', 'column'),
      touchAction: 'none', // Prevent pull-to-refresh on mobile
      WebkitOverflowScrolling: 'touch',
    },

    // Particles - minimal on mobile
    particlesContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
      display: isSmallMobile ? 'none' : 'block',
    },

    // Left side - FIXED: Exact height calculation
    leftSide: {
      flex: isMobile ? '0 0 auto' : 1, // Don't grow on mobile
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: getResponsiveValue('2rem', '1.5rem', '1rem', '0.75rem', '0.5rem'),
      zIndex: 2,
      overflow: 'hidden',
      height: isMobile ? '35%' : '100%', // Fixed percentage on mobile
      minHeight: isMobile ? '35%' : 'auto', // Prevent growing
    },

    // Right side - FIXED: Exact height calculation
    rightSide: {
      flex: isMobile ? '1' : 1, // Take remaining space on mobile
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      padding: getResponsiveValue('2rem', '1.5rem', '0.75rem', '0.5rem', '0.25rem'),
      background: '#ffffff',
      position: 'relative',
      zIndex: 2,
      height: isMobile ? '65%' : '100%', // Fixed percentage on mobile
      overflowY: isMobile ? 'auto' : 'visible', // Allow scroll only inside form if needed
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
    },

    // Image container
    imageContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -1,
    },

    // Branding container - FIXED: Remove margin/padding that causes overflow
    branding: {
      position: 'relative',
      zIndex: 2,
      color: 'white',
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: isMobile ? 'center' : 'space-between',
      padding: isMobile ? '0' : '1rem 0',
    },

    // Brand title - FIXED: Smaller on mobile
    brandTitle: {
      fontSize: getResponsiveValue('2.5rem', '2rem', '1.5rem', '1.25rem', '1rem'),
      fontWeight: 800,
      marginBottom: getResponsiveValue('0.75rem', '0.5rem', '0.25rem', '0.25rem', '0.125rem'),
      display: 'flex',
      alignItems: 'center',
      gap: getResponsiveValue('1rem', '0.75rem', '0.5rem', '0.25rem', '0.125rem'),
      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      flexDirection: isMobile ? 'column' : 'row',
      textAlign: 'center',
      lineHeight: 1.2,
    },

    brandIcon: {
      fontSize: getResponsiveValue('3rem', '2.5rem', '2rem', '1.5rem', '1.25rem'),
      marginBottom: isMobile ? '0.25rem' : '0',
    },

    brandSubtitle: {
      fontSize: getResponsiveValue('1rem', '0.9rem', '0.8rem', '0.7rem', '0.65rem'),
      opacity: 0.95,
      marginBottom: getResponsiveValue('1.5rem', '1rem', '0.75rem', '0.5rem', '0.25rem'),
      fontWeight: 300,
      lineHeight: 1.4,
      textAlign: 'center',
      padding: isMobile ? '0 0.5rem' : '0',
    },

    // Features - Hidden on mobile to save space
    featuresContainer: {
      display: isMobile ? 'none' : 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '1.5rem',
    },

    // Stats - Much smaller on mobile
    statsContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: getResponsiveValue('1rem', '0.75rem', '0.5rem', '0.25rem', '0.125rem'),
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(5px)',
      borderRadius: '8px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      flexDirection: isSmallMobile ? 'column' : 'row',
      gap: isSmallMobile ? '0.5rem' : '0',
      marginTop: isMobile ? 'auto' : '0', // Push to bottom on mobile
    },

    statItem: {
      textAlign: 'center',
      flex: isSmallMobile ? '0 0 auto' : 1,
    },

    statValue: {
      fontSize: getResponsiveValue('1.5rem', '1.25rem', '1rem', '0.875rem', '0.75rem'),
      fontWeight: 700,
      marginBottom: '0.25rem',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      lineHeight: 1,
    },

    statDivider: {
      width: isSmallMobile ? '0' : '1px',
      height: isSmallMobile ? '0' : '20px',
      background: 'rgba(255, 255, 255, 0.3)',
    },

    // Form container - FIXED: Fit exactly
    formContainer: {
      width: '100%',
      height: isMobile ? '100%' : 'auto',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '540px',
      margin: '0 auto',
    },

    // Form wrapper - FIXED: No overflow
    formWrapper: {
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRadius: getResponsiveValue('20px', '16px', '12px', '10px', '8px'),
      padding: getResponsiveValue(
        '2rem', 
        '1.5rem', 
        '1rem', 
        '0.75rem', 
        '0.5rem'
      ),
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(102, 126, 234, 0.1)',
      border: '1px solid rgba(102, 126, 234, 0.1)',
      width: '100%',
      height: isMobile ? 'auto' : 'auto',
      margin: isMobile ? 'auto 0' : '0',
      overflow: 'visible',
    },

    // Form header - FIXED: Smaller
    header: {
      textAlign: 'center',
      marginBottom: getResponsiveValue('1.5rem', '1.25rem', '1rem', '0.75rem', '0.5rem'),
    },

    headerTitle: {
      fontSize: getResponsiveValue('1.75rem', '1.5rem', '1.25rem', '1.125rem', '1rem'),
      fontWeight: 700,
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },

    headerSubtitle: {
      color: '#64748b',
      fontSize: getResponsiveValue('0.9rem', '0.85rem', '0.75rem', '0.7rem', '0.65rem'),
      margin: 0,
      lineHeight: 1.4,
    },

    // Form - FIXED: Compact on mobile
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: getResponsiveValue('1rem', '0.875rem', '0.75rem', '0.625rem', '0.5rem'),
    },

    // Input wrapper
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.25rem',
    },

    inputIcon: {
      position: 'absolute',
      left: getResponsiveValue('1rem', '0.875rem', '0.75rem', '0.625rem', '0.5rem'),
      color: '#64748b',
      fontSize: getResponsiveValue('1rem', '0.875rem', '0.75rem', '0.675rem', '0.6rem'),
      zIndex: 2,
      pointerEvents: 'none',
    },

    input: {
      width: '100%',
      padding: getResponsiveValue(
        '0.875rem 1rem 0.875rem 3rem',
        '0.75rem 0.875rem 0.75rem 2.5rem',
        '0.675rem 0.75rem 0.675rem 2.25rem',
        '0.6rem 0.675rem 0.6rem 2rem',
        '0.5rem 0.6rem 0.5rem 1.75rem'
      ),
      border: '1.5px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: getResponsiveValue('1rem', '0.9375rem', '16px', '16px', '16px'),
      background: '#f8fafc',
      color: '#1e293b',
      fontWeight: 400,
      lineHeight: 1.5,
    },

    passwordToggle: {
      position: 'absolute',
      right: getResponsiveValue('0.75rem', '0.675rem', '0.6rem', '0.5rem', '0.4rem'),
      background: 'transparent',
      border: 'none',
      color: '#64748b',
      fontSize: getResponsiveValue('1rem', '0.875rem', '0.75rem', '0.675rem', '0.6rem'),
      cursor: 'pointer',
      padding: '0.25rem',
      zIndex: 2,
    },

    // Options - FIXED: Compact
    options: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '0.5rem 0',
      flexDirection: isSmallMobile ? 'column' : 'row',
      gap: isSmallMobile ? '0.5rem' : '0',
      alignItems: isSmallMobile ? 'flex-start' : 'center',
    },

    // Button - FIXED: Smaller but still tappable
    button: {
      width: '100%',
      padding: getResponsiveValue(
        '0.875rem 1rem',
        '0.75rem 0.875rem',
        '0.675rem 0.75rem',
        '0.6rem 0.675rem',
        '0.5rem 0.6rem'
      ),
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      fontWeight: 600,
      fontSize: getResponsiveValue('1rem', '0.9375rem', '0.875rem', '0.8125rem', '0.75rem'),
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '0.5rem',
      minHeight: getResponsiveValue('48px', '44px', '40px', '36px', '32px'),
    },

    // Social login - Hidden on very small screens
    socialLogin: {
      display: isExtraSmallMobile ? 'none' : 'flex',
      gap: '0.5rem',
      marginTop: '1rem',
      flexDirection: isSmallMobile ? 'column' : 'row',
    },

    socialButton: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      border: '1px solid #e2e8f0',
      borderRadius: '6px',
      background: 'white',
      color: '#1e293b',
      fontWeight: 500,
      fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
      cursor: 'pointer',
      minHeight: '36px',
    },

    // Footer - Smaller
    footer: {
      textAlign: 'center',
      marginTop: '1rem',
      paddingTop: '0.5rem',
      borderTop: '1px solid #e2e8f0',
    },

    // Label styles
    label: {
      fontWeight: 600,
      color: '#1e293b',
      marginBottom: '0.375rem',
      fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
      display: 'block',
    },
  };

  const features = [
    {
      icon: FaChartLine,
      title: 'Analytics',
      description: 'Real-time insights'
    },
    {
      icon: FaShieldAlt,
      title: 'Secure',
      description: 'Bank-level security'
    },
    {
      icon: FaBolt,
      title: 'Fast',
      description: 'Lightning speed'
    }
  ];

  // Handle hover effects
  const [hoveredButton, setHoveredButton] = useState(false);
  const [hoveredPasswordToggle, setHoveredPasswordToggle] = useState(false);

  return (
    <div style={styles.container}>
      {/* Animated Background Particles */}
      <div style={styles.particlesContainer}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            style={{
              position: 'absolute',
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              filter: 'blur(0.5px)',
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Left Side - Image & Branding */}
      <motion.div 
        style={styles.leftSide}
        initial={{ y: isMobile ? -50 : 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div style={styles.imageContainer}>
          <img 
            src="/image44.jpeg" 
            alt="Financial Manager" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.7) contrast(1.1)',
            }}
          />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.9) 100%)',
            mixBlendMode: 'multiply',
          }}></div>
        </div>
        
        <div style={styles.branding}>
          <div>
            <motion.h1
              style={styles.brandTitle}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <span style={styles.brandIcon}>💰</span>
              FinanceHub
            </motion.h1>
            <motion.p
              style={styles.brandSubtitle}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Manage your finances with intelligence
            </motion.p>
          </div>

          {/* Stats - Only show on mobile, hidden features */}
          <motion.div 
            style={styles.statsContainer}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div style={styles.statItem}>
              <h3 style={styles.statValue}>10K+</h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: getResponsiveValue('0.75rem', '0.7rem', '0.65rem', '0.6rem', '0.55rem'),
                lineHeight: 1
              }}>Users</p>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <h3 style={styles.statValue}>$2M+</h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: getResponsiveValue('0.75rem', '0.7rem', '0.65rem', '0.6rem', '0.55rem'),
                lineHeight: 1
              }}>Managed</p>
            </div>
            <div style={styles.statDivider}></div>
            <div style={styles.statItem}>
              <h3 style={styles.statValue}>99.9%</h3>
              <p style={{ 
                margin: 0, 
                opacity: 0.9, 
                fontSize: getResponsiveValue('0.75rem', '0.7rem', '0.65rem', '0.6rem', '0.55rem'),
                lineHeight: 1
              }}>Uptime</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        style={styles.rightSide}
        initial={{ y: isMobile ? 50 : 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
      >
        <div style={styles.formContainer}>
          <motion.div
            style={styles.formWrapper}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Form Header */}
            <div style={styles.header}>
              <motion.h2
                style={styles.headerTitle}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                Welcome Back
              </motion.h2>
              <motion.p
                style={styles.headerSubtitle}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                Sign in to your account
              </motion.p>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Alert variant="danger" style={{
                    borderRadius: '6px',
                    border: 'none',
                    marginBottom: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FaShieldAlt style={{ 
                        fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
                        flexShrink: 0 
                      }} />
                      <span>{error}</span>
                    </div>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <Form onSubmit={handleSubmit} style={styles.form}>
              {/* Username Input */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                <Form.Group style={{ marginBottom: 0 }}>
                  <Form.Label style={styles.label}>Username</Form.Label>
                  <div style={styles.inputWrapper}>
                    <FaUser style={{
                      ...styles.inputIcon,
                      color: username ? '#667eea' : '#64748b',
                    }} />
                    <Form.Control
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      style={styles.input}
                      placeholder="Enter username"
                      disabled={isLoading}
                    />
                  </div>
                </Form.Group>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Form.Group style={{ marginBottom: 0 }}>
                  <Form.Label style={styles.label}>Password</Form.Label>
                  <div style={styles.inputWrapper}>
                    <FaLock style={{
                      ...styles.inputIcon,
                      color: password ? '#667eea' : '#64748b',
                    }} />
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={styles.input}
                      placeholder="Enter password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      style={{
                        ...styles.passwordToggle,
                        color: hoveredPasswordToggle ? '#667eea' : '#64748b',
                      }}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                      onMouseEnter={() => setHoveredPasswordToggle(true)}
                      onMouseLeave={() => setHoveredPasswordToggle(false)}
                      onTouchStart={() => setHoveredPasswordToggle(true)}
                      onTouchEnd={() => setHoveredPasswordToggle(false)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </Form.Group>
              </motion.div>

              {/* Options */}
              <div style={styles.options}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
                  color: '#1e293b',
                }}>
                  <input
                    type="checkbox"
                    style={{
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      margin: 0,
                    }}
                  />
                  <span>Remember me</span>
                </div>
                <a href="#" style={{
                  color: '#667eea',
                  textDecoration: 'none',
                  fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
                  fontWeight: 500,
                }}>
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <Button
                  type="submit"
                  style={{
                    ...styles.button,
                    opacity: isLoading ? 0.7 : hoveredButton ? 0.95 : 1,
                    transform: hoveredButton ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: hoveredButton 
                      ? '0 4px 12px rgba(102, 126, 234, 0.3)'
                      : '0 2px 6px rgba(102, 126, 234, 0.2)',
                  }}
                  disabled={isLoading}
                  onMouseEnter={() => setHoveredButton(true)}
                  onMouseLeave={() => setHoveredButton(false)}
                  onTouchStart={() => setHoveredButton(true)}
                  onTouchEnd={() => setHoveredButton(false)}
                >
                  {isLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite',
                      }}></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <FaArrowRight style={{
                        fontSize: getResponsiveValue('0.875rem', '0.8125rem', '0.75rem', '0.7rem', '0.65rem'),
                      }} />
                    </>
                  )}
                </Button>
              </motion.div>




            </Form>
          </motion.div>
        </div>
      </motion.div>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          /* Prevent zoom on iOS input focus */
          @media screen and (max-width: 767px) {
            input, textarea, select {
              font-size: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;