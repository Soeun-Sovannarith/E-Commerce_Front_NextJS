"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, ShieldAlert, KeyRound } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (otp.length !== 6) {
      setError('OTP must be exactly 6 digits');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email, otp, password);
    if (res && !res.success) {
      setError(res.message || 'Failed to reset password. Verify your OTP and email.');
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel" style={styles.card}>
      <div style={styles.header}>
        <ShieldAlert size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
        <h1 className="text-gradient-primary" style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter the 6-digit OTP code received in your email and configure a new password</p>
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
          <label className="form-label">6-Digit OTP</label>
          <div style={styles.inputWrapper}>
            <KeyRound size={18} style={styles.inputIcon} />
            <input 
              type="text" 
              className="form-control" 
              placeholder="123456" 
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required 
              style={{ paddingLeft: '2.5rem', letterSpacing: '0.2em', fontWeight: 'bold' }}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">New Password</label>
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
          <label className="form-label">Confirm New Password</label>
          <div style={styles.inputWrapper}>
            <Lock size={18} style={styles.inputIcon} />
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
          <span>Update Password</span>
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={styles.container}>
      <Suspense fallback={
        <div className="glass-panel" style={styles.card}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading password reset options...</p>
          </div>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
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
    maxWidth: '430px',
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
  }
};
