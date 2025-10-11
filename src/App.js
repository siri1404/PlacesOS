import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from './components/Preloader';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const imageColumnsRef = useRef([]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isLoading) {
      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;

        const scrollThreshold1 = windowHeight * 0.3;
        const scrollThreshold2 = windowHeight * 0.6;
        const scrollThreshold3 = windowHeight * 0.9;

        if (imageColumnsRef.current[0]) {
          const progress1 = Math.min(Math.max((scrollTop / scrollThreshold1), 0), 1);
          imageColumnsRef.current[0].style.clipPath = `inset(${100 - (progress1 * 100)}% 0 0 0)`;
        }

        if (imageColumnsRef.current[1]) {
          const progress2 = Math.min(Math.max(((scrollTop - scrollThreshold1) / (scrollThreshold2 - scrollThreshold1)), 0), 1);
          imageColumnsRef.current[1].style.clipPath = `inset(${100 - (progress2 * 100)}% 0 0 0)`;
        }

        if (imageColumnsRef.current[2]) {
          const progress3 = Math.min(Math.max(((scrollTop - scrollThreshold2) / (scrollThreshold3 - scrollThreshold2)), 0), 1);
          imageColumnsRef.current[2].style.clipPath = `inset(${100 - (progress3 * 100)}% 0 0 0)`;
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();

      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isLoading]);

  return (
    <div className="App">
      <AnimatePresence>
        {isLoading && (
          <Preloader onComplete={handlePreloaderComplete} />
        )}
      </AnimatePresence>

      {!isLoading && (
        <>
          <div className="fixed top-0 left-0 w-full h-screen bg-white">
            <div className="absolute top-0 left-0 w-full h-full flex">
              <motion.div
                className="w-1/3 h-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 1.0
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                  alt="Mountain landscape"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="w-1/3 h-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 1.1
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop"
                  alt="Forest path"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.div
                className="w-1/3 h-full"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  scale: 1
                }}
                transition={{
                  duration: 1.2,
                  ease: "easeOut",
                  delay: 1.2
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop"
                  alt="Ocean waves"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full flex pointer-events-none">
              <div
                ref={el => imageColumnsRef.current[0] = el}
                className="w-1/3 h-full overflow-hidden"
                style={{ clipPath: 'inset(100% 0 0 0)', transition: 'clip-path 0.1s ease-out' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&h=600&fit=crop"
                  alt="New landscape 1"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                ref={el => imageColumnsRef.current[1] = el}
                className="w-1/3 h-full overflow-hidden"
                style={{ clipPath: 'inset(100% 0 0 0)', transition: 'clip-path 0.1s ease-out' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop"
                  alt="New landscape 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                ref={el => imageColumnsRef.current[2] = el}
                className="w-1/3 h-full overflow-hidden"
                style={{ clipPath: 'inset(100% 0 0 0)', transition: 'clip-path 0.1s ease-out' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop"
                  alt="New landscape 3"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <motion.div
              className="absolute top-1/2 left-0 right-0 z-10 text-center transform -translate-y-1/2"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1
              }}
              transition={{
                duration: 1.2,
                ease: "easeOut",
                delay: 0.8
              }}
            >
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bricolage font-normal text-white mb-6">
                Pooja Kanala
              </h1>
            </motion.div>

          </div>

          <div style={{ height: '250vh' }}>
            <div style={{ height: '200vh' }}></div>
            <div className="min-h-screen bg-white flex items-center justify-center">
              <div className="text-center px-4">
                <h2 className="text-4xl font-bricolage font-bold text-black mb-4">
                  Next Page
                </h2>
                <p className="text-xl text-gray-600">
                  This is the content that appears after the image reveal
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;