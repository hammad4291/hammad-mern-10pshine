import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = localStorage.getItem("userRole") || "User";

  // Use state for values that can change dynamically via the profile API
  const [username, setUsername] = useState(
    localStorage.getItem("username") || "",
  );
  const [email, setEmail] = useState(localStorage.getItem("userEmail") || "");

  // Synchronize UI values dynamically when changed on the Profile page
  useEffect(() => {
    const syncProfileData = () => {
      setUsername(localStorage.getItem("username") || "");
      setEmail(localStorage.getItem("userEmail") || "");
    };

    window.addEventListener("storage", syncProfileData);
    return () => window.removeEventListener("storage", syncProfileData);
  }, []);

  const linksByRole = {
    Admin: [
      { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
      { name: "Tasks Control", path: "/admin/tasks", icon: "📋" },
      { name: "Create Task", path: "/tasks/new", icon: "➕" },
      { name: "Profile", path: "/profile", icon: "👤" },
    ],
    User: [
      { name: "Dashboard", path: "/dashboard", icon: "🎛️" },
      { name: "Tasks", path: "/tasks", icon: "🗂️" },
      { name: "New Task", path: "/tasks/new", icon: "➕" },
      { name: "Profile", path: "/profile", icon: "👤" }, // 🚀 Pointing to generic profile route
    ],
  };

  const activeLinks = linksByRole[userRole] || linksByRole["User"];

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="responsive-navbar">
      {/* Top Brand Banner Header */}
      <div className="navbar-brand">
        <div className="brand-logo-box">
          <span className="brand-icon">✓</span>
        </div>
        <h2 className="brand-text">
          TaskFlow
          {userRole === "Admin" && <span className="admin-badge">Admin</span>}
        </h2>
        {/* Mobile top logout icon trigger */}
        <button
          onClick={handleSignOut}
          className="mobile-logout-icon-btn"
          title="Sign out"
        >
          ➔
        </button>
      </div>

      {/* Middle Nav Links */}
      <nav className="navbar-navigation">
        <ul className="nav-list">
          {activeLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-item-link ${isActive ? "active" : ""}`}
                >
                  <span className="nav-item-icon">{link.icon}</span>
                  <span className="nav-item-text">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Profile Footer */}
      <div className="navbar-footer-profile">
        <div className="profile-info-block">
          <p className="profile-username">{username}</p>
          <p className="profile-email">{email}</p>
        </div>
        <button onClick={handleSignOut} className="signout-action-btn">
          <span className="signout-icon">➔</span> Sign out
        </button>
      </div>
    </aside>
  );
}
