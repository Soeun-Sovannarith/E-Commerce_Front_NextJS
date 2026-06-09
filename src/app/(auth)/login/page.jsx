"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, LogIn, Smartphone, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { userLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await userLogin(email, password);
    if (res && !res.success) {
      setError(res.message || 'Login failed. Please check credentials or email verification status.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <Smartphone size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <h1 className="text-gradient-primary" style={styles.title}>Sign In</h1>
          <p style={styles.subtitle}>Log in to manage your basket, check orders, and write reviews</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="soeunsovannarith@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={styles.passwordHeader}>
              <label className="form-label">Password</label>
              <Link href="/forgot-password" style={styles.forgotLink}>Forgot?</Link>
            </div>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            <LogIn size={16} />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            New to PhoneStore? <Link href="/register" style={styles.link}>Create Account</Link>
          </p>
          <div style={styles.adminSwitch}>
            <Link href="/admin/login" style={styles.adminLink}>
              <ShieldCheck size={14} />
              <span>Sign in as Administrator</span>
            </Link>
          </div>
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
    padding: '4.5rem 1.5rem',
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    borderRadius: 'var(--radius-lg)',
    padding: '2.5rem',
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
    fontWeight: '700',
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
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: '0.8rem',
    color: 'var(--primary)',
    fontWeight: 500,
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
    fontSize: '0.9rem',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '1.25rem',
  },
  link: {
    color: 'var(--primary)',
    fontWeight: 600,
  },
  adminSwitch: {
    marginTop: '1rem',
    display: 'flex',
    justifyContent: 'center',
  },
  adminLink: {
    fontSize: '0.8rem',
    color: 'var(--secondary)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontWeight: 500,
  }
};
