import { RoundedBox } from '@react-three/drei'

export function CinemaScreen() {
  return (
    <group position={[0, 4.05, -8.05]}>
      <RoundedBox args={[13.7, 6.5, 0.3]} radius={0.14} smoothness={2}>
        <meshStandardMaterial color="#21192b" emissive="#160c20" emissiveIntensity={0.5} />
      </RoundedBox>
      <mesh position={[0, 0, 0.17]}>
        <planeGeometry args={[13.18, 5.98]} />
        <meshBasicMaterial color="#ded9e9" toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, 0.175]}>
        <planeGeometry args={[12.92, 5.72]} />
        <meshBasicMaterial color="#c9d7ff" toneMapped={false} transparent opacity={0.11} />
      </mesh>
      <pointLight position={[0, 0, 1.1]} color="#a6baff" intensity={30} distance={18} />
    </group>
  )
}
