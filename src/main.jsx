import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const hideInitialLoading = () => {
  const el = document.getElementById('initial-loading')
  if (!el) return
  el.style.opacity = '0'
  el.style.transition = 'opacity 0.3s ease-out'
  setTimeout(() => el.remove(), 300)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

setTimeout(hideInitialLoading, 100)
