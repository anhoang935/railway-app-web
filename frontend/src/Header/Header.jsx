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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false); // Add dedicated admin state
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Add the missing toggleMobileMenu function
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

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

    // Stable admin state calculation
    useEffect(() => {
        const calculateAdminStatus = () => {
            if (authLoading) {
                setIsAdminUser(false);
                return;
            }

            const hasToken = !!localStorage.getItem('authToken');
            const hasUserId = !!localStorage.getItem('userId');
            const isFullyAuth = authService.isAuthenticated();
            const role = localStorage.getItem('userRole');

            // Check if we're on login-related pages
            const isOnAuthPages = ['/login', '/register', '/forgot-password', '/verify-email'].some(
                path => location.pathname.includes(path)
            );

            const adminStatus = hasToken && hasUserId && isFullyAuth && currentUser && role === 'Admin' && !isOnAuthPages;
            setIsAdminUser(adminStatus);
        };

        calculateAdminStatus();
    }, [authLoading, isAuthenticated, currentUser, userRole, location.pathname]);

    // Simplified auth checking with debouncing
    useEffect(() => {
        let timeoutId;
        let intervalId;
        let isInitialLoad = true;

        const checkAuthStatus = () => {
            if (isInitialLoad) {
                setAuthLoading(true);
            }

            timeoutId = setTimeout(() => {
                const isAuth = authService.isAuthenticated();
                const user = authService.getCurrentUser();
                const role = localStorage.getItem('userRole');

                // Batch state updates to prevent multiple renders
                const updates = {};

                if (isAuthenticated !== isAuth) {
                    updates.isAuthenticated = isAuth;
                }
                if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
                    updates.currentUser = user;
                }
                if (userRole !== role) {
                    updates.userRole = role;
                }

                // Only update if there are actual changes
                if (Object.keys(updates).length > 0) {
                    if (updates.hasOwnProperty('isAuthenticated')) setIsAuthenticated(updates.isAuthenticated);
                    if (updates.hasOwnProperty('currentUser')) setCurrentUser(updates.currentUser);
                    if (updates.hasOwnProperty('userRole')) setUserRole(updates.userRole);
                }

                if (isInitialLoad) {
                    setAuthLoading(false);
                    isInitialLoad = false;
                }
            }, isInitialLoad ? 300 : 0);
        };

        // Initial check
        checkAuthStatus();

        // Less frequent interval checks
        intervalId = setInterval(() => {
            checkAuthStatus();
        }, 10000); // Check every 10 seconds instead of 5

        // Listen for storage changes
        const handleStorageChange = () => {
            setTimeout(checkAuthStatus, 100);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Remove all dependencies to prevent unnecessary re-runs

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
                ? 'bg-white/95 backdrop-blur-sm shadow-lg'
                : 'bg-white/70 backdrop-blur-sm'
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
                                <>
                                    {/* User dropdown */}
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

                                    {/* Use isAdminUser state instead of isAdmin() function */}
                                    {isAdminUser && (
                                        <BlackButton text="Admin Panel" onClick={() => navigate('/admin')} />
                                    )}
                                </>
                            ) : (
                                // Show login/register when not authenticated
                                <>
                                    <button className="btn btn-outline" onClick={handleLogin}>
                                        Log In
                                    </button>
                                    <button className="btn btn-primary" onClick={handleRegister}>
                                        Sign Up
                                    </button>
                                </>
                            )}
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

                                        {/* Use isAdminUser state in mobile menu too */}
                                        {isAdminUser && (
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