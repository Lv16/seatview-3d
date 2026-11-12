import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { gsap } from 'gsap'
import * as THREE from 'three'
import { BoxGeometry, InstancedMesh, MeshBasicMaterial, MeshStandardMaterial, Object3D } from 'three'
import { cinemaGeometry, cinemaLayout, locateSeat, rowToWorldPosition, screenCenter } from '../../data/cinemaLayout'
import { CinemaEnvironment } from './CinemaEnvironment'
import { CinemaScreen } from './CinemaScreen'
import { CinemaSeatBatch } from './CinemaSeat'
import type { VideoTexture } from 'three'

// Keep the overview inside the room shell so the walls and ceiling do not hide it.
const overviewPosition: [number, number, number] = [0, 5.8, 15.9]
const overviewTarget: [number, number, number] = screenCenter
// Fixed vertical field of view: 44° (~74° horizontal at 16:9). A portrait
// viewport therefore shows less horizontal room, as a real fixed lens would.
const CAMERA_VERTICAL_FOV_DEGREES = 44
const rowPlatformGeometry = new BoxGeometry(cinemaGeometry.roomWidth, cinemaGeometry.rowRise, cinemaGeometry.rowSpacing)
const aisleGuideGeometry = new BoxGeometry(cinemaGeometry.aisleMarkerWidth, cinemaGeometry.aisleMarkerHeight, cinemaGeometry.rowSpacing - cinemaGeometry.aisleMarkerInset)
const rowPlatformMaterial = new MeshStandardMaterial({ color: '#211e23', roughness: 0.96 })
const aisleGuideMaterial = new MeshBasicMaterial({ color: '#8a705f' })

function RowPlatforms() {
  const platforms = useRef<InstancedMesh>(null)
  const aisleGuides = useRef<InstancedMesh>(null)

  useEffect(() => {
    const object = new Object3D()
    cinemaLayout.rows.forEach((row, rowIndex) => {
      const [x, y, z] = rowToWorldPosition(row.logicalDepth)
      object.position.set(x, y - cinemaGeometry.rowRise / 2, z)
      object.updateMatrix()
      platforms.current?.setMatrixAt(rowIndex, object.matrix)
      cinemaLayout.aisles.forEach((aisleX, aisleIndex) => {
        object.position.set(aisleX, y + 0.012, z)
        object.updateMatrix()
        aisleGuides.current?.setMatrixAt(rowIndex * cinemaLayout.aisles.length + aisleIndex, object.matrix)
      })
    })
    if (platforms.current) platforms.current.instanceMatrix.needsUpdate = true
    if (aisleGuides.current) aisleGuides.current.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group dispose={null}>
      <instancedMesh ref={platforms} args={[rowPlatformGeometry, rowPlatformMaterial, cinemaLayout.rows.length]} />
      <instancedMesh ref={aisleGuides} args={[aisleGuideGeometry, aisleGuideMaterial, cinemaLayout.rows.length * cinemaLayout.aisles.length]} />
    </group>
  )
}

function CameraDirector({ seatId, centerRequest }: { seatId: string | null; centerRequest: number }) {
  const { camera, gl } = useThree()
  const [transitioning, setTransitioning] = useState(false)
  const mode = useRef<'overview' | 'transition' | 'firstPerson'>('overview')
  const yaw = useRef(0)
  const pitch = useRef(0)
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = seatId ? (mode.current === 'firstPerson' ? 0.95 : 2.45) : 1.75
    const destination = seatId ? locateSeat(seatId) : null
    const targetPosition = destination?.eyePosition ?? overviewPosition
    const targetLook = destination?.screenTarget ?? overviewTarget
    const look = new THREE.Vector3()
    camera.getWorldDirection(look)
    look.multiplyScalar(8).add(camera.position)
    const startPosition = camera.position.clone()
    const startLook = look.clone()
    const endPosition = new THREE.Vector3(...targetPosition)
    const endLook = new THREE.Vector3(...targetLook)
    const progress = { value: 0 }

    gsap.killTweensOf(yaw)
    gsap.killTweensOf(pitch)
    mode.current = 'transition'
    const tween = gsap.to(progress, {
      value: 1,
      duration: reducedMotion ? 0 : duration,
      ease: 'power2.inOut',
      onStart: () => setTransitioning(true),
      onUpdate: () => {
        camera.position.lerpVectors(startPosition, endPosition, progress.value)
        const currentLook = startLook.clone().lerp(endLook, progress.value)
        camera.lookAt(currentLook)
      },
      onComplete: () => {
        if (destination) {
          const delta = endLook.clone().sub(endPosition).normalize()
          yaw.current = Math.atan2(-delta.x, -delta.z)
          pitch.current = Math.asin(THREE.MathUtils.clamp(delta.y, -1, 1))
          mode.current = 'firstPerson'
        } else {
          mode.current = 'overview'
        }
        setTransitioning(false)
      },
    })
    return () => { tween.kill() }
  }, [camera, seatId])

  useEffect(() => {
    if (centerRequest === 0 || !seatId || mode.current !== 'firstPerson') return
    const viewpoint = locateSeat(seatId)
    if (!viewpoint) return
    const destination = new THREE.Vector3(...viewpoint.screenTarget)
    const direction = destination.sub(camera.position).normalize()
    const targetYaw = Math.atan2(-direction.x, -direction.z)
    const targetPitch = Math.asin(THREE.MathUtils.clamp(direction.y, -1, 1))
    gsap.killTweensOf(yaw)
    gsap.killTweensOf(pitch)
    const yawTween = gsap.to(yaw, { current: targetYaw, duration: 0.45, ease: 'power2.out' })
    const pitchTween = gsap.to(pitch, { current: targetPitch, duration: 0.45, ease: 'power2.out' })
    return () => { yawTween.kill(); pitchTween.kill() }
  }, [camera, centerRequest, seatId])

  useEffect(() => {
    const element = gl.domElement
    const down = (event: PointerEvent) => {
      if (mode.current !== 'firstPerson') return
      event.preventDefault()
      element.setPointerCapture(event.pointerId)
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
    }
    const move = (event: PointerEvent) => {
      const previous = pointer.current
      if (!previous || previous.id !== event.pointerId || mode.current !== 'firstPerson') return
      event.preventDefault()
      yaw.current -= (event.clientX - previous.x) * 0.0032
      pitch.current = THREE.MathUtils.clamp(pitch.current - (event.clientY - previous.y) * 0.0032, -0.48, 0.38)
      pointer.current = { ...previous, x: event.clientX, y: event.clientY }
    }
    const up = (event: PointerEvent) => {
      if (pointer.current?.id === event.pointerId) pointer.current = null
    }
    element.addEventListener('pointerdown', down)
    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', up)
    element.addEventListener('pointercancel', up)
    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', up)
      element.removeEventListener('pointercancel', up)
    }
  }, [gl])

  useFrame(() => {
    if (mode.current !== 'firstPerson') return
    // oxlint-disable-next-line react/immutability -- R3F camera is intentionally updated in its render loop.
    camera.rotation.set(pitch.current, yaw.current, 0, 'YXZ')
  })

  return <OrbitControls
    makeDefault
    enabled={!seatId && !transitioning}
    target={overviewTarget}
    enableDamping
    dampingFactor={0.075}
    minDistance={8}
    maxDistance={34}
    minPolarAngle={0.48}
    maxPolarAngle={1.52}
    minAzimuthAngle={-1.12}
    maxAzimuthAngle={1.12}
    rotateSpeed={0.55}
    enablePan={false}
  />
}

function Auditorium({ texture, videoWidth, videoHeight, available }: { texture: VideoTexture; videoWidth: number; videoHeight: number; available: boolean }) {
  return (
    <>
      <CinemaEnvironment />
      <CinemaScreen texture={texture} videoWidth={videoWidth} videoHeight={videoHeight} available={available} />
      <CinemaSeatBatch />
      <RowPlatforms />
    </>
  )
}

export default function CinemaScene({ seatId, centerRequest, texture, videoWidth, videoHeight, available }: { seatId: string | null; centerRequest: number; texture: VideoTexture; videoWidth: number; videoHeight: number; available: boolean }) {
  return (
    <Canvas
      camera={{ position: overviewPosition, fov: CAMERA_VERTICAL_FOV_DEGREES }}
      dpr={[1, 1.35]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <color attach="background" args={['#09080d']} />
      <fog attach="fog" args={['#09080d', 21, 42]} />
      <Suspense fallback={null}><Auditorium texture={texture} videoWidth={videoWidth} videoHeight={videoHeight} available={available} /></Suspense>
      <CameraDirector seatId={seatId} centerRequest={centerRequest} />
    </Canvas>
  )
}
