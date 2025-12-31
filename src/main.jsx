import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Ẩn initial loading screen khi React đã mount
const hideInitialLoading = () => {
  const loadingEl = document.getElementById('initial-loading')
  if (loadingEl) {
    loadingEl.style.opacity = '0'
    loadingEl.style.transition = 'opacity 0.3s ease-out'
    setTimeout(() => {
      if (loadingEl.parentNode) {
        loadingEl.remove()
      }
    }, 300)
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Ẩn loading screen sau khi render
setTimeout(hideInitialLoading, 100)

