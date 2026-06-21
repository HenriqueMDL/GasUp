import "./navbar.css";
import { useAuth } from "../../contexts/useAuth";

export function Navbar() {
    const { user, logout } = useAuth();

    const photoUrl = user?.photo
        ? (user.photo.startsWith('http') ? user.photo : `https://api-gasup.onrender.com${user.photo}`)
        : null;

    return (
        <header className="navbar">
            <div className="navbar-brand">GasUp</div>
            <div className="navbar-user">
                {photoUrl && (
                    <img
                        src={photoUrl}
                        alt="Foto"
                        className="navbar-user-photo"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                )}
                <span className="navbar-user-name">Olá, {user?.name || "Usuário"}</span>
                <button className="navbar-close" onClick={logout}>✕</button>
            </div>
        </header>
    );
}