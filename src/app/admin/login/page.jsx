"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ShieldAlert, ShieldCheck, ArrowRight } from 'lucide-react';

export default function AdminLoginPage() {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      await adminLogin(email, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <ShieldAlert size={36} color="var(--secondary)" style={{ marginBottom: '0.5rem' }} />
          <h1 className="text-gradient-primary" style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>Enter administrative credentials to access the storefront control room</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-main)' }}>Admin Email</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="soeunsovannarith@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                style={{ paddingLeft: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.2)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--text-main)' }}>Secure Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ paddingLeft: '2.5rem', borderColor: 'rgba(6, 182, 212, 0.2)' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
            <ShieldCheck size={18} />
            <span>{loading ? 'Accessing Control Room...' : 'Authorize Login'}</span>
            <ArrowRight size={16} style={{ marginLeft: 'auto' }} />
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            Not an administrator? <Link href="/login" style={styles.link}>Return to Customer Shop</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6rem 1.5rem',
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '430px',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    boxShadow: '0 0 35px rgba(6, 182, 212, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '800',
    marginBottom: '0.5rem',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '0.9rem',
    color: 'var(--text-muted)',
  },
  submitBtn: {
    width: '100%',
    marginTop: '0.75rem',
    background: 'linear-gradient(135deg, var(--secondary) 0%, #0891b2 100%)',
    boxShadow: '0 4px 12px rgba(6, 182, 212, 0.3)',
    ':hover': {
      background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
      boxShadow: '0 4px 20px rgba(6, 182, 212, 0.5)',
    }
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '0.85rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
  },
  link: {
    color: 'var(--secondary)',
    fontWeight: 600,
  }
};
