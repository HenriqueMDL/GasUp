import { useEffect, useState, useRef, useCallback } from "react";
import { Navbar, PostoCard } from "../../components";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useAuth } from "../../contexts/useAuth";
import { getAllPoints, getMyPoints, postPoint, deletePoint, listarFavoritos } from "../../services/mapService";
import "./mapa.css";

const containerStyle = { width: "100%", height: "400px" };
const center = { lat: -28.2628, lng: -52.4065 };

export function Mapa() {
  const { token, isAdmin } = useAuth();
  const [postos, setPostos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [mapRef, setMapRef] = useState(null);
  const [filtro, setFiltro] = useState("todos");
  const [favoritos, setFavoritos] = useState([]);
  const [meusPostosIds, setMeusPostosIds] = useState([]);
  const isMounted = useRef(true);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const fetchMeusPostos = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getMyPoints(token);
      const ids = data.map(p => p.id);
      setMeusPostosIds(ids);
    } catch (error) {
      console.error("Erro ao buscar meus postos:", error);
    }
  }, [token]);

  const fetchFavoritos = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listarFavoritos(token);
      const ids = data.map(f => f.point.id);
      setFavoritos(ids);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
    }
  }, [token]);

  const fetchPostos = useCallback(async () => {
    if (!token) {
      if (isMounted.current) setLoading(false);
      return;
    }
    try {
      const data = await getAllPoints(token);
      const postosFormatados = data.map(p => ({
        ...p,
        distance: `${(Math.random() * 2 + 0.5).toFixed(1)}km`,
      }));
      if (isMounted.current) {
        setPostos(postosFormatados);
      }
    } catch (error) {
      console.error("Erro ao buscar postos:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!token) {
        if (!ignore) setLoading(false);
        return;
      }
      try {
        const data = await getAllPoints(token);
        const postosFormatados = data.map(p => ({
          ...p,
          distance: `${(Math.random() * 2 + 0.5).toFixed(1)}km`,
        }));
        if (!ignore) {
          setPostos(postosFormatados);
        }
        await fetchMeusPostos();
        await fetchFavoritos();
      } catch (error) {
        console.error("Erro ao carregar postos:", error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, [token, fetchMeusPostos, fetchFavoritos]);

  const termoBusca = searchTerm.trim().toLowerCase();
  const postosFiltrados = postos.filter((posto) => {
    if (termoBusca) {
      const nome = String(posto.name || "").toLowerCase();
      const descricao = String(posto.description || "").toLowerCase();
      if (!nome.includes(termoBusca) && !descricao.includes(termoBusca)) {
        return false;
      }
    }

    if (filtro === "favoritos") {
      const isFavorito = favoritos.includes(posto.id);
      const isMeuPosto = meusPostosIds.includes(posto.id);
      if (!isFavorito && !isMeuPosto) {
        return false;
      }
    }

    return true;
  });

  const handleMapClick = async (event) => {
    if (!isAdmin) {
      alert("Apenas administradores podem adicionar postos.");
      return;
    }

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const name = prompt("Digite o nome do posto:");
    if (!name) return;

    try {
      await postPoint(token, {
        latitude: lat,
        longitude: lng,
        description: name,
      });
      await fetchPostos();
      await fetchMeusPostos();
    } catch (error) {
      alert("Erro ao criar posto: " + error.message);
    }
  };

  const handleDeletePosto = async (id, name) => {
    if (!isAdmin) {
      alert("Apenas administradores podem excluir postos.");
      return;
    }
    if (!confirm(`Deseja excluir o posto "${name}"?`)) return;

    try {
      await deletePoint(token, id);
      await fetchPostos();
      await fetchMeusPostos();
      alert("Posto excluido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar:", error);
      
      if (error.message.includes("permissao")) {
        alert("Voce nao tem permissao para excluir este posto.");
      } else if (error.message.includes("nao encontrado")) {
        alert("Posto nao encontrado.");
      } else {
        alert("Erro ao deletar posto: " + error.message);
      }
    }
  };

  const handlePostoClick = (posto) => {
    if (mapRef) {
      const position = { lat: posto.lat, lng: posto.lng };
      mapRef.panTo(position);
      mapRef.setZoom(16);
    }
  };

  const atualizarFavoritos = async () => {
    if (!token) return;
    try {
      const data = await listarFavoritos(token);
      const ids = data.map(f => f.point.id);
      setFavoritos(ids);
    } catch (error) {
      console.error("Erro ao atualizar favoritos:", error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="mapa-page">
        <Navbar />
        <div className="loading">Carregando postos...</div>
      </div>
    );
  }

  return (
    <div className="mapa-page">
      <Navbar />

      <div className="mapa-header">
        <h2>Pesquisa</h2>
        <p className="subtitle">
          {isAdmin
            ? "Clique no mapa para adicionar um posto"
            : "Encontre os melhores precos perto de voce"}
        </p>

        <div className="mapa-search">
          <input
            type="text"
            className="input-field"
            placeholder="Pesquisar posto por nome"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm.trim() && (
            <span className="search-result-count">
              {postosFiltrados.length} posto(s) encontrado(s)
            </span>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => setMapRef(map)}
        options={{
          draggableCursor: isAdmin ? "crosshair" : "default",
        }}
      >
        {postosFiltrados.map((posto) => (
          <Marker
            key={posto.id}
            position={{ lat: posto.lat, lng: posto.lng }}
            title={posto.name}
          />
        ))}
      </GoogleMap>

      <div className="postos-list">
        <div className="filter-row">
          <span
            className={filtro === "todos" ? "active" : ""}
            onClick={() => setFiltro("todos")}
          >
            Mais Proximo
          </span>
          <span
            className={filtro === "favoritos" ? "active" : ""}
            onClick={() => {
              setFiltro("favoritos");
              atualizarFavoritos();
            }}
          >
            Meus Favoritos e Meus Postos ({favoritos.length + meusPostosIds.length})
          </span>
          {isAdmin && <span style={{ color: "#f76c1e" }}>Admin</span>}
        </div>

        {postosFiltrados.length === 0 ? (
          <div className="empty-state">
            {filtro === "favoritos"
              ? "Voce ainda nao tem postos favoritados ou criados."
              : searchTerm.trim()
              ? `Nenhum posto encontrado para "${searchTerm}"`
              : isAdmin
              ? "Nenhum posto encontrado. Clique no mapa para adicionar!"
              : "Nenhum posto encontrado."}
          </div>
        ) : (
          postosFiltrados.map((posto) => {
            const isMeuPosto = meusPostosIds.includes(posto.id);
            const isFavorito = favoritos.includes(posto.id);

            return (
              <div key={posto.id} className="posto-wrapper">
                <PostoCard
                  posto={posto}
                  onClick={() => handlePostoClick(posto)}
                  onFavoriteToggle={atualizarFavoritos}
                />
                {isMeuPosto && (
                  <span className="badge-criado">Criado por voce</span>
                )}
                {isFavorito && !isMeuPosto && (
                  <span className="badge-favorito">Favorito</span>
                )}
                {isAdmin && (
                  <button
                    className="btn-delete-posto"
                    onClick={() => handleDeletePosto(posto.id, posto.name)}
                  >
                    X
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}