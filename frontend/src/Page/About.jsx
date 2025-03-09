import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import teamMemberImage from '../images/BelugaCat.jpg';
// import teamMemberImage1 from '../images/BelugaCat.jpg';
// import teamMemberImage2 from '../images/BelugaCat.jpg';
// import teamMemberImage3 from '../images/BelugaCat.jpg';
// import teamMemberImage4 from '../images/BelugaCat.jpg';
import backgroundImage from '../images/TestTrain.png';
import aboutVideo from '../images/aboutbg.mp4';

import '../styles/about.css';

const About = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const teamMembers = [
    {
      name: "Tran Thanh Binh",
      role: "Project Manager",
      image: teamMemberImage,
      description: "Oversees the integration of advanced railway management solutions to ensure safe, timely, and efficient operations."
    },
    {
      name: "Hoang Thien An",
      role: "Data Analyst & Developer",
      image: teamMemberImage,
      description: "Specializes in real-time train scheduling and performance analytics to optimize our rail network operations."
    },
    {
      name: "Nguyen Minh Thuan",
      role: "System Architect",
      image: teamMemberImage,
      description: "Develops robust and scalable solutions for managing complex railway operations and control systems."
    },
    {
      name: "Pham Vu Hoang Bao",
      role: "R&D Specialist",
      image: teamMemberImage,
      description: "Dedicated to researching innovative technologies for ticketing, scheduling, and overall system efficiency."
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden -z-10">
      <div className="absolute inset-0 -z-10">
      </div>
      <div className="h-16 md:h-24"></div>    {/* separate the header and the video */}

      {/* Video Section */}
      <section className="video-section relative w-full">
        <div className="absolute inset-0 z-10">
          {!isVideoLoaded && (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <p>Loading video...</p>
            </div>
          )}
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            onLoadedData={() => setIsVideoLoaded(true)}
            loading="lazy"
          >
            <source src={aboutVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative pt-20 pb-12 md:py-20 z-20 space-y-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-3xl font-bold mb-6 text-gray-800">
              Our Story
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Our railway management system was founded with a vision to revolutionize rail operations. By leveraging innovative technology, we enhance safety, efficiency, and connectivity across our network.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 md:py-20 z-10 space-y-6">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl md:text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                We are committed to modernizing rail transport by integrating state-of-the-art technology with industry best practices. Our mission is to streamline train scheduling, enhance passenger services, and maintain the highest standards of safety and reliability.
              </p>
              <div className="space-y-4">
                {[
                  "Optimize train scheduling and logistics",
                  "Enhance operational safety and reliability",
                  "Streamline ticketing and passenger services",
                  "Drive innovation in railway technology"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-3" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] bg-gray-200 rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl">
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-300"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              ></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 md:py-20 bg-gray-50 z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-3xl font-bold mb-4 text-gray-800">Meet Our Team</h2>
            <p className="text-gray-600">The dedicated professionals driving innovation in railway management</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 z-10">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl z-10"
              >
                <div className="team-image-container relative h-48 bg-gray-200 z-10">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-300 transform hover:scale-110 hover:shadow-xl z-10"
                    style={{ backgroundImage: `url(${member.image})` }}
                  ></div>
                </div>
                <div className="p-6 z-10">
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-blue-600 mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors' Logos */}
      {/* <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-3xl font-bold mb-6 text-gray-800">Our Trusted Partners</h2>
          <div className="flex flex-wrap justify-center">
            <img src={EtihadAirways} alt="Etihad Airways" style={{ height: '5rem', width: 'auto' }} className="mx-2" />
            <img src={QatarAirways} alt="Qatar Airways" style={{ height: '4rem', width: 'auto' }} className="logo mx-2" />
            <img src={AmericanAirlines} alt="American Airlines" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={VietjetAir} alt="Vietjet Air" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={VietnamAirlines} alt="Vietnam Airlines" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
          </div>
          <div className="flex flex-wrap justify-center">
            <img src={Trivago} alt="Trivago" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={Traveloka} alt="Traveloka" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={Expedia} alt="Expedia" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={Agoda} alt="Agoda" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
            <img src={Trip} alt="Trip.com" style={{ height: '5rem', width: 'auto' }} className="logo mx-2" />
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default About;
