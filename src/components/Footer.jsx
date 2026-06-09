import React from 'react';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.branding}>
          <h3 style={styles.brandTitle} className="text-gradient-primary">PhoneStore</h3>
          <p style={styles.brandText}>Premium smartphones, exceptional customer service, and flexible pre-order releases.</p>
        </div>
        
        <div style={styles.links}>
          <div>
            <h4 style={styles.linkHeader}>Customer Area</h4>
            <ul style={styles.linkList}>
              <li><a href="/" style={styles.linkItem}>Shop Catalog</a></li>
              <li><a href="/cart" style={styles.linkItem}>Shopping Cart</a></li>
              <li><a href="/orders" style={styles.linkItem}>My Order Status</a></li>
            </ul>
          </div>
          
          <div>
            <h4 style={styles.linkHeader}>Admin Portal</h4>
            <ul style={styles.linkList}>
              <li><a href="/admin" style={styles.linkItem}>Dashboard Control</a></li>
              <li><a href="/admin/login" style={styles.linkItem}>Admin Authentication</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div style={styles.bottomBar}>
        <div className="container" style={styles.bottomContainer}>
          <p style={styles.copyright}>&copy; {new Date().getFullYear()} PhoneStore. All rights reserved.</p>
          <p style={styles.developer}>Powered by Next.js &amp; Express API</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: 'var(--bg-surface)',
    borderTop: '1px solid var(--border-color)',
    padding: '3rem 0 0 0',
    marginTop: 'auto',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '2rem',
    paddingBottom: '2.5rem',
  },
  branding: {
    maxWidth: '400px',
  },
  brandTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  brandText: {
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  links: {
    display: 'flex',
    gap: '4rem',
    flexWrap: 'wrap',
  },
  linkHeader: {
    fontSize: '0.95rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: 'var(--text-main)',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  linkItem: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    transition: 'color var(--transition-fast)',
    ':hover': {
      color: 'var(--primary)',
    }
  },
  bottomBar: {
    borderTop: '1px solid var(--border-color)',
    padding: '1.25rem 0',
    backgroundColor: 'var(--bg-base)',
  },
  bottomContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  copyright: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
  },
  developer: {
    fontSize: '0.8rem',
    color: 'rgba(255, 255, 255, 0.1)',
  }
};
