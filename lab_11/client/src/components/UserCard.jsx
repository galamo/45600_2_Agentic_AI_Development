function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * @param {{
 *   user: {
 *     id: number | string;
 *     name: string;
 *     email: string;
 *     avatar?: string;
 *     role?: string;
 *   };
 *   onClick?: () => void;
 * }} props
 */
export default function UserCard({ user, onClick }) {
  const { name, email, avatar, role } = user;
  const initials = getInitials(name);

  return (
    <article
      className={`user-card${onClick ? " user-card--clickable" : ""}`}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {avatar ? (
        <img className="user-card-avatar" src={avatar} alt={name} loading="lazy" />
      ) : (
        <div className="user-card-avatar user-card-avatar--initials" aria-hidden="true">
          {initials}
        </div>
      )}

      <div className="user-card-info">
        <h3 className="user-card-name">{name}</h3>
        <p className="user-card-email">{email}</p>
        {role && <span className="user-card-role">{role}</span>}
      </div>
    </article>
  );
}
