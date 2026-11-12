import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, CylinderGeometry, ExtrudeGeometry, InstancedMesh, MeshStandardMaterial, Object3D, Shape, SphereGeometry, TorusGeometry } from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'
import { cinemaGeometry as dimensions, cinemaLayout, seatToWorldPosition } from '../../data/cinemaLayout'
import type { CinemaSeatData, SeatStatus } from '../../types/cinema'

// The room has hundreds of seats; shared instanced geometry keeps draw calls low.
// Reusable, low-poly cushion forms. The back silhouette has a gently flared
// shoulder and rounded crown so it reads as upholstered from either side.
const seatCushionGeometry = new RoundedBoxGeometry(1, 1, 1, 0.22, 3)
const armGeometry = new RoundedBoxGeometry(1, 1, 1, 0.34, 3)
const bolsterGeometry = new SphereGeometry(1, 12, 8)
const backShape = new Shape()
backShape.moveTo(-0.205, -0.375)
backShape.quadraticCurveTo(-0.23, -0.375, -0.23, -0.34)
backShape.lineTo(-0.23, 0.225)
backShape.quadraticCurveTo(-0.23, 0.365, -0.145, 0.385)
backShape.quadraticCurveTo(0, 0.415, 0.145, 0.385)
backShape.quadraticCurveTo(0.23, 0.365, 0.23, 0.225)
backShape.lineTo(0.23, -0.34)
backShape.quadraticCurveTo(0.23, -0.375, 0.205, -0.375)
backShape.quadraticCurveTo(0, -0.405, -0.205, -0.375)
const backCushionGeometry = new ExtrudeGeometry(backShape, {
  depth: 0.13,
  bevelEnabled: true,
  bevelSegments: 3,
  steps: 1,
  bevelSize: 0.025,
  bevelThickness: 0.018,
  curveSegments: 5,
})
backCushionGeometry.translate(0, 0, -0.065)
const columnGeometry = new CylinderGeometry(0.82, 1, 1, 7)
const markerGeometry = new CylinderGeometry(1, 1, 1, 8)
const cupRingGeometry = new TorusGeometry(1, 0.15, 5, 12)
const cupWellGeometry = new CylinderGeometry(0.82, 1, 1, 8)

const upholsteryMaterial = new MeshStandardMaterial({ color: '#ffffff', roughness: 0.96, metalness: 0, vertexColors: true })
const seamMaterial = new MeshStandardMaterial({ color: '#8c414b', roughness: 0.98 })
const armMaterial = new MeshStandardMaterial({ color: '#491923', roughness: 0.96, metalness: 0 })
const armPadMaterial = new MeshStandardMaterial({ color: '#702b36', roughness: 0.95 })
const cupHolderMaterial = new MeshStandardMaterial({ color: '#29272b', metalness: 0, roughness: 0.91 })
const cupWellMaterial = new MeshStandardMaterial({ color: '#17161a', roughness: 0.96 })
const structureMaterial = new MeshStandardMaterial({ color: '#202126', metalness: 0.02, roughness: 0.92 })
const markerMaterial = new MeshStandardMaterial({ color: '#ffffff', emissive: '#191519', emissiveIntensity: 0.035, vertexColors: true, roughness: 0.85 })

const bodyColorByStatus: Record<SeatStatus, string> = {
  available: '#702b36',
  occupied: '#625258',
  blocked: '#49373c',
  pending: '#6b5145',
}
const markerColorByStatus: Record<SeatStatus, string> = {
  available: '#8c414b',
  occupied: '#aaa3a9',
  blocked: '#a65d67',
  pending: '#b39a67',
}
const bodyColorByKind: Partial<Record<CinemaSeatData['kind'], string>> = {
  accessible: '#607970',
  companion: '#805365',
}
const seats = cinemaLayout.rows.flatMap((row) => row.seats)

function seatColor(seat: CinemaSeatData) {
  return seat.status === 'available' ? bodyColorByKind[seat.kind] ?? bodyColorByStatus.available : bodyColorByStatus[seat.status]
}

function setInstance(
  mesh: InstancedMesh | null,
  index: number,
  object: Object3D,
  position: [number, number, number],
  scale: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
) {
  if (!mesh) return
  object.position.set(...position)
  object.scale.set(...scale)
  object.rotation.set(...rotation)
  object.updateMatrix()
  mesh.setMatrixAt(index, object.matrix)
}

function finishInstances(mesh: InstancedMesh | null) {
  if (!mesh) return
  mesh.instanceMatrix.needsUpdate = true
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
}

export function CinemaSeatBatch() {
  const cushion = useRef<InstancedMesh>(null)
  const backrest = useRef<InstancedMesh>(null)
  const sideBolsters = useRef<InstancedMesh>(null)
  const backSeams = useRef<InstancedMesh>(null)
  const armSupports = useRef<InstancedMesh>(null)
  const armPads = useRef<InstancedMesh>(null)
  const cupRims = useRef<InstancedMesh>(null)
  const cupWells = useRef<InstancedMesh>(null)
  const columns = useRef<InstancedMesh>(null)
  const feet = useRef<InstancedMesh>(null)
  const markers = useRef<InstancedMesh>(null)
  const colors = useMemo(() => ({ body: new Color(), marker: new Color() }), [])

  useLayoutEffect(() => {
    const object = new Object3D()
    for (const [index, seat] of seats.entries()) {
      const [x, floorY, z] = seatToWorldPosition(seat)
      const armRestHeight = dimensions.armCenterY + dimensions.armHeight / 2

      setInstance(cushion.current, index, object,
        [x, floorY + dimensions.seatSurfaceHeight - dimensions.seatThickness / 2, z],
        [dimensions.seatWidth * 1.04, dimensions.seatThickness * 1.12, dimensions.seatDepth * 0.96])
      setInstance(backrest.current, index, object,
        [x, floorY + dimensions.backOffsetY, z + dimensions.backOffsetZ],
        [1, dimensions.backHeight / 0.82, dimensions.backThickness / 0.166])

      for (const [sideIndex, side] of [-1, 1].entries()) {
        setInstance(sideBolsters.current, index * 2 + sideIndex, object,
          [x + side * (dimensions.backWidth / 2 - 0.045), floorY + dimensions.backOffsetY - 0.015, z + dimensions.backOffsetZ + 0.005],
          [0.052, dimensions.backHeight * 0.34, dimensions.backThickness * 0.62],
          [0, side * 0.12, side * -0.05])
      }

      const backSurfaceZ = z + dimensions.backOffsetZ + dimensions.backThickness / 2 + 0.014
      const seamHeight = dimensions.backHeight * 0.67
      for (const [seamIndex, seam] of [
        { position: [x, floorY + dimensions.backOffsetY, backSurfaceZ], scale: [0.003, seamHeight, 0.002] },
        { position: [x, floorY + dimensions.backOffsetY - dimensions.backHeight * 0.2, backSurfaceZ], scale: [dimensions.backWidth * 0.38, 0.003, 0.002] },
        { position: [x, floorY + dimensions.backOffsetY + dimensions.backHeight * 0.12, backSurfaceZ], scale: [dimensions.backWidth * 0.34, 0.003, 0.002] },
      ].entries()) {
        setInstance(backSeams.current, index * 3 + seamIndex, object,
          seam.position as [number, number, number], seam.scale as [number, number, number])
      }

      for (const [sideIndex, side] of [-1, 1].entries()) {
        setInstance(armSupports.current, index * 2 + sideIndex, object,
          [x + side * dimensions.armOffsetX, floorY + (armRestHeight + dimensions.seatSurfaceHeight) / 2, z],
          [dimensions.armSupportWidth * 0.8, armRestHeight - dimensions.seatSurfaceHeight, dimensions.armSupportDepth * 0.8])
        setInstance(armPads.current, index * 2 + sideIndex, object,
          [x + side * dimensions.armOffsetX, floorY + armRestHeight, z],
          [dimensions.armWidth, dimensions.armPadHeight, dimensions.armDepth * 0.9])
        const cupX = x + side * dimensions.armOffsetX
        const cupY = floorY + armRestHeight + dimensions.armPadHeight / 2 + 0.003
        const cupZ = z - dimensions.armDepth * 0.28
        setInstance(cupRims.current, index * 2 + sideIndex, object,
          [cupX, cupY, cupZ], [0.032, 0.006, 0.032], [-Math.PI / 2, 0, 0])
        setInstance(cupWells.current, index * 2 + sideIndex, object,
          [cupX, cupY - 0.006, cupZ], [0.026, 0.008, 0.026])
      }

      setInstance(columns.current, index, object,
        [x, floorY + 0.25, z + dimensions.baseColumnZOffset],
        [dimensions.baseColumnRadius * 0.78, 0.43, dimensions.baseColumnRadius * 0.78])
      setInstance(feet.current, index, object,
        [x, floorY + dimensions.baseFootHeight / 2, z + dimensions.baseFootZOffset],
        [dimensions.baseFootWidth * 0.72, dimensions.baseFootHeight * 0.62, dimensions.baseFootDepth * 0.72])
      setInstance(markers.current, index, object,
        [x, floorY + dimensions.backOffsetY, z + dimensions.backOffsetZ + dimensions.backThickness / 2 + 0.008],
        [0.035, 0.012, 0.035], [Math.PI / 2, 0, 0])

      colors.body.set(seatColor(seat))
      cushion.current?.setColorAt(index, colors.body)
      backrest.current?.setColorAt(index, colors.body)
      sideBolsters.current?.setColorAt(index * 2, colors.body)
      sideBolsters.current?.setColorAt(index * 2 + 1, colors.body)
      colors.marker.set(markerColorByStatus[seat.status])
      markers.current?.setColorAt(index, colors.marker)
    }

    for (const mesh of [cushion.current, backrest.current, sideBolsters.current, backSeams.current, armSupports.current, armPads.current, cupRims.current, cupWells.current, columns.current, feet.current, markers.current]) {
      finishInstances(mesh)
    }
  }, [colors])

  return (
    <group dispose={null}>
      <instancedMesh ref={cushion} args={[seatCushionGeometry, upholsteryMaterial, seats.length]} />
      <instancedMesh ref={backrest} args={[backCushionGeometry, upholsteryMaterial, seats.length]} />
      <instancedMesh ref={sideBolsters} args={[bolsterGeometry, upholsteryMaterial, seats.length * 2]} />
      <instancedMesh ref={backSeams} args={[seatCushionGeometry, seamMaterial, seats.length * 3]} />
      <instancedMesh ref={armSupports} args={[armGeometry, armMaterial, seats.length * 2]} />
      <instancedMesh ref={armPads} args={[armGeometry, armPadMaterial, seats.length * 2]} />
      <instancedMesh ref={cupRims} args={[cupRingGeometry, cupHolderMaterial, seats.length * 2]} />
      <instancedMesh ref={cupWells} args={[cupWellGeometry, cupWellMaterial, seats.length * 2]} />
      <instancedMesh ref={columns} args={[columnGeometry, structureMaterial, seats.length]} />
      <instancedMesh ref={feet} args={[armGeometry, structureMaterial, seats.length]} />
      <instancedMesh ref={markers} args={[markerGeometry, markerMaterial, seats.length]} />
    </group>
  )
}
