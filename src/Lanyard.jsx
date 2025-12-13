import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, Text } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { cards } from './data';
import cardGLB from './assets/card.glb';
import * as THREE from 'three';
import './Lanyard.css';
import { useNavigate } from 'react-router-dom';

extend({ MeshLineGeometry, MeshLineMaterial });

export default function Lanyard({ selectedCard, spacing = 10, position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredCards = selectedCard ? cards.filter(c => c.title === selectedCard) : cards;


  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          {filteredCards.map((card, i) => (
            <Band key={i} card={card} position={[(i - (filteredCards.length - 1) / 2) * spacing, 0, 0]} isMobile={isMobile} />
          ))}
        </Physics>

      </Canvas>
    </div>
  );
}

function Band({ card, position, maxSpeed = 50, minSpeed = 0, isMobile = false }) {
  const navigate = useNavigate();
  const band = useRef();
  const fixed = useRef();
  const j1 = useRef();
  const j2 = useRef();
  const j3 = useRef();
  const cardRef = useRef();
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const segmentProps = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials } = useGLTF(cardGLB);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState(false);
  const [hovered, hover] = useState(false);
  const pointerDownPos = useRef(null);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 0.69]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 0.69]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 0.69]);
  useSphericalJoint(j3, cardRef, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  const handleTagClick = () => {
    switch (card.title) {
      case '+ NEW Learning':
        navigate('/learning');
        break;
      case 'ToDo List':
        navigate('/todolist');
        break;
      case 'ASK AI':
        navigate('/ask-ai');
        break;
      default:
        break;
    }
  };

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [cardRef, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      cardRef.current?.setNextKinematicTranslation({ x: vec.x - dragged.x, y: vec.y - dragged.y, z: vec.z - dragged.z });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(cardRef.current.angvel());
      rot.copy(cardRef.current.rotation());
      cardRef.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';

  const lineGeometry = <meshLineGeometry />;

  return (
    <>
      <group position={position}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" position={[0, 5, 0]} />
        <RigidBody position={[0.5, 1.5, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={cardRef} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
              if (pointerDownPos.current) {
                const distance = e.point.distanceTo(pointerDownPos.current);
                if (distance < 0.05) { // Threshold to differentiate click from drag
                  handleTagClick();
                }
              }
              pointerDownPos.current = null;
            }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              pointerDownPos.current = e.point.clone();
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(cardRef.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={materials.base.map}
                map-anisotropy={16}
                clearcoat={isMobile ? 0 : 1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
                color={card.color}
              />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
            <Text
              position={[0, 0, 0.06]}
              fontSize={0.2}
              color="white"
              anchorX="center"
      anchorY="middle"
            >
              {card.title}
            </Text>
          </group>
        </RigidBody>
      </group>

      <group>
        <mesh>
          {lineGeometry}
          <meshLineMaterial
            color={'#FF00FF'}
            depthTest={false}
            resolution={isMobile ? [1000, 2000] : [1000, 1000]}
            lineWidth={50}
            opacity={0.8}
            transparent={true}
          />
        </mesh>

        <mesh ref={band}>
          {lineGeometry}
          <meshLineMaterial
            color={'#D8BFD8'}
            depthTest={false}
            resolution={isMobile ? [1000, 2000] : [1000, 1000]}
            lineWidth={1}
            opacity={0.8}
            transparent={true}
          />
        </mesh>
      </group>
    </>
  );
}
