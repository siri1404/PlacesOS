import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [showNameAnimation, setShowNameAnimation] = useState(false);

  useEffect(() => {
    // First reveal the name
    const revealTimer = setTimeout(() => {
      setShowNameAnimation(true);
    }, 1000);

    // Then complete the preloader after name animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4000); // Total time: 1s reveal + 1.5s animation + 1.5s delay

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="preloader">
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bricolage font-normal text-black mb-6 whitespace-nowrap"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            scale: showNameAnimation ? 1.3 : 1,
            x: showNameAnimation ? -700 : 0,
            y: showNameAnimation ? 200 : 0
          }}
          transition={{ 
            duration: showNameAnimation ? 1.5 : 1, 
            delay: showNameAnimation ? 0 : 0.2, 
            ease: "easeInOut" 
          }}
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            position: "absolute"
          }}
        >
          Pooja Kanala
        </motion.h1>
      </motion.div>
    </div>
  );
};

export default Preloader;