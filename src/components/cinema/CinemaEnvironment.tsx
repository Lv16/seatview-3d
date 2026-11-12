import { MeshStandardMaterial } from 'three'
import { cinemaGeometry as dimensions, cinemaLayout } from '../../data/cinemaLayout'
import { cinemaLighting } from '../../data/cinemaLighting'

const floorTop = -dimensions.rowRise
const lastRow = cinemaLayout.rows.at(-1)
const roomBackZ = lastRow
  ? dimensions.firstRowZ + lastRow.logicalDepth * dimensions.rowSpacing + dimensions.rowSpacing / 2 + dimensions.roomBackMargin
  : dimensions.firstRowZ + dimensions.roomBackMargin
const roomDepth = roomBackZ - dimensions.roomFrontZ
const roomCenterZ = (roomBackZ + dimensions.roomFrontZ) / 2
const wallHeight = dimensions.roomCeilingHeight - floorTop
const wallCenterY = (dimensions.roomCeilingHeight + floorTop) / 2

const floorMaterial = new MeshStandardMaterial({ color: '#1b1920', roughness: 0.96 })
const ceilingMaterial = new MeshStandardMaterial({ color: '#100f15', roughness: 0.98 })
const wallMaterial = new MeshStandardMaterial({ color: '#1a171e', roughness: 0.97 })
const acousticPanelMaterials = [
  new MeshStandardMaterial({ color: '#211d24', roughness: 0.98 }),
  new MeshStandardMaterial({ color: '#252129', roughness: 0.98 }),
]
const ceilingPanelMaterial = new MeshStandardMaterial({ color: '#15131a', roughness: 0.96 })
const ceilingTrimMaterial = new MeshStandardMaterial({ color: '#322a31', emissive: '#100b10', emissiveIntensity: 0.08, roughness: 0.88 })

const acousticPanelCount = 8
const acousticPanelStartZ = dimensions.roomFrontZ + 1.2
const acousticPanelSpacing = (roomDepth - 2.4) / (acousticPanelCount - 1)
const sidePanelX = dimensions.roomWidth / 2 - 0.045

export function CinemaEnvironment() {
  return (
    <>
      {/* Broad, shadow-free fill keeps the auditorium dark while separating seat rows. */}
      <ambientLight intensity={cinemaLighting.ambient.intensity} color={cinemaLighting.ambient.color} />
      <hemisphereLight args={[cinemaLighting.hemisphere.skyColor, cinemaLighting.hemisphere.groundColor, cinemaLighting.hemisphere.intensity]} />
      <directionalLight
        position={cinemaLighting.screenWash.position}
        color={cinemaLighting.screenWash.color}
        intensity={cinemaLighting.screenWash.intensity}
      />
      <directionalLight
        position={cinemaLighting.rearFill.position}
        color={cinemaLighting.rearFill.color}
        intensity={cinemaLighting.rearFill.intensity}
      />
      {[-1, 1].map((side) => (
        <pointLight
          key={`side-fill-${side}`}
          position={[side * cinemaLighting.sideFill.offsetX, cinemaLighting.sideFill.height, cinemaLighting.sideFill.depth]}
          color={cinemaLighting.sideFill.color}
          intensity={cinemaLighting.sideFill.intensity}
          distance={cinemaLighting.sideFill.distance}
        />
      ))}

      <mesh position={[0, floorTop - dimensions.roomFloorThickness / 2, roomCenterZ]}>
        <boxGeometry args={[dimensions.roomWidth, dimensions.roomFloorThickness, roomDepth]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      <mesh position={[0, dimensions.roomCeilingHeight + dimensions.roomWallThickness / 2, roomCenterZ]}>
        <boxGeometry args={[dimensions.roomWidth, dimensions.roomWallThickness, roomDepth]} />
        <primitive object={ceilingMaterial} attach="material" />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={`wall-${side}`} position={[side * (dimensions.roomWidth / 2 + dimensions.roomWallThickness / 2), wallCenterY, roomCenterZ]}>
          <boxGeometry args={[dimensions.roomWallThickness, wallHeight, roomDepth + dimensions.roomWallThickness]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      ))}

      {[dimensions.roomFrontZ - dimensions.roomWallThickness / 2, roomBackZ + dimensions.roomWallThickness / 2].map((z) => (
        <mesh key={`end-wall-${z}`} position={[0, wallCenterY, z]}>
          <boxGeometry args={[dimensions.roomWidth, wallHeight, dimensions.roomWallThickness]} />
          <primitive object={wallMaterial} attach="material" />
        </mesh>
      ))}

      {/* Repeated, shallow acoustic panels sit on the inner face of each side wall. */}
      {[-1, 1].flatMap((side) => Array.from({ length: acousticPanelCount }, (_, index) => (
        <mesh
          key={`acoustic-${side}-${index}`}
          position={[side * sidePanelX, 3.55, acousticPanelStartZ + index * acousticPanelSpacing]}
        >
          <boxGeometry args={[0.07, 1.9, 1.38]} />
          <primitive object={acousticPanelMaterials[index % acousticPanelMaterials.length]} attach="material" />
        </mesh>
      )))}

      {/* Recessed ceiling fields and dim warm edge strips replace the neon rails. */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={`ceiling-field-${x}`} position={[x * 2.15, dimensions.roomCeilingHeight - 0.12, roomCenterZ]}>
          <boxGeometry args={[3.25, 0.08, roomDepth - 1.5]} />
          <primitive object={ceilingPanelMaterial} attach="material" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`ceiling-trim-${side}`} position={[side * 0.36, dimensions.roomCeilingHeight - 0.055, roomCenterZ]}>
          <boxGeometry args={[0.035, 0.018, roomDepth - 2]} />
          <primitive object={ceilingTrimMaterial} attach="material" />
        </mesh>
      ))}
    </>
  )
}
