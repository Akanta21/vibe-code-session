'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function IdeaDroplets() {
  const droplets = useRef<THREE.Group>(null!)
  
  // Create droplet data
  const dropletData = useMemo(() => {
    const data = []
    for (let i = 0; i < 50; i++) {
      data.push({
        id: i,
        startX: (Math.random() - 0.5) * 20,
        startY: 10 + Math.random() * 5,
        startZ: (Math.random() - 0.5) * 10,
        speed: 0.02 + Math.random() * 0.03,
        size: 0.05 + Math.random() * 0.1,
        delay: Math.random() * 10,
        color: Math.random() < 0.5 ? '#8b5cf6' : '#3b82f6'
      })
    }
    return data
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (droplets.current) {
      droplets.current.children.forEach((droplet, index) => {
        const data = dropletData[index]
        const adjustedTime = time + data.delay
        
        // Falling motion
        droplet.position.y = data.startY - (adjustedTime * data.speed * 3)
        droplet.position.x = data.startX + Math.sin(adjustedTime * 0.5) * 0.5
        droplet.position.z = data.startZ + Math.cos(adjustedTime * 0.3) * 0.3
        
        // Reset when droplet falls too low
        if (droplet.position.y < -8) {
          droplet.position.y = data.startY + Math.random() * 2
          droplet.position.x = data.startX + (Math.random() - 0.5) * 2
        }
        
        // Subtle size oscillation
        const sizeMultiplier = 1 + Math.sin(adjustedTime * 2) * 0.2
        droplet.scale.setScalar(sizeMultiplier)
      })
    }
  })

  return (
    <group ref={droplets}>
      {dropletData.map((data, index) => (
        <mesh key={data.id} position={[data.startX, data.startY, data.startZ]}>
          <sphereGeometry args={[data.size, 8, 8]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}

function IdeaBubbles() {
  const bubbles = useRef<THREE.Group>(null!)
  
  const bubbleData = useMemo(() => {
    const data = []
    for (let i = 0; i < 30; i++) {
      data.push({
        id: i,
        startX: (Math.random() - 0.5) * 15,
        startY: -8 + Math.random() * 2,
        startZ: (Math.random() - 0.5) * 8,
        speed: 0.01 + Math.random() * 0.02,
        size: 0.1 + Math.random() * 0.2,
        delay: Math.random() * 15,
        color: Math.random() < 0.33 ? '#8b5cf6' : Math.random() < 0.5 ? '#3b82f6' : '#ec4899'
      })
    }
    return data
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (bubbles.current) {
      bubbles.current.children.forEach((bubble, index) => {
        const data = bubbleData[index]
        const adjustedTime = time + data.delay
        
        // Rising motion with gentle sway
        bubble.position.y = data.startY + (adjustedTime * data.speed * 2)
        bubble.position.x = data.startX + Math.sin(adjustedTime * 0.3) * 1
        bubble.position.z = data.startZ + Math.cos(adjustedTime * 0.2) * 0.5
        
        // Reset when bubble rises too high
        if (bubble.position.y > 12) {
          bubble.position.y = data.startY - Math.random() * 2
          bubble.position.x = data.startX + (Math.random() - 0.5) * 3
        }
        
        // Gentle pulsing
        const sizeMultiplier = 1 + Math.sin(adjustedTime * 1.5) * 0.3
        bubble.scale.setScalar(sizeMultiplier)
      })
    }
  })

  return (
    <group ref={bubbles}>
      {bubbleData.map((data, index) => (
        <mesh key={data.id} position={[data.startX, data.startY, data.startZ]}>
          <sphereGeometry args={[data.size, 12, 12]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.3}
            wireframe={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function IdeaRipples() {
  const ripples = useRef<THREE.Group>(null!)
  
  const rippleData = useMemo(() => {
    const data = []
    for (let i = 0; i < 8; i++) {
      data.push({
        id: i,
        x: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 10,
        delay: Math.random() * 8,
        speed: 0.5 + Math.random() * 0.5,
        maxScale: 2 + Math.random() * 3
      })
    }
    return data
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (ripples.current) {
      ripples.current.children.forEach((ripple, index) => {
        const data = rippleData[index]
        const adjustedTime = (time + data.delay) * data.speed
        const cycle = adjustedTime % 6
        
        if (cycle < 4) {
          const progress = cycle / 4
          const scale = progress * data.maxScale
          const opacity = Math.max(0, 1 - progress)
          
          ripple.scale.setScalar(scale)
          if (ripple instanceof THREE.Mesh && ripple.material) {
            (ripple.material as THREE.MeshBasicMaterial).opacity = opacity * 0.4
          }
          ripple.visible = true
        } else {
          ripple.visible = false
        }
      })
    }
  })

  return (
    <group ref={ripples} position={[0, -4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {rippleData.map((data, index) => (
        <mesh key={data.id} position={[data.x, data.z, 0]}>
          <ringGeometry args={[0.5, 1, 16]} />
          <meshBasicMaterial
            color="#8b5cf6"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

function CodeParticles() {
  const particles = useRef<THREE.Group>(null!)
  
  const particleData = useMemo(() => {
    const symbols = ['{ }', '< >', '[ ]', '( )', '= >', '+ +', '* *', '/ /']
    const data = []
    
    for (let i = 0; i < 20; i++) {
      data.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 15,
        z: (Math.random() - 0.5) * 10,
        speed: 0.01 + Math.random() * 0.02,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        color: Math.random() < 0.5 ? '#8b5cf6' : '#3b82f6'
      })
    }
    return data
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (particles.current) {
      particles.current.children.forEach((particle, index) => {
        const data = particleData[index]
        
        // Gentle floating motion
        particle.position.x = data.x + Math.sin(time * data.speed + index) * 2
        particle.position.y = data.y + Math.cos(time * data.speed * 0.7 + index) * 1.5
        particle.position.z = data.z + Math.sin(time * data.speed * 0.5 + index) * 1
        
        // Gentle rotation
        particle.rotation.z += data.rotationSpeed
        
        // Pulsing opacity
        const opacity = 0.2 + Math.sin(time * 2 + index) * 0.1
        if (particle instanceof THREE.Mesh && particle.material) {
          (particle.material as THREE.MeshBasicMaterial).opacity = opacity
        }
      })
    }
  })

  return (
    <group ref={particles}>
      {particleData.map((data, index) => (
        <mesh key={data.id} position={[data.x, data.y, data.z]}>
          <planeGeometry args={[0.5, 0.3]} />
          <meshBasicMaterial
            color={data.color}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function WebGLBackground() {
  return (
    <div 
      className="fixed inset-0"
      style={{
        zIndex: -10,
        background: 'radial-gradient(ellipse at center, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(0, 0, 0, 0.8) 100%)'
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 70 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 10, 5]} intensity={0.6} color="#8b5cf6" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#3b82f6" />
        <pointLight position={[0, 0, 8]} intensity={0.3} color="#ec4899" />
        
        {/* Idea Generation Effects */}
        <IdeaDroplets />
        <IdeaBubbles />
        <IdeaRipples />
        <CodeParticles />
      </Canvas>
    </div>
  )
}