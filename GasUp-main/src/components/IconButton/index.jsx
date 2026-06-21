import "./iconButton.css";

export const IconButton = ({
  icon,
  label,
  onClick,
  className = "",
  disabled = false,
  title = "",
}) => {
  return (
    <button
      className={`icon-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      aria-label={label}
    >
      {typeof icon === "string" ? (
        <img src={icon} alt={label} className="icon-button-image" />
      ) : (
        <span className="icon-button-emoji">{icon}</span>
      )}
      {label && <span className="icon-button-label">{label}</span>}
    </button>
  );
};
