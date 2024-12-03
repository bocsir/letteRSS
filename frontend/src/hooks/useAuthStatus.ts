
import { useState, useEffect } from 'react';
import { AxiosResponse } from 'axios';
import api from '../api';
import { AuthStatusResponse } from '../interfaces';

export const useAuthStatus = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  async function getAuthStatus() {
    try {
      const response: AxiosResponse<AuthStatusResponse> = await api.get('/auth/auth');
      setIsAuthenticated(response.data.authenticated);
      setUserEmail(response.data.user.email);
    } catch (err) {
      if (window.location.pathname === '/') {
        await getAuthStatus();
      }
    }
  }

  useEffect(() => {
    getAuthStatus();
  }, []);

  return { isAuthenticated, userEmail };
};