import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <p>© {currentYear} Mycloud. Марков А.С.</p>
        {/* <div className="footer-links">
          <a href="/terms" className="footer-link">Условия обслуживания</a>
          <a href="/privacy" className="footer-link">Политика конфиденциальности</a>
          <a href="/contact" className="footer-link">Связаться со мной</a>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;