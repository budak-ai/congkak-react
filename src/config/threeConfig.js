// threeConfig.js - 3D rendering configuration

const threeConfig = {
  // Camera settings (orthographic for 2D-like projection)
  camera: {
    position: [0, 10, 0],
    zoom: 50,
    near: 0.1,
    far: 100,
  },

  // Seed appearance
  seed: {
    radius: 0.18,
    segments: 16,
    roughness: 0.4,
    metalness: 0.1,
    // Colorful marble palette
    colors: [
      '#E74C3C', // Red
      '#3498DB', // Blue
      '#2ECC71', // Green
      '#F39C12', // Orange
      '#9B59B6', // Purple
      '#1ABC9C', // Teal
      '#E91E63', // Pink
    ],
  },

  // Seed cluster layout
  cluster: {
    maxSeedsPerLayer: 7,
    layerHeight: 0.12,
    spreadRadius: 0.28,
  },

  // Lighting
  lighting: {
    ambient: {
      intensity: 0.6,
    },
    directional: {
      position: [5, 10, 5],
      intensity: 0.8,
    },
  },

  // Animation timing (should match config.js)
  animation: {
    lerpFactor: 0.15, // Smoothing factor for position interpolation
    shakeDuration: 500, // ms
    shakeIntensity: 0.3, // Increased for visibility
  },

  // Colors
  colors: {
    seedPrimary: '#8B4513',    // Brown marble
    seedSecondary: '#654321',  // Darker brown
    handUpper: '#C47D7A',      // Light rosewood
    handLower: '#DAA520',      // Goldenrod (matches current cursor)
  },
};

export default threeConfig;
