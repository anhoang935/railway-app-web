import React from 'react';
import { motion } from 'framer-motion';
import { Train, Award, Users } from 'lucide-react';
import '../styles/about.css';

import TestImage from '../images/BelugaCat.jpg';
import TestBG from '../images/TestTrain.png';

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section
        className="about-hero"
        style={{ backgroundImage: 'linear-gradient(45deg, var(--primary-color), var(--secondary-color))' }}
      >
        <div className="hero-overlay">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Railway Management System
          </motion.h1>
          <motion.p
            className="hero-tagline"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Streamlining railway operations for a better travel experience.
          </motion.p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="about-section">
        <motion.div
          className="section-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">Our Story & Target</h2>
          <p className="section-text">
            Established with a vision to modernize railway operations, our system integrates real-time scheduling, efficient ticketing, and seamless communication between stations and trains. We are dedicated to using innovative technology to enhance travel experiences for both passengers and operators.
          </p>
        </motion.div>
      </section>

      {/* Our Mission Section */}
      <section className="about-section about-mission">
        <motion.div
          className="section-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">Our Mission</h2>
          <p className="section-text">
            Our mission is to empower railway networks with cutting-edge solutions that ensure efficiency, safety, and reliability. We strive to reduce delays and improve connectivity, making every journey smoother and more enjoyable.
          </p>
        </motion.div>
      </section>

      {/* Team Section */}
      <section className="about-team">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Meet Our Team
        </motion.h2>
        <div className="team-grid">
          <motion.div
            className="team-member"
          // initial={{ opacity: 0, y: 20 }}
          // whileInView={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5 }}
          >
            <div
              className="team-photo"
              style={{ backgroundImage: `url(${TestImage})` }}
            ></div>
            <h3>Member 1</h3>
            <p>Project Manager &amp; Backend Developer</p>
          </motion.div>
          <motion.div
            className="team-member"
          // initial={{ opacity: 0, y: 20 }}
          // whileInView={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div
              className="team-photo"
              style={{ backgroundImage: `url(${TestImage})` }}
            ></div>
            <h3>Member 2</h3>
            <p>Frontend Developer &amp; UI/UX Designer</p>
          </motion.div>
          <motion.div
            className="team-member"
          // initial={{ opacity: 0, y: 20 }}
          // whileInView={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div
              className="team-photo"
              style={{ backgroundImage: `url(${TestImage})` }}
            ></div>
            <h3>Member 3</h3>
            <p>Database Administrator &amp; DevOps Engineer</p>
          </motion.div>
          <motion.div
            className="team-member"
          // initial={{ opacity: 0, y: 20 }}
          // whileInView={{ opacity: 1, y: 0 }}
          // transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div
              className="team-photo"
              style={{ backgroundImage: `url(${TestImage})` }}
            ></div>
            <h3>Member 4</h3>
            <p>QA Engineer &amp; Technical Writer</p>
          </motion.div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="about-achievements">
        <motion.div
          className="achievement-content"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <h2 className="section-title">Our Achievements</h2>
          <div className="achievements-grid">
            <div className="achievement-card">
              <Train className="achievement-icon" size={32} />
              <h3>500+ Trains Managed</h3>
              <p>Seamless control over extensive train networks.</p>
            </div>
            <div className="achievement-card">
              <Award className="achievement-icon" size={32} />
              <h3>Industry Awards</h3>
              <p>Recognized for innovative solutions and excellence.</p>
            </div>
            <div className="achievement-card">
              <Users className="achievement-icon" size={32} />
              <h3>1000+ Happy Clients</h3>
              <p>Trusted by passengers and operators alike.</p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default About;
