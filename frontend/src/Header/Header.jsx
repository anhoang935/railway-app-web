import React, { useState, useEffect, useRef } from 'react';
import { Container, Row } from 'reactstrap';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Heart, Settings, TicketsPlane } from 'lucide-react';
import logo from '../images/TAB.gif';
import { motion } from 'framer-motion';
import './header.css';

const nav_links = [
    { path: '/home', display: 'Home' },
    { path: '/about', display: 'About' },
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

    const toggleMobileMenu = ( )=> {
        setMobileMenuOpen(!isMobileMenuOpen);
    }
    
    return(
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
                        <ul className={`nav-links ${isScrolled ? 'scrolled' : ''}`}>
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
                        <div className="auth-buttons">
                            <button className="btn btn-outline">Log In</button>
                            <button className="btn btn-primary">Sign Up</button>
                        </div>
                    </nav>
                </Row>
            </Container>
        </header>
    );
};
  
export default Header;