import { APP_CONFIG } from '@/lib/constants'

interface LoginResponse {
  user: {
    id: string
    name: string
    email: string
    role: 'admin' | 'viewer' | 'operator'
    avatar?: string
    permissions: string[]
  }
  token: string
}

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'viewer' | 'operator'
  avatar?: string
  permissions: string[]
}

class AuthApiService {
  private baseUrl = APP_CONFIG.api.baseUrl

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro no login')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro na requisição de login:', error)
      throw error
    }
  }

  async validateToken(token: string): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Token inválido')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro na validação do token:', error)
      throw error
    }
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Erro ao renovar token')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      throw error
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    } catch (error) {
      console.error('Erro no logout:', error)
      // Não propagar erro pois logout deve sempre funcionar localmente
    }
  }

  async updateProfile(token: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar perfil')
      }

      return await response.json()
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao alterar senha')
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      throw error
    }
  }
}

export const authApi = new AuthApiService()