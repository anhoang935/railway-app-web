import React, { useState, useEffect, useRef } from 'react';
import { Container, Row } from 'reactstrap';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, CreditCard, History, Bell, ChevronDown } from 'lucide-react';
import logo from '../images/TAB.gif';
import authService from '../data/Service/authService';
import './header.css';
// import '../ui/CustomButtons/settingsbutton.css';

// Button Options
// import LongButton from "../ui/CustomButtons/LongButton";
import BlackButton from "../ui/CustomButtons/BlackButton";

const nav_links = [
    { path: '/home', display: 'Home' },
    { path: '/about', display: 'About' },
    { path: '/timetable', display: 'Timetable' },
    { path: '/buy-ticket', display: 'Buy Ticket' },
    { path: '/check-ticket', display: 'Check Ticket' },
    { path: '/return-ticket', display: 'Return Ticket' },
];

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Add this state
    const [currentUser, setCurrentUser] = useState(null); // Add this state
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Add this useEffect to check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = authService.isAuthenticated();
            const user = authService.getCurrentUser();
            setIsAuthenticated(authStatus);
            setCurrentUser(user);
        };

        checkAuth();

        // Check auth status when location changes
        checkAuth();
    }, [location]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    // Add logout handler
    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
        navigate('/home');
    };

    // Add login handler
    const handleLogin = () => {
        navigate('/login');
    };

    // Add register handler
    const handleRegister = () => {
        navigate('/register');
    };

    return (
        <header
            className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-white/30 backdrop-blur-sm shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <Container>
                <Row>
                    <nav className="navbar">
                        <div className='logo-container'>
                            <Link to="/home" className="logo">
                                <img src={logo} alt="TAB Logo" />
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <ul className={`nav-links desktop-menu ${isScrolled ? 'scrolled' : ''}`}>
                            {nav_links.map((item, index) => (
                                <li className='nav__item' key={index}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `nav-link ${isScrolled ? 'scrolled-link' : ''} 
                                        ${isActive ? 'active-nav-link' : ''}`}
                                    >
                                        {item.display}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        {/* Menu icon for mobile */}
                        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </div>

                        {/* Auth Buttons */}
                        <div className={`auth-buttons ${isScrolled ? 'scrolled-button' : ''}`}>
                            {isAuthenticated ? (
                                // Show user info and logout when authenticated
                                <>
                                    <div className="user-dropdown-container" ref={dropdownRef}>
                                        <button
                                            className="user-dropdown-trigger"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <span className="welcome-text">
                                                Welcome, {currentUser?.username || 'User'}!
                                            </span>
                                            <ChevronDown size={16} className={`ml-1 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownOpen && (
                                            <div className="user-dropdown-menu">
                                                <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                    <Settings size={16} className="item-icon" />
                                                    <span>Settings</span>
                                                </Link>
                                                <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                    <CreditCard size={16} className="item-icon" />
                                                    <span>My Bookings</span>
                                                </Link>
                                                <div className="dropdown-divider"></div>
                                                <button className="dropdown-item logout-item" onClick={handleLogout}>
                                                    <LogOut size={16} className="item-icon" />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Button Options */}
                                    {/* <LongButton onClick={() => navigate('/admin')} /> */}
                                    <BlackButton text="Admin Panel" onClick={() => navigate('/admin')} />
                                </>
                            ) : (
                                // Show login/register when not authenticated
                                <>
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleLogin}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleRegister}
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}

                            <button
                                className="setting-btn"
                                title="Settings"
                                onClick={() => navigate('/settings')}
                            >
                                <span className="bar bar1"></span>
                                <span className="bar bar2"></span>
                                <span className="bar bar1"></span>
                            </button>
                        </div>

                        {/* Mobile Menu */}
                        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                            <ul className='mobile-nav-links'>
                                {nav_links.map((item, index) => (
                                    <li className='nav__item' key={index}>
                                        <NavLink
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `mobile-nav-link ${isActive ? 'active-mobile-link' : ''}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            {item.display}
                                        </NavLink>
                                    </li>
                                ))}
                                <div className="mobile-auth-buttons">
                                    {isAuthenticated && (
                                        <div className="mobile-user-dropdown">
                                            <Link to="/settings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                                <Settings size={16} className="mr-2" />
                                                Settings
                                            </Link>
                                            <Link to="/my-bookings" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                                                <CreditCard size={16} className="mr-2" />
                                                My Bookings
                                            </Link>
                                            <button
                                                className="mobile-nav-link text-red-500"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    handleLogout();
                                                }}
                                            >
                                                <LogOut size={16} className="mr-2" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        className="setting-btn"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            navigate('/settings');
                                        }}
                                        title="Settings"
                                    >
                                        <span className="bar bar1"></span>
                                        <span className="bar bar2"></span>
                                        <span className="bar bar1"></span>
                                    </button>
                                </div>
                            </ul>
                        </div>
                    </nav>
                </Row>
            </Container>
        </header>
    );
};

export default Header;