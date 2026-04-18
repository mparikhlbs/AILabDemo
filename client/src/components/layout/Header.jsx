import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link className="brand" to={isAuthenticated ? '/dashboard' : '/'}>
          JD Quiz
        </Link>

        <nav className="header-nav">
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/quiz/new">New Quiz</NavLink>
              <NavLink to="/history">History</NavLink>
              <span className="header-user">{user?.username}</span>
              <button type="button" className="header-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;