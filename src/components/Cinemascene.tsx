import { Canvas } from '@react-three/fiber'
import { OrbitControls, RoundedBox } from '@react-three/drei'

function Seat({
  x,
  y,
  z,
}: {
  x: number
  y: number
  z: number
}) {
  return (
    <group position={[x, y, z]}>
      {/* Base da poltrona */}
      <RoundedBox args={[0.85, 0.18, 0.75]} radius={0.08}
        position={[0, 0.48, 0]}>
        <meshStandardMaterial color="#263f80" />
      </RoundedBox>

      {/* Encosto */}
      <RoundedBox args={[0.85, 0.95, 0.18]} radius={0.08}
        position={[0, 1, 0.35]}>
        <meshStandardMaterial color="#3658ae" />
      </RoundedBox>

      {/* Braços */}
      {[-0.48, 0.48].map((side) => (
        <RoundedBox
          key={side}
          args={[0.12, 0.22, 0.7]}
          radius={0.04}
          position={[side, 0.68, 0]}
        >
          <meshStandardMaterial color="#17213a" />
        </RoundedBox>
      ))}
    </group>
  )
}

function Auditorium() {
  const seats = []

  for (let row = 0; row < 12; row++) {
    for (let col = 0; col < 12; col++) {
      seats.push(
        <Seat
          key={`${row}-${col}`}
          x={(col - 5.5) * 1.1}
          y={row * 0.16}
          z={row * 1.25 - 6}
        />
      )
    }
  }

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 12, 5]} intensity={1.5} />

      {/* Piso */}
      <mesh position={[0, -0.12, 1.2]} receiveShadow>
        <boxGeometry args={[17, 0.2, 19]} />
        <meshStandardMaterial color="#171c27" />
      </mesh>

      {/* Tela */}
      <mesh position={[0, 4, -8]}>
        <planeGeometry args={[13, 6]} />
        <meshBasicMaterial color="#e3e8f4" />
      </mesh>

      {/* Moldura da tela */}
      <mesh position={[0, 4, -8.08]}>
        <boxGeometry args={[13.5, 6.5, 0.15]} />
        <meshStandardMaterial color="#090b10" />
      </mesh>

      {seats}
    </>
  )
}

export default function CinemaScene() {
  return (
    <Canvas
      camera={{ position: [13, 14, 18], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <color attach="background" args={['#080c15']} />
      <Auditorium />
      <OrbitControls
        target={[0, 1, 0]}
        enableDamping
        minDistance={3}
        maxDistance={35}
      />
    </Canvas>
  )
}