import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/ws/point` 
  : 'http://localhost:8080/ws/point';

const PASSO_FUNDO_CENTER = { lat: -28.2628, lng: -52.4065 };

const KNOWN_LOCAL_STATIONS = {
  petrobras: { lat: -28.2628, lng: -52.4065 },
  'posto alegre': { lat: -28.2609, lng: -52.4102 },
};

function withPrices(point) {
  return {
    ...point,
    prices: {
      gasolina: (4.5 + Math.random() * 1.5).toFixed(2),
      diesel: (4.8 + Math.random() * 1.5).toFixed(2),
      etanol: (3.2 + Math.random() * 1.2).toFixed(2),
    },
  };
}

function isFarFromPassoFundo(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return true;
  return Math.abs(lat - PASSO_FUNDO_CENTER.lat) > 1.2 || Math.abs(lng - PASSO_FUNDO_CENTER.lng) > 1.2;
}

function normalizeKnownStation(point) {
  const key = (point.name || '').trim().toLowerCase();
  const local = KNOWN_LOCAL_STATIONS[key];

  if (!local) return point;
  if (!isFarFromPassoFundo(point.lat, point.lng)) return point;

  return {
    ...point,
    lat: local.lat,
    lng: local.lng,
  };
}

function formatPoints(data) {
  return data.map(point => ({
    id: point.id,
    name: point.description || point.descricao || 'Posto de Combustivel',
    lat: point.latitude ?? point.lat,
    lng: point.longitude ?? point.lng,
    description: point.description || point.descricao || '',
  }));
}

export async function getAllPoints(token) {
  try {
    const response = await axios.get(`${BASE_URL}/todos`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const points = formatPoints(response.data);
    return points
      .map(normalizeKnownStation)
      .map(withPrices);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar postos', { cause: error });
  }
}

export async function getMyPoints(token) {
  try {
    const response = await axios.get(BASE_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const points = formatPoints(response.data);
    return points
      .map(normalizeKnownStation)
      .map(withPrices);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao buscar meus postos', { cause: error });
  }
}

export async function postPoint(token, pointData) {
  try {
    const response = await axios.post(BASE_URL, pointData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao cadastrar ponto', { cause: error });
  }
}

export async function updatePoint(token, id, pointData) {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, pointData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao atualizar ponto', { cause: error });
  }
}

export async function deletePoint(token, pointId) {
  try {
    const response = await axios.delete(`${BASE_URL}/${pointId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao excluir ponto', { cause: error });
  }
}

const FAVORITO_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/ws/favorito` 
  : 'http://localhost:8080/ws/favorito';

export async function adicionarFavorito(token, pointId) {
  try {
    const response = await axios.post(FAVORITO_URL, 
      { pointId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erro ao adicionar favorito', { cause: error });
  }
}

export async function removerFavorito(token, pointId) {
  try {
    const response = await axios.delete(`${FAVORITO_URL}/${pointId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erro ao remover favorito', { cause: error });
  }
}

export async function listarFavoritos(token) {
  try {
    const response = await axios.get(FAVORITO_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Erro ao listar favoritos', { cause: error });
  }
}

export async function isFavorito(token, pointId) {
  try {
    const response = await axios.get(`${FAVORITO_URL}/${pointId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch {
    return false;
  }
}