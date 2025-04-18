import React from 'react'
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header'
import Routers from '../router/Routers'
import Footer from '../Footer/Footer'

const Layout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <>
      {/* The Header & Footer will not be rendered in the Admin page */}
      {!isAdmin && <Header />}
      <Routers />
      {!isAdmin && <Footer />}
    </>
  )
}

export default Layout