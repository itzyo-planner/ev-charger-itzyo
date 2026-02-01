import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import LinkPage from './components/LinkPage'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LinkPage />} />
        <Route path="/map" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
