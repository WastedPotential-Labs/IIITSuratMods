import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx'
import { AuthProvider } from '../context/Auth.jsx';
import { registerServiceWorker } from './registerServiceWorker.js';

registerServiceWorker();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          theme="light"
          richColors={false}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
