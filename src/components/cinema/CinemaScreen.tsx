import { RoundedBox } from '@react-three/drei'
import { MeshStandardMaterial, ShaderMaterial, VideoTexture } from 'three'
import { useEffect, useMemo } from 'react'
import { cinemaGeometry as dimensions } from '../../data/cinemaLayout'
import { cinemaLighting } from '../../data/cinemaLighting'

const frameMaterial = new MeshStandardMaterial({ color: '#28242a', roughness: 0.9, metalness: 0.04 })
const screenMaterial = new MeshStandardMaterial({
  color: '#c7ccda',
  emissive: '#9ba5c2',
  emissiveIntensity: 0.34,
  roughness: 1,
  metalness: 0,
})
const screenGlowMaterial = new MeshStandardMaterial({
  color: '#d5d9e5',
  emissive: '#aab4d0',
  emissiveIntensity: 0.2,
  roughness: 1,
  transparent: true,
  opacity: 0.14,
})

export function CinemaScreen({ texture, videoWidth, videoHeight, available }: { texture: VideoTexture; videoWidth: number; videoHeight: number; available: boolean }) {
  const projectionMaterial = useMemo(() => new ShaderMaterial({
    uniforms: { videoMap: { value: texture }, videoAspect: { value: 16 / 9 }, screenAspect: { value: dimensions.screenWidth / dimensions.screenHeight } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    // object-fit: cover: crop the source dimension that exceeds the screen.
    // VideoTexture remains stable while its dimensions update through uniforms.
    fragmentShader: 'uniform sampler2D videoMap; uniform float videoAspect; uniform float screenAspect; varying vec2 vUv; void main(){ vec2 uv=vUv; if(videoAspect>screenAspect){ float visible=screenAspect/videoAspect; uv.x=(uv.x-0.5)*visible+0.5; } else { float visible=videoAspect/screenAspect; uv.y=(uv.y-0.5)*visible+0.5; } gl_FragColor=texture2D(videoMap,uv); }',
    transparent: true,
    toneMapped: false,
  }), [texture])
  useEffect(() => {
    // oxlint-disable-next-line react/immutability -- Three.js shader uniforms are mutable runtime inputs.
    if (videoWidth > 0 && videoHeight > 0) projectionMaterial.uniforms.videoAspect.value = videoWidth / videoHeight
  }, [projectionMaterial, videoHeight, videoWidth])
  const frameWidth = dimensions.screenWidth + dimensions.screenFrameGutter
  const frameHeight = dimensions.screenHeight + dimensions.screenFrameGutter
  return (
    <group position={[0, dimensions.screenCenterY, dimensions.screenZ]}>
      <RoundedBox args={[frameWidth, frameHeight, dimensions.screenFrameDepth]} radius={0.14} smoothness={2} material={frameMaterial} />
      <mesh position={[0, 0, dimensions.screenFaceOffsetZ]}>
        <planeGeometry args={[dimensions.screenWidth, dimensions.screenHeight]} />
        <primitive object={screenMaterial} attach="material" />
      </mesh>
      {available && <mesh position={[0, 0, dimensions.screenFaceOffsetZ + 0.007]}>
        <planeGeometry args={[dimensions.screenWidth, dimensions.screenHeight]} />
        <primitive object={projectionMaterial} attach="material" />
      </mesh>}
      <mesh position={[0, 0, dimensions.screenFaceOffsetZ + 0.005]}>
        <planeGeometry args={[dimensions.screenWidth - dimensions.screenGlowInset, dimensions.screenHeight - dimensions.screenGlowInset]} />
        <primitive object={screenGlowMaterial} attach="material" />
      </mesh>
      <pointLight
        position={[0, 0, dimensions.screenLightOffsetZ]}
        color={cinemaLighting.screenBounce.color}
        intensity={cinemaLighting.screenBounce.intensity}
        distance={cinemaLighting.screenBounce.distance}
      />
    </group>
  )
}
