// src/main.js
import { login, getProducts } from './services/api'

const app = document.querySelector('#app')

// ---------- LOGIN ----------
function renderLogin() {
  app.innerHTML = `
    <div class="min-h-screen" style="
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e5e7eb;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 400px;
      ">
        <h1 style="font-size: 1.5rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem;">
          Mini ERP · Login
        </h1>
        <form id="login-form" style="display: flex; flex-direction: column; gap: 0.75rem;">
          <input
            type="email"
            id="email"
            placeholder="Email"
            required
            style="padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid #d1d5db; outline: none;"
          />
          <input
            type="password"
            id="password"
            placeholder="Password"
            required
            style="padding: 0.5rem 0.75rem; border-radius: 0.5rem; border: 1px solid #d1d5db; outline: none;"
          />
          <button
            type="submit"
            style="
              margin-top: 0.5rem;
              padding: 0.5rem 0.75rem;
              border-radius: 0.5rem;
              border: none;
              background: #2563eb;
              color: white;
              font-weight: 600;
              cursor: pointer;
            "
          >
            Iniciar sesión
          </button>
          <p id="login-error" style="color: #dc2626; font-size: 0.875rem; display: none;"></p>
        </form>
      </div>
    </div>
  `

  const form = document.querySelector('#login-form')
  const errorEl = document.querySelector('#login-error')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    errorEl.style.display = 'none'
    errorEl.textContent = ''

    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    try {
      const data = await login(email, password)
      console.log('Respuesta del login:', data)

      const token = data.access || data.token || data.jwt
      if (!token) {
        throw new Error('No se recibió token en la respuesta')
      }

      localStorage.setItem('token', token)
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      renderDashboard()
    } catch (err) {
      console.error(err)
      if (err.code === 'ERR_NETWORK') {
        errorEl.textContent = 'No se puede conectar con el servidor Mini ERP (ERR_NETWORK).'
      } else {
        errorEl.textContent = 'Error de login: revisá credenciales o conexión.'
      }
      errorEl.style.display = 'block'
    }
  })
}

// ---------- DASHBOARD DE PRODUCTOS ----------
async function renderDashboard() {
  app.innerHTML = `
    <div style="
      min-height: 100vh;
      background: #e5e7eb;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    ">
      <header style="
        background: white;
        padding: 1rem 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      ">
        <h1 style="font-size: 1.25rem; font-weight: 700;">Mini ERP · Productos</h1>
        <button id="logout-btn" style="
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          border: none;
          background: #ef4444;
          color: white;
          font-weight: 600;
          cursor: pointer;
        ">
          Cerrar sesión
        </button>
      </header>
      <main style="padding: 1.5rem;">
        <p id="info" style="margin-bottom: 0.75rem; font-size: 0.9rem; color: #4b5563;"></p>
        <div style="
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          overflow: hidden;
        ">
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: #e5e7eb;">
              <tr>
                <th style="text-align: left; padding: 0.75rem;">Código</th>
                <th style="text-align: left; padding: 0.75rem;">Descripción</th>
                <th style="text-align: right; padding: 0.75rem;">Precio</th>
                <th style="text-align: right; padding: 0.75rem;">Stock</th>
              </tr>
            </thead>
            <tbody id="products-body">
              <tr>
                <td colspan="4" style="padding: 0.75rem;">Cargando productos...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  `

  document.querySelector('#logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    renderLogin()
  })

  const info = document.querySelector('#info')
  const tbody = document.querySelector('#products-body')

  try {
    const products = await getProducts()

    if (!products || products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" style="padding: 0.75rem;">No hay productos para mostrar.</td>
        </tr>
      `
      return
    }

    // Si son productos mock, mostramos aviso
    if (products[0].codigo === 'P001' && products[0].descripcion.includes('demo')) {
      info.textContent = 'Mostrando productos de prueba (el servidor Mini ERP no está disponible).'
    } else {
      info.textContent = 'Mostrando productos reales desde la API del Mini ERP.'
    }

    tbody.innerHTML = products.map(p => `
      <tr style="border-top: 1px solid #e5e7eb;">
        <td style="padding: 0.75rem;">${p.codigo || p.id}</td>
        <td style="padding: 0.75rem;">${p.descripcion || p.name}</td>
        <td style="padding: 0.75rem; text-align: right;">${p.precio || p.price || '-'}</td>
        <td style="padding: 0.75rem; text-align: right;">${p.stock ?? '-'}</td>
      </tr>
    `).join('')
  } catch (err) {
    console.error(err)
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="padding: 0.75rem; color: #dc2626;">
          Error al cargar productos.
        </td>
      </tr>
    `
  }
}

// ---------- INICIO ----------
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')
  if (token) {
    renderDashboard()
  } else {
    renderLogin()
  }
})
