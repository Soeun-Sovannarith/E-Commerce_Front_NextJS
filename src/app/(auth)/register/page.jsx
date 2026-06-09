"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, KeyRound, Smartphone } from 'lucide-react';

export default function RegisterPage() {
  const { userRegister, resendVerification } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~]).+$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., PhoneStore@123).');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await userRegister(fullName, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setLoading(true);
      await resendVerification(email);
    } catch (err) {
      setError(err.message || 'Failed to resend verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <Smartphone size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <h1 className="text-gradient-primary" style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join PhoneStore to view order histories and write review ratings</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}
        {success && (
          <div style={styles.successAlert}>
            <p style={{ fontWeight: 600 }}>Registration Successful!</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>We sent a verification email to your address. Please click the link to activate your account.</p>
            <button onClick={handleResend} className="btn btn-secondary btn-sm" style={{ marginTop: '0.75rem', width: '100%' }}>
              Resend Verification Email
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={styles.inputWrapper}>
                <User size={18} style={styles.inputIcon} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Sovannarith" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

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
              <label className="form-label">
                Password 
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Requires uppercase, lowercase, number, and special character
                </span>
              </label>
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

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={styles.inputWrapper}>
                <KeyRound size={18} style={styles.inputIcon} />
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            Already have an account? <Link href="/login" style={styles.link}>Sign In</Link>
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
    padding: '4rem 1.5rem',
    flex: 1,
  },
  card: {
    width: '100%',
    maxWidth: '450px',
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
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#fca5a5',
    padding: '0.75rem 1rem',
    fontSize: '0.85rem',
    marginBottom: '1.5rem',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: '#a7f3d0',
    padding: '1.25rem',
    fontSize: '0.9rem',
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
    ':hover': {
      textDecoration: 'underline',
    }
  }
};
