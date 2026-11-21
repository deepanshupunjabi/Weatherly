"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type Kind = "sun" | "cloud" | "rain" | "snow" | "night";

function SunObject() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.5}>
      <mesh ref={ref} position={[1.4, 0.15, 0]}>
        <sphereGeometry args={[1.05, 48, 48]} />
        <meshStandardMaterial color="#ffca72" emissive="#ff8a36" emissiveIntensity={1.8} roughness={0.28} />
      </mesh>
      <mesh position={[1.4, 0.15, -0.2]} scale={1.28}>
        <sphereGeometry args={[1.05, 32, 32]} />
        <meshBasicMaterial color="#ffbd68" transparent opacity={0.09} />
      </mesh>
    </Float>
  );
}

function CloudObject({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[[0, 0, 0, 0.62], [0.55, 0.16, 0, 0.48], [-0.5, 0.08, 0, 0.42], [0.12, 0.36, 0, 0.48]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]}>
          <sphereGeometry args={[p[3], 24, 24]} />
          <meshStandardMaterial color="#d9e9f5" roughness={0.9} transparent opacity={0.88} />
        </mesh>
      ))}
    </group>
  );
}

function Particles({ snow = false }: { snow?: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const count = snow ? 650 : 1100;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 13;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    return arr;
  }, [snow]);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i) - delta * (snow ? 0.65 : 5.5);
      pos.setY(i, y < -5 ? 5 : y);
      if (snow) pos.setX(i, pos.getX(i) + Math.sin(i + performance.now() * 0.0007) * delta * 0.12);
    }
    pos.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial color={snow ? "#e8f7ff" : "#b9e7ff"} size={snow ? 0.055 : 0.025} transparent opacity={snow ? 0.9 : 0.6} sizeAttenuation />
    </points>
  );
}

function SceneContent({ kind }: { kind: Kind }) {
  return (
    <>
      <ambientLight intensity={kind === "night" ? 0.45 : 1.15} />
      <pointLight position={[2, 2, 3]} intensity={kind === "sun" ? 2.8 : 1.2} color="#ffd59b" />
      {kind === "sun" && <SunObject />}
      {(kind === "cloud" || kind === "rain") && <>
        <CloudObject position={[-1.8, 0.7, 0]} scale={1.2} />
        <CloudObject position={[1.1, 1.1, -0.8]} scale={1.45} />
        <CloudObject position={[3.5, 0.2, -1]} scale={0.85} />
      </>}
      {kind === "rain" && <Particles />}
      {kind === "snow" && <Particles snow />}
      {kind === "night" && <><Stars radius={80} depth={45} count={900} factor={3} saturation={0} fade speed={0.5} /><mesh position={[1.3, 0.4, -1]}><sphereGeometry args={[0.78, 40, 40]} /><meshStandardMaterial color="#e7efff" emissive="#8ba9ed" emissiveIntensity={0.65} /></mesh></>}
    </>
  );
}

export default function WeatherScene({ kind }: { kind: string }) {
  const safeKind: Kind = ["sun", "cloud", "rain", "snow", "night"].includes(kind) ? kind as Kind : "sun";
  return (
    <div className="weather-scene" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]}>
        <SceneContent kind={safeKind} />
      </Canvas>
    </div>
  );
}
