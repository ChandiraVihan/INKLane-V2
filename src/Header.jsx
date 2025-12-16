import './Header.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

function Header(){
    const { isLoggedIn, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="header-container">
            <h1 className="header-style">InkLane</h1>
            {isLoggedIn && (
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            )}
        </div>
    );
}

export default Header;