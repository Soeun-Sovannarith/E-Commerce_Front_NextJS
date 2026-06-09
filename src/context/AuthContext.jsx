"use client";

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('phone_store_user');
    const savedToken = localStorage.getItem('phone_store_token');
    const savedAdmin = localStorage.getItem('phone_store_admin');
    const savedAdminToken = localStorage.getItem('phone_store_admin_token');

    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    if (savedAdminToken && savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
      setAdminToken(savedAdminToken);
    }
    setLoading(false);
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const apiCall = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const currentToken = endpoint.includes('/admin/') ? adminToken : token;

    const headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
      ...options.headers,
    };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      return data;
    } catch (err) {
      console.error(`API Call error on ${endpoint}:`, err);
      throw err;
    }
  };

  // Customer Authentication Actions
  const userRegister = async (fullName, email, password) => {
    try {
      const res = await apiCall('/api/auth/users/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, full_name: fullName, email, password_hash: password }),
      });
      addNotification('Registration successful! Please check your email to verify.', 'success');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const userLogin = async (email, password) => {
    try {
      const res = await apiCall('/api/auth/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password_hash: password }),
      });
      
      const userData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (userData && userData.token) {
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('phone_store_user', JSON.stringify(userData));
        localStorage.setItem('phone_store_token', userData.token);
        addNotification('Logged in successfully!', 'success');
        router.push('/');
      } else {
        throw new Error('Authentication token missing from response');
      }
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const userLogout = async () => {
    try {
      await apiCall('/api/auth/users/logout', { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend logout failed or not available:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('phone_store_user');
      localStorage.removeItem('phone_store_token');
      addNotification('Logged out successfully!', 'info');
      router.push('/login');
    }
  };

  // Verification & Password Reset Flows
  const verifyEmail = async (verificationToken) => {
    try {
      const res = await apiCall(`/api/auth/users/verify-email?token=${verificationToken}`);
      addNotification('Email verified successfully! You can now log in.', 'success');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const resendVerification = async (email) => {
    try {
      const res = await apiCall('/api/auth/users/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      addNotification('Verification email resent.', 'success');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await apiCall('/api/auth/users/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      addNotification('Password reset OTP sent to your email.', 'success');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const res = await apiCall('/api/auth/users/verify-reset-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
      addNotification('OTP verified successfully.', 'success');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const res = await apiCall('/api/auth/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, password_hash: newPassword }),
      });
      addNotification('Password reset successful! You can now log in.', 'success');
      router.push('/login');
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  // Admin Authentication Actions
  const adminLogin = async (email, password) => {
    try {
      const res = await apiCall('/api/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password_hash: password }),
      });
      
      const adminData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (adminData && adminData.token) {
        setAdmin(adminData);
        setAdminToken(adminData.token);
        localStorage.setItem('phone_store_admin', JSON.stringify(adminData));
        localStorage.setItem('phone_store_admin_token', adminData.token);
        addNotification('Admin logged in successfully!', 'success');
        router.push('/admin');
      } else {
        throw new Error('Admin authentication token missing');
      }
      return res;
    } catch (err) {
      addNotification(err.message, 'error');
      throw err;
    }
  };

  const adminLogout = async () => {
    try {
      await apiCall('/api/auth/admin/logout', { method: 'DELETE' });
    } catch (err) {
      console.warn('Admin backend logout failed:', err);
    } finally {
      setAdmin(null);
      setAdminToken(null);
      localStorage.removeItem('phone_store_admin');
      localStorage.removeItem('phone_store_admin_token');
      addNotification('Admin logged out.', 'info');
      router.push('/admin/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      admin,
      token,
      adminToken,
      loading,
      notifications,
      addNotification,
      apiCall,
      userRegister,
      userLogin,
      userLogout,
      verifyEmail,
      resendVerification,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
      adminLogin,
      adminLogout
    }}>
      {children}
      {/* Toast Render */}
      <div className="toast-container">
        {notifications.map((n) => (
          <div key={n.id} className={`toast toast-${n.type}`}>
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: n.type === 'success' ? '#10B981' : n.type === 'error' ? '#EF4444' : '#3B82F6'
            }} />
            <span>{n.message}</span>
          </div>
        ))}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
