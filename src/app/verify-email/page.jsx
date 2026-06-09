"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, XCircle, Loader, Smartphone } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail } = useAuth();

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing. Please check the link in your email.');
      return;
    }

    const runVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Verification failed. The token may be expired or invalid.');
      }
    };

    runVerification();
  }, [token]);

  return (
    <div className="glass-panel" style={styles.card}>
      <div style={styles.header}>
        <Smartphone size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
        <h1 className="text-gradient-primary" style={styles.title}>Email Verification</h1>
      </div>

      {status === 'loading' && (
        <div style={styles.stateContainer}>
          <Loader size={48} className="spinner" color="var(--primary)" />
          <p style={styles.stateText}>Validating your email token, please wait...</p>
        </div>
      )}

      {status === 'success' && (
        <div style={styles.stateContainer}>
          <CheckCircle size={48} color="var(--success)" />
          <p style={{ ...styles.stateText, color: '#a7f3d0' }}>Account Verified Successfully!</p>
          <p style={styles.detailText}>Thank you for verifying your email address. Your account is now active and ready to use.</p>
          <Link href="/login" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            Proceed to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div style={styles.stateContainer}>
          <XCircle size={48} color="var(--danger)" />
          <p style={{ ...styles.stateText, color: '#fca5a5' }}>Verification Failed</p>
          <p style={styles.detailText}>{errorMessage}</p>
          <Link href="/register" className="btn btn-secondary" style={{ width: '100%', marginTop: '1.5rem' }}>
            Back to Register
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={styles.container}>
      <Suspense fallback={
        <div className="glass-panel" style={styles.card}>
          <div style={styles.stateContainer}>
            <Loader size={48} className="spinner" color="var(--primary)" />
            <p style={styles.stateText}>Loading verification context...</p>
          </div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
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
    maxWidth: '450px',
    borderRadius: 'var(--radius-lg)',
    padding: '3rem 2.5rem',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
  },
  stateContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 0',
  },
  stateText: {
    fontSize: '1.15rem',
    fontWeight: '600',
    marginTop: '1.25rem',
    marginBottom: '0.5rem',
  },
  detailText: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
    maxWidth: '320px',
  }
};
