import "./postoCard.css";
import { useState, useEffect } from "react";
import { isFavorito, adicionarFavorito, removerFavorito } from "../../services/mapService";
import { useAuth } from "../../contexts/useAuth";

export const PostoCard = ({ posto, onClick, onFavoriteToggle }) => {
  const { id, name, prices, distance } = posto;
  const { token } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarFavorito = async () => {
      if (!token) return;
      try {
        const resultado = await isFavorito(token, id);
        setIsFavorite(resultado);
      } catch (error) {
        console.error("Erro ao verificar favorito:", error);
      } finally {
        setLoading(false);
      }
    };
    verificarFavorito();
  }, [token, id]);

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!token) {
      alert("Fac.a login para favoritar postos.");
      return;
    }

    try {
      if (isFavorite) {
        await removerFavorito(token, id);
        setIsFavorite(false);
      } else {
        await adicionarFavorito(token, id);
        setIsFavorite(true);
      }
      if (onFavoriteToggle) {
        onFavoriteToggle();
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="posto-card" onClick={onClick}>
      <div className="posto-card-header">
        <span className="posto-card-name">{name}</span>
        <div className="posto-card-header-right">
          {distance && <span className="posto-card-distance">{distance}</span>}
          <button
            type="button"
            className={`posto-favorite-btn ${isFavorite ? "active" : ""}`}
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={toggleFavorite}
            disabled={loading}
          >
            ★
          </button>
        </div>
      </div>

      <div className="posto-card-prices">
        {prices?.gasolina && (
          <div className="posto-card-price">
            <span className="label">Gasolina</span>
            <span className="value">R$ {parseFloat(prices.gasolina).toFixed(2)} / litro</span>
          </div>
        )}
        {prices?.diesel && (
          <div className="posto-card-price">
            <span className="label">Diesel</span>
            <span className="value">R$ {parseFloat(prices.diesel).toFixed(2)} / litro</span>
          </div>
        )}
        {prices?.etanol && (
          <div className="posto-card-price">
            <span className="label">Etanol</span>
            <span className="value">R$ {parseFloat(prices.etanol).toFixed(2)} / litro</span>
          </div>
        )}
      </div>
    </div>
  );
};