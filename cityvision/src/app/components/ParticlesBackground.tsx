'use client';

import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim'; // smaller bundle size

export default function ParticlesBackground() {
  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine); // load slim engine
  };

  return (
    <Particles
  id="tsparticles"
  init={particlesInit}
  options={{
    fullScreen: { enable: false }, // Disable fullscreen
    background: { color: { value: 'transparent' } }, // No background override
    particles: {
      number: { value: 80, density: { enable: true, area: 800 } },
      color: { value: '#ffffff' },
      links: {
        enable: true,
        distance: 150,
        color: '#ffffff',
        opacity: 0.4,
        width: 1.5,
      },
      move: {
        enable: true,
        speed: 1,
        direction: 'none',
        outModes: { default: 'out' },
      },
      shape: { type: 'circle' },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: 'repulse' },
        onClick: { enable: true, mode: 'push' },
      },
      modes: {
        repulse: { distance: 100 },
        push: { quantity: 4 },
      },
    },
  }}
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  }}
/>

  );
}