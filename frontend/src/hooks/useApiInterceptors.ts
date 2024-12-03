
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interceptors } from '../api';

export const useApiInterceptors = () => {
  const navigate = useNavigate();

  useEffect(() => {
    interceptors(navigate);
  }, [navigate]);
};