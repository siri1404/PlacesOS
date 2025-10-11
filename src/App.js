import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from './components/Preloader';
import Navigation from './components/Navigation';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const imageColumnsRef = useRef([]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  // Setup scroll reveal effect
  useEffect(() => {
    if (!isLoading) {
      // Create scrollable content
      const scrollContent = document.createElement('div');
      scrollContent.style.height = '200vh';
      scrollContent.style.position = 'absolute';
      scrollContent.style.top = '100vh';
      scrollContent.style.left = '0';
      scrollContent.style.width = '100%';
      scrollContent.style.pointerEvents = 'none';
      document.body.appendChild(scrollContent);

      // Simple scroll event listener
      const handleScroll = () => {
        const scrollTop = window.pageYOffset;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / maxScroll, 1);
        
        console.log('Scroll Progress:', progress);
        console.log('Scroll Top:', scrollTop);
        console.log('Max Scroll:', maxScroll);
        
        // Column 1: 0-50% progress
        if (progress >= 0 && progress <= 0.5) {
          const firstColumnProgress = (progress / 0.5) * 100;
          console.log('Column 1 Progress:', firstColumnProgress);
          if (imageColumnsRef.current[0]) {
            imageColumnsRef.current[0].style.clipPath = `inset(${100 - firstColumnProgress}% 0 0 0)`;
          }
        }
        
        // Column 2: 25-75% progress
        if (progress >= 0.25) {
          const secondColumnProgress = Math.min(((progress - 0.25) / 0.5) * 100, 100);
          console.log('Column 2 Progress:', secondColumnProgress);
          if (imageColumnsRef.current[1]) {
            imageColumnsRef.current[1].style.clipPath = `inset(${100 - secondColumnProgress}% 0 0 0)`;
          }
        }
        
        // Column 3: 50-100% progress
        if (progress >= 0.5) {
          const thirdColumnProgress = Math.min(((progress - 0.5) / 0.5) * 100, 100);
          console.log('Column 3 Progress:', thirdColumnProgress);
          if (imageColumnsRef.current[2]) {
            imageColumnsRef.current[2].style.clipPath = `inset(${100 - thirdColumnProgress}% 0 0 0)`;
          }
        }
        
        // After images are revealed (progress > 1), move nav bar
        if (progress > 1) {
          const navTransitionProgress = Math.min((progress - 1) * 2, 1); // 0-1 over next 50% scroll
          console.log('Nav Transition Progress:', navTransitionProgress);
          
          // Move nav bar up and right, then stick at top
          const navBar = document.querySelector('nav');
          if (navBar) {
            if (navTransitionProgress < 0.5) {
              // Phase 1: Move up and right
              const moveUp = navTransitionProgress * 2 * 100; // 0 to 100px up
              const moveRight = navTransitionProgress * 2 * 200; // 0 to 200px right
              navBar.style.transform = `translateY(-${moveUp}px) translateX(${moveRight}px)`;
              navBar.style.position = 'absolute';
            } else {
              // Phase 2: Stick at top
              navBar.style.position = 'fixed';
              navBar.style.top = '0';
              navBar.style.right = '0';
              navBar.style.transform = 'none';
            }
          }
        }
      };

      // Add scroll listener
      window.addEventListener('scroll', handleScroll);
      
      // Test scroll immediately
      setTimeout(() => {
        console.log('Testing scroll...');
        handleScroll();
      }, 200);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.body.removeChild(scrollContent);
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
        <div className="preloader">
          {/* 3 Images Section - Top to 60% height */}
          <div className="absolute top-0 left-0 w-full h-3/5 flex">
            {/* Original Images */}
            <motion.div 
              className="w-1/3 h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.3 
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
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.4 
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
              animate={{ opacity: 1 }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                delay: 0.5 
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop" 
                alt="Ocean waves"
                className="w-full h-full object-cover"
              />
            </motion.div>

          </div>

          {/* New Images that reveal on scroll */}
          <div className="absolute top-0 left-0 w-full h-3/5 flex">
            <div 
              ref={el => imageColumnsRef.current[0] = el}
              className="w-1/3 h-full overflow-hidden"
              style={{ clipPath: 'inset(100% 0 0 0)' }}
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
              style={{ clipPath: 'inset(100% 0 0 0)' }}
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
              style={{ clipPath: 'inset(100% 0 0 0)' }}
            >
              <img 
                src="https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=600&fit=crop" 
                alt="New landscape 3"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Navigation Bar */}
          <Navigation />

          {/* Name Animation */}
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial={{ opacity: 1 }}
            animate={{ 
              opacity: 1,
              scale: 1.4,
              x: -300, // Move left (moved right from -400)
              y: 300   // Move down (reduced to keep in view)
            }}
            transition={{ 
              duration: 1.2, 
              ease: "easeOut",
              delay: 0.3 
            }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bricolage font-normal text-black mb-6">
              Pooja Kanala
            </h1>
          </motion.div>

          {/* Next Page Content */}
          <div className="absolute top-full left-0 w-full h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-4xl font-bricolage font-bold text-black mb-4">
                Next Page
              </h2>
              <p className="text-xl text-gray-600">
                This is the content that appears after the image reveal
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
