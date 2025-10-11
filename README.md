# Portfolio v1 - Pooja Kanala

A modern, responsive portfolio website built with React, Tailwind CSS, and smooth animations.

## Features

- ✨ Modern, clean design with smooth animations
- 🎨 Custom preloader with Bricolage Grotesque font
- 📱 Fully responsive design
- 🚀 Smooth scrolling and transitions
- 🎭 Framer Motion animations
- 🎯 AOS (Animate On Scroll) effects
- 💫 Glass morphism effects
- 🎨 Gradient backgrounds and modern UI elements

## Tech Stack

- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready motion library
- **AOS** - Animate On Scroll library
- **React Intersection Observer** - For scroll-triggered animations
- **GSAP** - Professional-grade animation library
- **React Spring** - Spring-physics based animations

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Project Structure

```
src/
├── components/
│   ├── Preloader.js      # Custom preloader with name animation
│   ├── Navigation.js     # Responsive navigation with smooth scroll
│   ├── Hero.js          # Hero section with parallax effects
│   ├── About.js         # About section with skill bars
│   ├── Projects.js      # Featured projects showcase
│   └── Contact.js       # Contact form and social links
├── App.js               # Main app component
├── index.js            # React entry point
└── index.css           # Global styles and Tailwind imports
```

## Customization

### Fonts
The project uses Bricolage Grotesque for headings and Inter for body text. Fonts are loaded from Google Fonts in `public/index.html`.

### Colors
The color scheme can be customized in `tailwind.config.js`. The current palette includes:
- Primary: Black (#000000)
- Accent: Blue to Purple gradient
- Background: White and light gray

### Animations
- Preloader: Fade in with scale and slide up effects
- Navigation: Smooth scroll with backdrop blur
- Hero: Parallax background with floating elements
- Sections: Scroll-triggered animations with AOS
- Interactive elements: Hover and tap animations with Framer Motion

## Performance Features

- Optimized images and lazy loading
- Smooth scroll behavior
- Efficient animation libraries
- Responsive design for all devices
- Modern CSS with Tailwind utilities

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available under the [MIT License](LICENSE).
