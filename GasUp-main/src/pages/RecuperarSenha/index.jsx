import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./recuperarSenha.css";
import logo from "../../assets/Logo.png";

export function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setMensagem("Se existir uma conta com esse e-mail, as instruções de recuperação serão enviadas.");
  };

  return (
    <div className="recuperar-page">
      <div className="recuperar-container">
        <button type="button" className="btn-back" onClick={() => navigate("/login")}>←</button>
        <div className="recuperar-brand">
          <img src={logo} alt="Ícone de bomba" className="recuperar-logo" />
        </div>
        <h1 className="recuperar-title">Recuperar senha</h1>
        <p className="recuperar-subtitle">Informe seu e-mail para receber as instruções de acesso.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {mensagem && <p className="recuperar-message">{mensagem}</p>}

          <button type="submit" className="btn-primary recuperar-btn">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}