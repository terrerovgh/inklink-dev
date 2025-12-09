
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, MousePointerClick, Layers } from 'lucide-react';

interface BodySelectorProps {
  onSelect: (zone: string) => void;
  selectedZone: string | null;
}

const BodySelector: React.FC<BodySelectorProps> = ({ onSelect, selectedZone }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // Ref for mutable state needed inside the animation loop to avoid re-binding effects
  const stateRef = useRef({
    selectedZone,
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },
    rotationVelocity: 0.002,
    mouse: new THREE.Vector2(),
    lastRaycastTime: 0
  });

  // Sync prop to ref
  useEffect(() => {
    stateRef.current.selectedZone = selectedZone;
  }, [selectedZone]);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 6.5;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    mountRef.current.appendChild(renderer.domElement);

    // --- MATERIALS ---
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x27272a, // Zinc 800
      metalness: 0.6,
      roughness: 0.4,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide // Important for split geometry
    });

    const highlightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1, // Indigo 500
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x6366f1,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });

    const selectedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Emerald 500
      metalness: 0.8,
      roughness: 0.2,
      emissive: 0x10b981,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide
    });

    const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.05 });

    // --- GEOMETRY HELPERS ---
    const humanGroup = new THREE.Group();

    // Helper to add wireframe to a mesh
    const addWireframe = (mesh: THREE.Mesh, geometry: THREE.BufferGeometry) => {
      const wiregeo = new THREE.WireframeGeometry(geometry);
      const wireframe = new THREE.LineSegments(wiregeo, wireMat);
      mesh.add(wireframe);
    };

    // 1. Simple Part Builder
    const createSimplePart = (geometry: THREE.BufferGeometry, name: string, x: number, y: number, z: number) => {
      const mesh = new THREE.Mesh(geometry, baseMaterial);
      mesh.name = name;
      mesh.position.set(x, y, z);
      addWireframe(mesh, geometry);
      humanGroup.add(mesh);
    };

    // 2. Split Limb Builder (Creates Inner/Outer or Front/Back halves)
    // orientation: 'horizontal' (for arms - split top/bottom relative to cylinder rotation) 
    //              or 'vertical' (for legs - split front/back)
    const createSplitLimb = (
        nameBase: string, 
        radiusTop: number, radiusBottom: number, height: number, 
        x: number, y: number, z: number, 
        rotZ: number, 
        splitType: 'arm_left' | 'arm_right' | 'leg'
    ) => {
        const radialSegs = 12;
        
        // Configuration for the split based on limb type
        let part1Name = '', part2Name = '';
        let rotOffset1 = 0, rotOffset2 = 0;

        if (splitType === 'arm_left') {
            // Left Arm: Outer faces Left (-X), Inner faces Right (+X)
            // Cylinder default rotation needs adjustment
            part1Name = `${nameBase}_outer`;
            part2Name = `${nameBase}_inner`;
            rotOffset1 = Math.PI; // Back half
            rotOffset2 = 0;       // Front half
        } else if (splitType === 'arm_right') {
            part1Name = `${nameBase}_inner`; // Inner faces Left (-X) relative to arm
            part2Name = `${nameBase}_outer`;
            rotOffset1 = Math.PI; 
            rotOffset2 = 0;
        } else {
            // Legs: Front (+Z), Back (-Z)
            // Rotate cylinder 90deg on Y to split front/back
            part1Name = `${nameBase}_front`;
            part2Name = `${nameBase}_back`;
            rotOffset1 = -Math.PI / 2;
            rotOffset2 = Math.PI / 2;
        }

        // Half 1
        const geo1 = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegs, 1, false, 0, Math.PI);
        const mesh1 = new THREE.Mesh(geo1, baseMaterial);
        mesh1.name = part1Name;
        mesh1.position.set(0, 0, 0);
        mesh1.rotation.y = rotOffset1;
        addWireframe(mesh1, geo1);

        // Half 2
        const geo2 = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegs, 1, false, 0, Math.PI);
        const mesh2 = new THREE.Mesh(geo2, baseMaterial);
        mesh2.name = part2Name;
        mesh2.position.set(0, 0, 0);
        mesh2.rotation.y = rotOffset2;
        addWireframe(mesh2, geo2);

        // Container for the whole limb to handle position/rotation
        const limbContainer = new THREE.Group();
        limbContainer.position.set(x, y, z);
        limbContainer.rotation.z = rotZ;
        
        // For legs, we need to rotate the container on Y to align the split to Front/Back correctly relative to camera
        if (splitType === 'leg') {
            limbContainer.rotation.y = Math.PI / 2; 
        }

        limbContainer.add(mesh1);
        limbContainer.add(mesh2);
        humanGroup.add(limbContainer);
    };

    // --- BUILD BODY ---

    // Head
    createSimplePart(new THREE.SphereGeometry(0.4, 16, 16), 'head', 0, 2.8, 0);

    // Neck
    createSimplePart(new THREE.CylinderGeometry(0.15, 0.2, 0.3, 12), 'neck', 0, 2.4, 0);

    // Torso (Split Chest/Stomach)
    createSimplePart(new THREE.CylinderGeometry(0.55, 0.45, 0.9, 12), 'chest', 0, 1.9, 0);
    createSimplePart(new THREE.CylinderGeometry(0.45, 0.45, 0.8, 12), 'stomach', 0, 1.1, 0);
    // Hips
    createSimplePart(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 12), 'hips', 0, 0.4, 0);

    // Arms Left
    createSplitLimb('arm_upper_left', 0.16, 0.13, 1.1, -0.85, 1.8, 0, 0.3, 'arm_left');
    createSplitLimb('arm_lower_left', 0.12, 0.10, 1.1, -1.25, 0.85, 0, 0.3, 'arm_left');

    // Arms Right
    createSplitLimb('arm_upper_right', 0.16, 0.13, 1.1, 0.85, 1.8, 0, -0.3, 'arm_right');
    createSplitLimb('arm_lower_right', 0.12, 0.10, 1.1, 1.25, 0.85, 0, -0.3, 'arm_right');

    // Legs Left
    createSplitLimb('leg_upper_left', 0.23, 0.18, 1.3, -0.3, -0.3, 0, 0, 'leg'); // RotZ handled by group? No, legs are straight usually
    createSplitLimb('leg_lower_left', 0.16, 0.12, 1.3, -0.3, -1.6, 0, 0, 'leg');

    // Legs Right
    createSplitLimb('leg_upper_right', 0.23, 0.18, 1.3, 0.3, -0.3, 0, 0, 'leg');
    createSplitLimb('leg_lower_right', 0.16, 0.12, 1.3, 0.3, -1.6, 0, 0, 'leg');

    scene.add(humanGroup);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0x4f46e5, 2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0xe879f9, 1.5);
    backLight.position.set(-5, 2, -5);
    scene.add(backLight);

    // --- INTERACTION ---
    const raycaster = new THREE.Raycaster();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- ANIMATION LOOP ---
    let animationId: number;
    
    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);
      const state = stateRef.current;

      // 1. Auto Rotation
      if (!state.isDragging) {
         humanGroup.rotation.y += state.rotationVelocity;
      }

      // 2. Throttled Raycasting (Optimization)
      // Only raycast every 50ms instead of every frame
      if (time - state.lastRaycastTime > 50) {
          state.lastRaycastTime = time;
          
          raycaster.setFromCamera(state.mouse, camera);
          
          // Recursively check children
          const intersects = raycaster.intersectObjects(humanGroup.children, true);
          
          let hitName: string | null = null;
          
          // Find first valid mesh that isn't a line segment
          for (let i = 0; i < intersects.length; i++) {
              if (intersects[i].object.type === 'Mesh') {
                  hitName = intersects[i].object.name;
                  break;
              }
          }

          if (hitName !== hoveredZone) {
             setHoveredZone(hitName);
             document.body.style.cursor = hitName ? 'pointer' : 'default';
             state.rotationVelocity = hitName ? 0 : 0.002;
          }
      }

      // 3. Update Material Visuals
      // We iterate recursively to find all meshes
      humanGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
              if (child.name === state.selectedZone) {
                  child.material = selectedMaterial;
                  // Pulse effect
                  child.material.emissiveIntensity = 0.5 + Math.sin(time * 0.003) * 0.2;
              } else if (child.name === hoveredZone) {
                  child.material = highlightMaterial;
                  child.material.emissiveIntensity = 0.4;
              } else {
                  child.material = baseMaterial;
              }
          }
      });

      renderer.render(scene, camera);
    };
    
    animate(0);

    // --- DOM EVENTS ---
    const handleMouseMove = (event: MouseEvent) => {
        const rect = mountRef.current!.getBoundingClientRect();
        stateRef.current.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        stateRef.current.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        if (stateRef.current.isDragging) {
            const deltaX = event.clientX - stateRef.current.previousMousePosition.x;
            humanGroup.rotation.y += deltaX * 0.01;
            stateRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        stateRef.current.isDragging = true;
        stateRef.current.previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
        stateRef.current.isDragging = false;
        if (hoveredZone) {
            onSelect(hoveredZone);
        }
    };

    const el = mountRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', () => { stateRef.current.isDragging = false; });

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mousedown', handleMouseDown);
        el.removeEventListener('mouseup', handleMouseUp);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        // Cleanup memory
        scene.traverse((object: any) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                if (Array.isArray(object.material)) object.material.forEach((m: any) => m.dispose());
                else object.material.dispose();
            }
        });
    };
  }, [hoveredZone]); // Re-bind when hoveredZone changes to keep closure fresh? No, stateRef handles it. 
                     // Kept hoveredZone in deps to trigger re-render of effect if needed, but actually
                     // we should rely on refs for performance in the loop. 
                     // However, React needs to re-run the effect to update the closure if we weren't using refs.
                     // Since we use stateRef for everything inside animate, we are safe.

  const formatZoneName = (name: string) => {
      if (!name) return '';
      return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-zinc-900 to-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl group select-none">
       <div ref={mountRef} className="w-full h-full cursor-move active:cursor-grabbing" />
       
       {/* Overlay UI */}
       <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-widest font-display">HOLOGRAPHIC MODE</span>
          </div>
       </div>

       <div className="absolute top-4 right-4 pointer-events-none">
          <div className="flex flex-col gap-1 items-end">
              <div className="bg-black/40 backdrop-blur px-2 py-1 rounded border border-white/5 text-[10px] text-zinc-400">
                  <Layers className="w-3 h-3 inline mr-1" /> Inner/Outer Zones
              </div>
          </div>
       </div>

       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2 w-full px-4">
           {selectedZone ? (
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/50 animate-slide-up flex flex-col items-center min-w-[200px]">
                 <span className="text-[10px] text-indigo-200 uppercase tracking-wider mb-0.5">Selected Target</span>
                 <span className="text-lg">{formatZoneName(selectedZone)}</span>
              </div>
           ) : (
             <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold animate-pulse">
                Select a Body Zone
             </div>
           )}
           
           <div className="flex gap-4 text-zinc-600 text-[9px] uppercase tracking-wider font-bold mt-2">
              <span className="flex items-center gap-1"><Rotate3D className="w-3 h-3" /> Drag to Rotate</span>
              <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Click to Select</span>
           </div>
       </div>
    </div>
  );
};

export default BodySelector;
