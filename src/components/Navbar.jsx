"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, User, LogOut, Shield, Smartphone, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, admin, userLogout, adminLogout } = useAuth();
  const { cartCount } = useCart();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('phone_store_theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('phone_store_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <header style={styles.header} className="glass-panel">
      <div className="container" style={styles.container}>
        {/* Logo */}
        <Link href="/" style={styles.logo}>
          <Smartphone size={24} color="#6366F1" />
          <span className="text-gradient-primary" style={styles.logoText}>CamboPhoneStore</span>
        </Link>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          <Link href="/" style={styles.navLink}>Shop</Link>
          {user && (
            <Link href="/orders" style={styles.navLink}>My Orders</Link>
          )}
          {admin && (
            <Link href="/admin" style={styles.navLink} className="text-gradient-primary">
              <Shield size={16} style={{ marginRight: '4px' }} />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div style={styles.actions}>
          {/* Theme Switcher Toggle */}
          <button onClick={toggleTheme} style={styles.themeBtn} title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            {theme === 'dark' ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#6366F1" />}
          </button>

          {/* Cart Icon */}
          <Link href="/cart" style={styles.cartBtn} title="Shopping Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={styles.cartBadge}>{cartCount}</span>
            )}
          </Link>

          {/* Authentication Badge */}
          {user ? (
            <div style={styles.userMenu}>
              <div style={styles.userProfile} title={user.email}>
                <User size={16} />
                <span style={styles.username}>{user.full_name}</span>
              </div>
              <button onClick={userLogout} className="btn btn-secondary btn-sm" style={styles.logoutBtn}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : admin ? (
            <div style={styles.userMenu}>
              <div style={styles.adminProfile} title={admin.email}>
                <Shield size={16} color="#06B6D4" />
                <span style={{ ...styles.username, color: '#06B6D4' }}>Admin</span>
              </div>
              <button onClick={adminLogout} className="btn btn-secondary btn-sm" style={styles.logoutBtn}>
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-color)',
    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontWeight: 800,
    fontSize: '1.4rem',
  },
  logoText: {
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.75rem',
  },
  navLink: {
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--text-muted)',
    transition: 'color var(--transition-fast)',
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: 'var(--text-main)',
    }
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    ':hover': {
      background: 'rgba(255,255,255,0.08)',
      borderColor: 'var(--primary)',
    }
  },
  cartBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    transition: 'all var(--transition-fast)',
    ':hover': {
      background: 'rgba(255,255,255,0.08)',
      borderColor: 'var(--primary)',
    }
  },
  cartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    background: 'var(--primary)',
    color: 'white',
    fontSize: '0.7rem',
    fontWeight: '700',
    minWidth: '18px',
    height: '18px',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    boxShadow: '0 0 8px var(--primary-glow)',
  },
  userMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    fontSize: '0.85rem',
  },
  adminProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.5rem 0.75rem',
    borderRadius: 'var(--radius-md)',
    background: 'rgba(6, 182, 212, 0.08)',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    fontSize: '0.85rem',
  },
  username: {
    fontWeight: 500,
    maxWidth: '120px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  }
};
