import React, { useState, useEffect, useRef } from 'react';
import { Container, Row } from 'reactstrap';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Settings, TicketsPlane } from 'lucide-react';
import logo from '../images/TAB.gif';
import './header.css';
import '../ui/CustomButtons/settingsbutton.css';
import LongButton from "../ui/CustomButtons/LongButton";

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
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    }

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
                            <a href="#" className="logo">
                                <img src={logo} alt="" />
                            </a>
                        </div>

                        {/* This is for Desktop yo */}
                        <ul className={`nav-links desktop-menu  ${isScrolled ? 'scrolled' : ''}`}>
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

                        <div className={`auth-buttons ${isScrolled ? 'scrolled-button' : ''}`}>
                            <button className="btn btn-outline">
                                <Link to="/login">Log In</Link>
                            </button>
                            <button className="btn btn-primary">
                                <Link to="/register">Sign Up</Link>
                            </button>
                            <button
                                className="setting-btn"
                                // Tooltip (this will show when users hover mouse onto the button)
                                // title="Settings"
                                onClick={() => navigate('/settings')}
                            >
                                <span className="bar bar1"></span>
                                <span className="bar bar2"></span>
                                <span className="bar bar1"></span>
                            </button>
                            {/* <Link to="/settings"></Link> */}
                            <LongButton onClick={() => navigate('/admin')} />
                        </div>

                        {/* This is for mobile header aka menu */}
                        {/* Mobile thì nói là Mobile, aka cc, đấm giờ :c */}
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
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Link to="/login">Log In</Link>
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Link to="/register">Sign Up</Link>
                                    </button>
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