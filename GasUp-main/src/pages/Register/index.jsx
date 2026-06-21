import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import { checkEmailExists, signUp, signIn, uploadPhoto } from "../../services/authService";
import "./register.css";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { login, updateUser } = useAuth();

  const handleFotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErro('Por favor, selecione uma imagem válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErro('A imagem deve ter no máximo 5MB.');
      return;
    }

    setFoto(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewFoto(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverFoto = () => {
    setFoto(null);
    setPreviewFoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }
    
    setLoading(true);
    setUploading(false);

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setErro('Este e-mail já está cadastrado. Faça login ou use outro.');
        setLoading(false);
        return;
      }

      // 1. Cadastra o usuário (sem foto)
      console.log('1. Cadastrando usuário...');
      const user = await signUp(name, email, senha, null);
      console.log('Usuário cadastrado:', user);
      
      // 2. Faz login automaticamente
      console.log('2. Fazendo login automático...');
      const loginData = await signIn(email, senha);
      console.log('Login realizado:', loginData);
      
      // 3. Salva token e usuário no contexto
      login(loginData.token, loginData.user);
      
      // Verifica se o token foi salvo
      const tokenSalvo = localStorage.getItem('token');
      console.log('Token salvo:', tokenSalvo ? 'Sim' : 'Não');
      
      // 4. Se tiver foto, faz upload
      if (foto && tokenSalvo) {
        console.log('3. Enviando foto...');
        setUploading(true);
        const uploadResult = await uploadPhoto(foto);
        console.log('Upload concluído:', uploadResult);
        
      // ATUALIZA O USUÁRIO COM A NOVA FOTO
      const photoUrl = uploadResult.photoUrl || uploadResult;
      updateUser({ photo: photoUrl });
      console.log('Usuário atualizado com foto:', photoUrl);
    }
      
      // 5. Redireciona para o mapa
      navigate("/mapa");
      
    } catch (err) {
      console.error('Erro no cadastro:', err);
      setErro(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <button className="btn-back" onClick={() => navigate("/login")}>←</button>
        <h1 className="logo-small">GasUp</h1>

        <div className="form-group foto-section">
          {previewFoto ? (
            <div className="foto-preview-container">
              <img src={previewFoto} alt="Preview" className="foto-preview" />
              <button
                type="button"
                className="btn-remover-foto"
                onClick={handleRemoverFoto}
              >
                Remover foto
              </button>
            </div>
          ) : (
            <div className="foto-input-wrapper">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="input-file"
                id="foto-input"
              />
              <label htmlFor="foto-input" className="input-file-label">
                <span className="foto-placeholder">📷</span>
              </label>
              <span className="foto-input-text">Foto (opcional)</span>
            </div>
          )}
        </div>

        <h2>Cadastre-se</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nome de Usuário"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="E-mail de usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Digitar Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Confirmar Senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {erro && <p className="error-message">{erro}</p>}

          {uploading && <p className="upload-status">Enviando foto...</p>}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ marginTop: '12px' }} 
            disabled={loading}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  );
}