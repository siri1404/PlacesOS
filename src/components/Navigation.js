import React from 'react';
import { motion } from 'framer-motion';

const Navigation = () => {
  return (
    <motion.nav
      className="absolute left-0 right-0 z-20 px-4 sm:px-6 lg:px-8"
      style={{ top: 'calc(60vh + 2rem)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ 
        duration: 1.2, 
        ease: "easeOut",
        delay: 0.3 
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          {/* Left side - Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.5 
            }}
          >
            <a 
              href="#home" 
              className="text-lg font-bricolage font-medium text-black hover:text-gray-600 transition-colors duration-300"
            >
              Home
            </a>
          </motion.div>

          {/* Middle - Projects, Experience, Contact */}
          <div className="flex space-x-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.6 
              }}
            >
              <a 
                href="#projects" 
                className="text-lg font-bricolage font-medium text-black hover:text-gray-600 transition-colors duration-300"
              >
                Projects
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.7 
              }}
            >
              <a 
                href="#experience" 
                className="text-lg font-bricolage font-medium text-black hover:text-gray-600 transition-colors duration-300"
              >
                Experience
              </a>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
                delay: 0.8 
              }}
            >
              <a 
                href="#contact" 
                className="text-lg font-bricolage font-medium text-black hover:text-gray-600 transition-colors duration-300"
              >
                Contact
              </a>
            </motion.div>
          </div>

          {/* Right side - Menu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              delay: 0.9 
            }}
          >
            <button className="text-lg font-bricolage font-medium text-black hover:text-gray-600 transition-colors duration-300">
              Menu
            </button>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;