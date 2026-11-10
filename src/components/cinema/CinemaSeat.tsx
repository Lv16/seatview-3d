import { RoundedBox } from '@react-three/drei'
import type { CinemaSeatData } from '../../types/cinema'

const materials = {
  available: '#74354d',
  occupied: '#342936',
  accessible: '#8b4660',
  companion: '#684257',
}

export function CinemaSeat({ seat, position }: { seat: CinemaSeatData; position: [number, number, number] }) {
  const color = seat.kind === 'accessible' ? materials.accessible
    : seat.kind === 'companion' ? materials.companion
      : seat.status === 'available' ? materials.available : materials.occupied
  return (
    <group position={position}>
      <RoundedBox args={[0.39, 0.15, 0.56]} radius={0.08} smoothness={2} position={[0, 0.51, 0]}>
        <meshStandardMaterial color={color} roughness={0.65} />
      </RoundedBox>
      <RoundedBox args={[0.39, 0.78, 0.15]} radius={0.08} smoothness={2} position={[0, 0.99, 0.24]}>
        <meshStandardMaterial color={color} roughness={0.63} />
      </RoundedBox>
      {[-0.43, 0.43].map((x) => (
        <group key={x} position={[x * 0.41, 0.64, -0.01]}>
          <RoundedBox args={[0.07, 0.27, 0.55]} radius={0.035} smoothness={2}>
            <meshStandardMaterial color="#211b25" roughness={0.72} />
          </RoundedBox>
          <RoundedBox args={[0.12, 0.07, 0.58]} radius={0.03} smoothness={2} position={[0, 0.16, 0]}>
            <meshStandardMaterial color="#382331" roughness={0.66} />
          </RoundedBox>
        </group>
      ))}
      <mesh position={[0, 0.14, -0.05]}>
        <cylinderGeometry args={[0.055, 0.07, 0.2, 8]} />
        <meshStandardMaterial color="#847888" metalness={0.6} roughness={0.38} />
      </mesh>
    </group>
  )
}
