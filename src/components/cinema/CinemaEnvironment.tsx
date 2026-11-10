export function CinemaEnvironment() {
  return (
    <>
      <ambientLight intensity={0.42} color="#b8c8ff" />
      <hemisphereLight args={['#7585b4', '#120e18', 0.8]} />
      <pointLight position={[-8, 5.5, 0]} color="#a541ff" intensity={18} distance={24} />
      <pointLight position={[8, 5.5, 0]} color="#345fff" intensity={16} distance={24} />
      <pointLight position={[0, 6, -8]} color="#ff4678" intensity={12} distance={19} />
      <mesh position={[0, -0.28, 1]} receiveShadow>
        <boxGeometry args={[17.2, 0.45, 19.5]} />
        <meshStandardMaterial color="#17151d" roughness={0.86} />
      </mesh>
      <mesh position={[0, 5.35, 1]}>
        <boxGeometry args={[17.2, 0.2, 19.5]} />
        <meshStandardMaterial color="#0c0b12" roughness={0.98} />
      </mesh>
      {[-8.4, 8.4].map((x) => (
        <mesh key={x} position={[x, 2.55, 1]}>
          <boxGeometry args={[0.25, 5.4, 19.4]} />
          <meshStandardMaterial color="#19131f" roughness={0.95} />
        </mesh>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[-8.23 + i * 1.5, 5.18, 1]}>
          <boxGeometry args={[0.025, 0.025, 17.5]} />
          <meshBasicMaterial color="#d45aff" />
        </mesh>
      ))}
    </>
  )
}
