import api from '../../utils/api';
import { LoginCredentials, RegisterData } from '../../types';

class AuthService {
  async login(credentials: LoginCredentials) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const response: any = await api.post('/auth/login', credentials);

    if (response.token) {
      localStorage.setItem('token', response.token);
      // Normalize: backend sends 'id', we store as '_id' too
      const user = {
        ...response.user,
        _id: response.user.id || response.user._id,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response;
  }

  async register(data: RegisterData) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const response: any = await api.post('/auth/signup', data);

    if (response.token) {
      localStorage.setItem('token', response.token);
      const user = {
        ...response.user,
        _id: response.user.id || response.user._id,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export default new AuthService();