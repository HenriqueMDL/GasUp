import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { signIn } from "../../services/authService";
import "./login.css";
import logo from "../../assets/Logo.png";

export const Logo = ({ showSubtitle = false }) => {
  return (
    <div className="login-brand">
      <h1 className="login-title">GasUp</h1>
      <img src={logo} alt="Ícone de bomba" className="login-pump-icon" />
      {showSubtitle && <div className="logo-subtitle">Abastecimento Inteligente</div>}
    </div>
  );
};

export function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const data = await signIn(email, senha);
      console.log("Dados do login:", data); // Debug
      
      // Passa o usuário completo para o contexto
      login(data.token, data.user);
      navigate("/mapa");
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <Logo />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Usuário ou E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {erro && <p className="error-message">{erro}</p>}

          <div className="link-row">
            <Link to="/recuperar-senha" className="link">Esqueceu senha?</Link>
            <Link to="/register" className="link">Cadastrar</Link>
          </div>

          <button type="submit" className="btn-primary login-submit-button" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}