import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(container);

// React 18 的 Strict Mode 帮助检测副作用
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
