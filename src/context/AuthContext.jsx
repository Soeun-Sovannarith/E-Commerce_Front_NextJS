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
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser && parsedUser.role === 'admin') {
        setAdmin(parsedUser);
        setAdminToken(savedToken);
        localStorage.setItem('phone_store_admin', savedUser);
        localStorage.setItem('phone_store_admin_token', savedToken);
        localStorage.removeItem('phone_store_user');
        localStorage.removeItem('phone_store_token');
      } else {
        setUser(parsedUser);
        setToken(savedToken);
        // Clean up hybrid session if both exist
        localStorage.removeItem('phone_store_admin');
        localStorage.removeItem('phone_store_admin_token');
      }
    } else if (savedAdminToken && savedAdmin) {
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
    const currentToken = endpoint.includes('/admin/') ? adminToken : (token || adminToken);

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
        return { success: false, error: true, message: data.message || 'Something went wrong' };
      }
      if (typeof data === 'object' && data !== null && !('success' in data)) {
        data.success = true;
      }
      return data;
    } catch (err) {
      console.error(`API Call error on ${endpoint}:`, err);
      return { success: false, error: true, message: err.message || 'Network connection error' };
    }
  };

  // Customer Authentication Actions
  const userRegister = async (fullName, email, password) => {
    const res = await apiCall('/api/auth/users/register', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, full_name: fullName, email, password_hash: password }),
    });
    if (res && res.success) {
      addNotification('Registration successful! Please check your email to verify.', 'success');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Registration failed';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const userLogin = async (email, password) => {
    // Clear admin session on user login
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem('phone_store_admin');
    localStorage.removeItem('phone_store_admin_token');

    const res = await apiCall('/api/auth/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password_hash: password }),
    });
    
    if (res && res.success) {
      const userData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (userData && userData.token) {
        if (userData.role === 'admin') {
          setAdmin(userData);
          setAdminToken(userData.token);
          localStorage.setItem('phone_store_admin', JSON.stringify(userData));
          localStorage.setItem('phone_store_admin_token', userData.token);
          addNotification('Logged in successfully as Admin!', 'success');
          router.push('/admin');
          return { success: true, data: userData };
        }
        setUser(userData);
        setToken(userData.token);
        localStorage.setItem('phone_store_user', JSON.stringify(userData));
        localStorage.setItem('phone_store_token', userData.token);
        addNotification('Logged in successfully!', 'success');
        router.push('/');
        return { success: true, data: userData };
      } else {
        const msg = 'Authentication token missing from response';
        addNotification(msg, 'error');
        return { success: false, message: msg };
      }
    } else {
      const msg = res?.message || 'Email and password invalid';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const userLogout = async () => {
    await apiCall('/api/auth/users/logout', { method: 'DELETE' });
    setUser(null);
    setToken(null);
    localStorage.removeItem('phone_store_user');
    localStorage.removeItem('phone_store_token');
    addNotification('Logged out successfully!', 'info');
    router.push('/login');
  };

  // Verification & Password Reset Flows
  const verifyEmail = async (verificationToken) => {
    const res = await apiCall(`/api/auth/users/verify-email?token=${verificationToken}`);
    if (res && res.success) {
      addNotification('Email verified successfully! You can now log in.', 'success');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Verification failed. The token may be expired or invalid.';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const resendVerification = async (email) => {
    const res = await apiCall('/api/auth/users/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res && res.success) {
      addNotification('Verification email resent.', 'success');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Failed to resend verification email';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const forgotPassword = async (email) => {
    const res = await apiCall('/api/auth/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    if (res && res.success) {
      addNotification('Password reset OTP sent to your email.', 'success');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Failed to request password reset';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const verifyResetOtp = async (email, otp) => {
    const res = await apiCall('/api/auth/users/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    if (res && res.success) {
      addNotification('OTP verified successfully.', 'success');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Invalid OTP';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await apiCall('/api/auth/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password_hash: newPassword }),
    });
    if (res && res.success) {
      addNotification('Password reset successful! You can now log in.', 'success');
      router.push('/login');
      return { success: true, data: res };
    } else {
      const msg = res?.message || 'Failed to reset password';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  // Admin Authentication Actions
  const adminLogin = async (email, password) => {
    // Clear user session on admin login
    setUser(null);
    setToken(null);
    localStorage.removeItem('phone_store_user');
    localStorage.removeItem('phone_store_token');

    const res = await apiCall('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password_hash: password }),
    });
    
    if (res && res.success) {
      const adminData = Array.isArray(res.data) ? res.data[0] : res.data;
      if (adminData && adminData.token) {
        setAdmin(adminData);
        setAdminToken(adminData.token);
        localStorage.setItem('phone_store_admin', JSON.stringify(adminData));
        localStorage.setItem('phone_store_admin_token', adminData.token);
        addNotification('Admin logged in successfully!', 'success');
        router.push('/admin');
        return { success: true, data: adminData };
      } else {
        const msg = 'Admin authentication token missing';
        addNotification(msg, 'error');
        return { success: false, message: msg };
      }
    } else {
      const msg = res?.message || 'Authentication failed. Please check admin credentials.';
      addNotification(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const adminLogout = async () => {
    await apiCall('/api/auth/admin/logout', { method: 'DELETE' });
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem('phone_store_admin');
    localStorage.removeItem('phone_store_admin_token');
    addNotification('Admin logged out.', 'info');
    router.push('/admin/login');
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
