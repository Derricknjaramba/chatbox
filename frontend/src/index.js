import React from 'react';
import ReactDOM from 'react-dom/client'; // Import the 'react-dom/client' for React 18

import './index.css';
import App from './App';

// Create a root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Use root.render instead of ReactDOM.render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);






