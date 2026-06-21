import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/auth` 
  : 'http://localhost:8080/auth';

// Verifica se o e-mail já está cadastrado.
export async function checkEmailExists(email) {
  try {
    const response = await axios.get(`${API_URL}/check-email?email=${encodeURIComponent(email)}`);
    return response.data?.exists;
  } catch {
    return false;
  }
}

export async function signIn(email, password) {
  try {
    const response = await axios.post(`${API_URL}/signin`, { email, password });
    console.log('Resposta signin:', response.data);
    
    // O backend retorna { token, user }
    const data = response.data;
    
    // Se for string (resposta antiga), converte para objeto
    if (typeof data === 'string') {
      return { token: data, user: null };
    }
    
    return {
      token: data.token,
      user: data.user
    };
  } catch (error) {
    console.error('Erro signin:', error);
    if (error.response) {
      if (error.response.status === 400) throw new Error('Requisição inválida.', { cause: error });
      if (error.response.status === 401) {
        throw new Error(error.response.data || 'Usuário ou senha incorretos.', { cause: error });
      }
    }
    throw new Error('Erro ao autenticar.', { cause: error });
  }
}

export async function signUp(name, email, password, photo) {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      name,
      email,
      password,
      photo: photo || null
    });
    console.log('Resposta signup:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro signup:', error);
    if (error.response) {
      if (error.response.status === 400) throw new Error(error.response.data || 'Requisição inválida.', { cause: error });
      if (error.response.status === 409) throw new Error('Usuário já cadastrado.', { cause: error });
    }
    throw new Error('Erro ao cadastrar usuário.', { cause: error });
  }
}

export async function getMe(token) {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: { 
        Authorization: `Bearer ${token}` 
      }
    });
    return response.data;
  } catch (error) {
    throw new Error('Erro ao buscar dados do usuário.', { cause: error });
  }
}

export function updateUserInStorage(userData) {
  const user = { ...userData };
  localStorage.setItem("user", JSON.stringify(user));
  sessionStorage.setItem("user", JSON.stringify(user));
  return user;
}

export async function uploadPhoto(file) {
  try {
    const token = localStorage.getItem('token');
    console.log('Token para upload:', token ? 'Encontrado' : 'Não encontrado');
    
    if (!token) {
      throw new Error('Token não encontrado. Faça login novamente.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/upload-photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Upload resposta:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro no upload:', error);
    throw new Error(error.response?.data || 'Erro ao enviar foto.', { cause: error });
  }
}