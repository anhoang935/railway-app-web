import React, { useState, useEffect, useRef } from 'react';
import { Container, Row } from 'reactstrap';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, Settings, CreditCard, History, Bell, ChevronDown, ShoppingCart } from 'lucide-react';
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
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [initialRender, setInitialRender] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Mobile menu toggle function
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    // Close mobile menu when clicking on a link
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Close mobile menu when clicking outside or on dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            
            // Close mobile menu if clicking outside
            if (isMobileMenuOpen && !event.target.closest('.mobile-menu') && !event.target.closest('.mobile-menu-toggle')) {
                setMobileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen, isMobileMenuOpen]);

    // Immediate auth state initialization - run synchronously on mount
    useEffect(() => {
        const initializeAuthState = () => {
            const isAuth = authService.isAuthenticated();
            const user = authService.getCurrentUser();
            const role = localStorage.getItem('userRole');

            // Set all auth states immediately to prevent flashing
            setIsAuthenticated(isAuth);
            setCurrentUser(user);
            setUserRole(role);

            // Calculate admin status immediately
            const hasToken = !!localStorage.getItem('authToken');
            const hasUserId = !!localStorage.getItem('userId');
            const isOnAuthPages = ['/login', '/register', '/forgot-password', '/verify-email'].some(
                path => location.pathname.includes(path)
            );
            const adminStatus = hasToken && hasUserId && isAuth && user && role === 'Admin' && !isOnAuthPages;
            setIsAdminUser(adminStatus);

            setAuthLoading(false);
            setInitialRender(false);
        };

        initializeAuthState();
    }, []); // Run only once on mount

    // Simplified auth checking with reduced frequency
    useEffect(() => {
        if (initialRender) return; // Skip during initial render

        let intervalId;

        const checkAuthStatus = () => {
            const isAuth = authService.isAuthenticated();
            const user = authService.getCurrentUser();
            const role = localStorage.getItem('userRole');

            // Only update if there are actual changes
            if (isAuthenticated !== isAuth) setIsAuthenticated(isAuth);
            if (JSON.stringify(currentUser) !== JSON.stringify(user)) setCurrentUser(user);
            if (userRole !== role) setUserRole(role);
        };

        // Check every 15 seconds instead of 10
        intervalId = setInterval(checkAuthStatus, 15000);

        // Listen for storage changes
        const handleStorageChange = () => {
            setTimeout(checkAuthStatus, 100);
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [initialRender, isAuthenticated, currentUser, userRole]);

    // Admin state calculation - only run when auth data changes
    useEffect(() => {
        if (authLoading || initialRender) return;

        const hasToken = !!localStorage.getItem('authToken');
        const hasUserId = !!localStorage.getItem('userId');
        const isOnAuthPages = ['/login', '/register', '/forgot-password', '/verify-email'].some(
            path => location.pathname.includes(path)
        );

        const adminStatus = hasToken && hasUserId && isAuthenticated && currentUser && userRole === 'Admin' && !isOnAuthPages;
        setIsAdminUser(adminStatus);
    }, [authLoading, isAuthenticated, currentUser, userRole, location.pathname, initialRender]);

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

    // Prevent rendering auth buttons during initial load to avoid flash
    const shouldShowAuthButtons = !authLoading && !initialRender;

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

                        {/* Mobile Menu Toggle Button */}
                        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </div>

                        {/* Desktop Auth Buttons */}
                        <div className={`auth-buttons ${isScrolled ? 'scrolled-buttons' : ''}`}>
                            {shouldShowAuthButtons && (
                                <>
                                    {isAuthenticated ? (
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
                                                            onClick={() => setDropdownOpen(false)}
                                                        >
                                                            <Settings size={16} className="item-icon" />
                                                            <span>Settings</span>
                                                        </Link>
                                                        <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                            <CreditCard size={16} className="item-icon" />
                                                            <span>My Bookings</span>
                                                        </Link>
                                                        <Link to="/checkout" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                                            <ShoppingCart size={16} className="item-icon" />
                                                            <span>Checkout</span>
                                                        </Link>
                                                        <div className="dropdown-divider"></div>
                                                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                                                            <LogOut size={16} className="item-icon" />
                                                            <span>Logout</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {isAdminUser && (
                                                <BlackButton text="Admin Panel" onClick={() => navigate('/admin')} />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-outline" onClick={handleLogin}>
                                                Log In
                                            </button>
                                            <button className="btn btn-primary" onClick={handleRegister}>
                                                Sign Up
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Mobile Menu */}
                        <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                            <div className="mobile-menu-content">
                                <ul className="mobile-nav-links">
                                    {/* Navigation links */}
                                    {nav_links.map((item, index) => (
                                        <li key={index}>
                                            <NavLink
                                                to={item.path}
                                                className={({ isActive }) =>
                                                    `mobile-nav-link ${isActive ? 'active-mobile-link' : ''}`}
                                                onClick={closeMobileMenu}
                                            >
                                                {item.display}
                                            </NavLink>
                                        </li>
                                    ))}

                                    {/* Auth-dependent links */}
                                    {shouldShowAuthButtons && (
                                        <>
                                            {isAuthenticated ? (
                                                <>
                                                    <li className="mobile-user-info">
                                                        Welcome, {currentUser?.username || 'User'}!
                                                    </li>
                                                    <li>
                                                        <Link to="/settings" className="mobile-nav-link" onClick={closeMobileMenu}>
                                                            <Settings size={16} className="mobile-link-icon" />
                                                            Settings
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/my-bookings" className="mobile-nav-link" onClick={closeMobileMenu}>
                                                            <CreditCard size={16} className="mobile-link-icon" />
                                                            My Bookings
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/checkout" className="mobile-nav-link" onClick={closeMobileMenu}>
                                                            <ShoppingCart size={16} className="mobile-link-icon" />
                                                            Checkout
                                                        </Link>
                                                    </li>

                                                    {isAdminUser && (
                                                        <li>
                                                            <Link to="/admin" className="mobile-nav-link admin-link" onClick={closeMobileMenu}>
                                                                <Settings size={16} className="mobile-link-icon" />
                                                                Admin Panel
                                                            </Link>
                                                        </li>
                                                    )}

                                                    <li>
                                                        <button className="mobile-nav-link logout-link" onClick={() => {
                                                            handleLogout();
                                                            closeMobileMenu();
                                                        }}>
                                                            <LogOut size={16} className="mobile-link-icon" />
                                                            Logout
                                                        </button>
                                                    </li>
                                                </>
                                            ) : (
                                                <li className="mobile-auth-buttons">
                                                    <button className="btn btn-outline mobile-auth-btn" onClick={() => {
                                                        handleLogin();
                                                        closeMobileMenu();
                                                    }}>
                                                        Log In
                                                    </button>
                                                    <button className="btn btn-primary mobile-auth-btn" onClick={() => {
                                                        handleRegister();
                                                        closeMobileMenu();
                                                    }}>
                                                        Sign Up
                                                    </button>
                                                </li>
                                            )}
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </nav>
                </Row>
            </Container>
        </header>
    );
};

export default Header;