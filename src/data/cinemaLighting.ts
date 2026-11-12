/** Lighting values for the illustrative auditorium; no shadow maps are enabled. */
export const cinemaLighting = {
  ambient: { color: '#c3c5d2', intensity: 1.0 },
  hemisphere: { skyColor: '#a5a8b8', groundColor: '#211d23', intensity: 1.2 },
  screenWash: { color: '#b4aeb7', intensity: 1.15, position: [0, 7.2, -6.2] as const },
  rearFill: { color: '#b6b0b8', intensity: 4.2, position: [0, 8.1, 14] as const },
  sideFill: { color: '#918b98', intensity: 16, distance: 24, height: 4.8, depth: 1.5, offsetX: 8.1 },
  screenBounce: { color: '#c6c9d7', intensity: 14, distance: 20 },
} as const
