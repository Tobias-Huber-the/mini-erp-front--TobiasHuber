// src/services/api.js
import axios from 'axios'
import { API_CONFIG } from '../config/api'

// Instancia de Axios
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor: agrega token si existe
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---- LOGIN ----
export async function login(email, password) {
  const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN, {
    email,
    password
  })
  return response.data
}

// ---- PRODUCTOS ----
export async function getProducts() {
  try {
    const response = await api.get(API_CONFIG.ENDPOINTS.PRODUCTS)
    return response.data
  } catch (err) {
    // Si falla por Network Error (servidor apagado), devolvemos productos demo
    if (err.code === 'ERR_NETWORK') {
      console.warn('Servidor no disponible, usando productos de prueba')
      return [
        { id: 1, codigo: 'P001', descripcion: 'Producto demo 1', precio: 10000, stock: 5 },
        { id: 2, codigo: 'P002', descripcion: 'Producto demo 2', precio: 25000, stock: 12 },
        { id: 3, codigo: 'P003', descripcion: 'Producto demo 3', precio: 5000, stock: 0 }
      ]
    }
    throw err
  }
}
