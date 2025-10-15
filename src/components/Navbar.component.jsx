import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import './Navbar.css';

function Navbar({ user, cartCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          4everLilys Wood Crafts
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
          <span className={isMenuOpen ? 'bar active' : 'bar'}></span>
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/build-custom" className="nav-link" onClick={closeMenu}>
              Build Custom Gift
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/checkout" className="nav-link" onClick={closeMenu}>
              Cart ({cartCount})
            </Link>
          </li>
          {user ? (
            <>
              <li className="nav-item">
                <Link to="/profile" className="nav-link" onClick={closeMenu}>
                  Profile
                </Link>
              </li>
              <li className="nav-item">
                <button className="nav-link logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;