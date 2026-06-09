"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, Smartphone, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await forgotPassword(email);
    if (res && res.success) {
      // Redirect to reset page with email query parameter
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } else {
      setError(res?.message || 'Failed to request password reset. Check if email is correct.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.card}>
        <div style={styles.header}>
          <KeyRound size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
          <h1 className="text-gradient-primary" style={styles.title}>Forgot Password</h1>
          <p style={styles.subtitle}>Enter your account email to receive a 6-digit password reset OTP</p>
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

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            <span>Send Reset OTP</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ color: 'var(--text-muted)' }}>
            Remembered your password? <Link href="/login" style={styles.link}>Sign In</Link>
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
  }
};
