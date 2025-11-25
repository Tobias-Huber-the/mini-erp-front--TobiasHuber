// src/config/api.js

export const API_CONFIG = {
  BASE_URL: 'http://185.218.124.154:8800/api',
  ENDPOINTS: {
    LOGIN: '/users/users/login/',
    PRODUCTS: '/inventory/products/'
  }
}

// Credenciales de prueba (si el profe dio otras, se cambian)
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@minierp.com',
    password: 'test123456'
  }
}
