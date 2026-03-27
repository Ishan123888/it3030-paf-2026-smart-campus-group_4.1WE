import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Smart Campus Hub</h3>
          <p className="text-sm">Modernizing university operations with efficiency and transparency.</p>
        </div>
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
          <ul className="text-sm space-y-2">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/contact" className="hover:text-white">Contact Support</a></li>
          </ul>
        </div>
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Legal</h3>
          <p className="text-sm">© 2026 Smart Campus - SLIIT. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;