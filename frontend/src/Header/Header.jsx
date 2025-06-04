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
    const [userRole, setUserRole] = useState(null);
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

    // Replace the current useEffect with this simpler version
    useEffect(() => {
        const checkAuthStatus = () => {
            const isAuth = authService.isAuthenticated();
            const user = authService.getCurrentUser();
            const role = localStorage.getItem('userRole');

            console.log('Header auth check:', {
                isAuthenticated: isAuth,
                currentUser: user,
                userRole: role
            });

            setIsAuthenticated(isAuth);
            setCurrentUser(user);
            setUserRole(role);
        };

        // Check immediately
        checkAuthStatus();

        // Check every 500ms to catch login state changes
        const interval = setInterval(checkAuthStatus, 500);

        // Listen for storage changes
        const handleStorageChange = () => {
            checkAuthStatus();
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [location]);

    // Function to check if user is admin
    const isAdmin = () => {
        const result = userRole === 'Admin';
        console.log('isAdmin check - userRole:', userRole, 'result:', result);
        return result;
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    // Add logout handler
    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
        setCurrentUser(null);
        setUserRole(null); // Add this line to clear the role
        setDropdownOpen(false); // Close dropdown
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
                                                <Link
                                                    to="/settings"
                                                    className="dropdown-item"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setDropdownOpen(false);
                                                        navigate('/settings');
                                                    }}
                                                >
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

                                    {/* ONLY show Admin Panel button for admin users */}
                                    {isAdmin() && (
                                        <BlackButton text="Admin Panel" onClick={() => navigate('/admin')} />
                                    )}

                                    {/* Remove or comment out this settings button since it's now in the dropdown */}
                                    {/* <button
                                        className="setting-btn"
                                        title="Settings"
                                        onClick={() => navigate('/settings')}
                                    >
                                        <span className="bar bar1"></span>
                                        <span className="bar bar2"></span>
                                        <span className="bar bar1"></span>
                                    </button> */}
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

                            {/* Remove the settings button from here as it's now in the dropdown */}
                            {/* <button
                                className="setting-btn"
                                title="Settings"
                                onClick={() => navigate('/settings')}
                            >
                                <span className="bar bar1"></span>
                                <span className="bar bar2"></span>
                                <span className="bar bar1"></span>
                            </button> */}
                        </div>

                        {/* Mobile Menu */}
                        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                            <ul>
                                <li><Link to="/home" onClick={toggleMobileMenu}>Home</Link></li>
                                <li><Link to="/about" onClick={toggleMobileMenu}>About</Link></li>
                                <li><Link to="/timetable" onClick={toggleMobileMenu}>Timetable</Link></li>
                                <li><Link to="/buy-ticket" onClick={toggleMobileMenu}>Buy Ticket</Link></li>
                                <li><Link to="/check-ticket" onClick={toggleMobileMenu}>Check Ticket</Link></li>
                                <li><Link to="/return-ticket" onClick={toggleMobileMenu}>Return Ticket</Link></li>

                                {authService.isAuthenticated() ? (
                                    <>
                                        <li><Link to="/settings" onClick={toggleMobileMenu}>Settings</Link></li>
                                        <li><Link to="/my-bookings" onClick={toggleMobileMenu}>My Bookings</Link></li>

                                        {/* ONLY show Admin Panel in mobile for admin users */}
                                        {isAdmin() && (
                                            <li><Link to="/admin" onClick={toggleMobileMenu}>Admin Panel</Link></li>
                                        )}

                                        <li><button onClick={handleLogout}>Logout</button></li>
                                    </>
                                ) : (
                                    <>
                                        <li><Link to="/login" onClick={toggleMobileMenu}>Log In</Link></li>
                                        <li><Link to="/register" onClick={toggleMobileMenu}>Sign Up</Link></li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </nav>
                </Row>
            </Container>
        </header>
    );
};

export default Header;