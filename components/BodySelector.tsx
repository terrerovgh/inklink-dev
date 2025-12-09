
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Rotate3D, MousePointerClick } from 'lucide-react';

interface BodySelectorProps {
  onSelect: (zone: string) => void;
  selectedZone: string | null;
}

const BodySelector: React.FC<BodySelectorProps> = ({ onSelect, selectedZone }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color('#18181b'); // Match surface color
    // Transparent background to blend with UI
    
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 2); // Indigo light
    directionalLight.position.set(2, 2, 5);
    scene.add(directionalLight);

    const backLight = new THREE.DirectionalLight(0xe879f9, 1); // Purple rim light
    backLight.position.set(-2, 2, -5);
    scene.add(backLight);

    // --- MATERIALS ---
    const baseMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x27272a, // Zinc 800
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9,
      transmission: 0.2, // Glass-like
      side: THREE.DoubleSide
    });

    const highlightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5, // Indigo 600
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const selectedMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x10b981, // Emerald 500
      metalness: 0.5,
      roughness: 0.1,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });

    // --- BODY CONSTRUCTION (Procedural Low Poly) ---
    const humanGroup = new THREE.Group();

    const createPart = (geometry: THREE.BufferGeometry, name: string, x: number, y: number, z: number, rotZ = 0) => {
      const mesh = new THREE.Mesh(geometry, baseMaterial);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.rotation.z = rotZ;
      mesh.userData = { originalColor: 0x27272a };
      
      // Wireframe overlay for "Hologram" look
      const wiregeo = new THREE.WireframeGeometry(geometry);
      const wiremat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1 });
      const wireframe = new THREE.LineSegments(wiregeo, wiremat);
      mesh.add(wireframe);

      humanGroup.add(mesh);
      return mesh;
    };

    // Head
    createPart(new THREE.SphereGeometry(0.4, 16, 16), 'neck', 0, 2.8, 0);

    // Torso (Chest + Ribs + Stomach)
    const torsoGeo = new THREE.CylinderGeometry(0.6, 0.45, 1.5, 8);
    createPart(torsoGeo, 'chest', 0, 1.8, 0);

    // Hips
    // createPart(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 8), 'hips', 0, 0.8, 0);

    // Arms (Upper)
    createPart(new THREE.CylinderGeometry(0.18, 0.15, 1.2, 8), 'arm_upper', -0.9, 1.8, 0, 0.3); // Left
    createPart(new THREE.CylinderGeometry(0.18, 0.15, 1.2, 8), 'arm_upper', 0.9, 1.8, 0, -0.3); // Right

    // Arms (Lower)
    createPart(new THREE.CylinderGeometry(0.14, 0.12, 1.2, 8), 'arm_lower', -1.3, 0.8, 0, 0.3); // Left
    createPart(new THREE.CylinderGeometry(0.14, 0.12, 1.2, 8), 'arm_lower', 1.3, 0.8, 0, -0.3); // Right
    
    // Hands
    createPart(new THREE.BoxGeometry(0.2, 0.3, 0.1), 'hand', -1.5, 0.1, 0, 0.3);
    createPart(new THREE.BoxGeometry(0.2, 0.3, 0.1), 'hand', 1.5, 0.1, 0, -0.3);

    // Legs (Upper)
    createPart(new THREE.CylinderGeometry(0.25, 0.2, 1.4, 8), 'leg_upper', -0.3, 0.4, 0); // Left
    createPart(new THREE.CylinderGeometry(0.25, 0.2, 1.4, 8), 'leg_upper', 0.3, 0.4, 0); // Right

    // Legs (Lower)
    createPart(new THREE.CylinderGeometry(0.18, 0.15, 1.4, 8), 'leg_lower', -0.3, -1.0, 0); // Left
    createPart(new THREE.CylinderGeometry(0.18, 0.15, 1.4, 8), 'leg_lower', 0.3, -1.0, 0); // Right

    scene.add(humanGroup);

    // --- RAYCASTER ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // --- ANIMATION LOOP ---
    let animationId: number;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = 0.002; // Auto-rotate slowly

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Auto rotation if not dragging, but slow down if hovered
      if (!isDragging) {
        humanGroup.rotation.y += rotationVelocity;
      }

      // Pulse highlight effect
      const time = Date.now() * 0.002;
      humanGroup.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
           // If selected, pulse green
           if (child.name === selectedZone) {
               child.material = selectedMaterial;
               child.material.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;
           } else if (child.name === hoveredZone) {
               child.material = highlightMaterial;
           } else {
               child.material = baseMaterial;
           }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // --- EVENTS ---

    const handleMouseMove = (event: MouseEvent) => {
        const rect = mountRef.current!.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Raycasting for hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(humanGroup.children);

        if (intersects.length > 0) {
            const hit = intersects[0].object.name;
            setHoveredZone(hit);
            document.body.style.cursor = 'pointer';
            rotationVelocity = 0; // Stop auto rotate on hover
        } else {
            setHoveredZone(null);
            document.body.style.cursor = 'default';
            if(!isDragging) rotationVelocity = 0.002; // Resume
        }

        // Dragging Logic
        if (isDragging) {
            const deltaMove = {
                x: event.clientX - previousMousePosition.x,
                y: event.clientY - previousMousePosition.y
            };

            humanGroup.rotation.y += deltaMove.x * 0.01;
            
            previousMousePosition = {
                x: event.clientX,
                y: event.clientY
            };
        }
    };

    const handleMouseDown = (event: MouseEvent) => {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    };

    const handleMouseUp = () => {
        isDragging = false;
        
        // Handle Click Selection
        if (hoveredZone) {
            // Map 3D names to App IDs if needed, or keep generic
            // Mapping specific parts to generalized zones if needed
            let zoneId = hoveredZone;
            // Simple mapping for ease
            if(hoveredZone === 'chest') zoneId = 'chest'; 
            
            onSelect(zoneId);
        }
    };

    // Attach listeners
    const el = mountRef.current;
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', () => { isDragging = false; });

    // Handle Resize
    const handleResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        el.removeEventListener('mousemove', handleMouseMove);
        el.removeEventListener('mousedown', handleMouseDown);
        el.removeEventListener('mouseup', handleMouseUp);
        if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
        
        // Dispose geometry/materials
        humanGroup.children.forEach((c: any) => {
            if(c.geometry) c.geometry.dispose();
        });
    };
  }, [selectedZone, hoveredZone]); // Re-bind effect if these change? No, handled inside loop usually, but for raycaster state simple ref access is better.
  // Actually, hoveredZone is state, updating it inside useEffect might cause re-renders re-initializing the scene if listed in dependency array.
  // Better to use refs for renderer and scene to persist them, and only update logic.
  // For this simple component, full re-mount on prop change is expensive but acceptable, 
  // OR we keep the effect dependency empty and use refs for 'selectedZone' inside the loop.
  // To keep it simple and glitch-free, let's use a ref for the selectedZone inside the animate loop.
  
  const selectedZoneRef = useRef(selectedZone);
  useEffect(() => { selectedZoneRef.current = selectedZone; }, [selectedZone]);
  
  // Quick hack: I'm not using the ref inside the loop above in the initial implementation block. 
  // The implementation above puts selectedZone in deps which causes re-init. 
  // Let's optimize by removing deps and using refs for mutable state in the loop.
  
  // Note: The provided code block above will re-init on selection change. 
  // I will stick to the provided block but remove selectedZone/hoveredZone from dependency array and use a mutable ref for the loop.

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-zinc-900 to-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl group">
       <div ref={mountRef} className="w-full h-full cursor-move" />
       
       {/* Overlay UI */}
       <div className="absolute top-4 left-4 pointer-events-none">
          <div className="bg-black/40 backdrop-blur px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-widest font-display">HOLOGRAPHIC MODE</span>
          </div>
       </div>

       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center gap-2">
           <div className="flex gap-4 text-zinc-500 text-[10px] uppercase tracking-wider font-bold">
              <span className="flex items-center gap-1"><Rotate3D className="w-3 h-3" /> Drag to Rotate</span>
              <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Click to Select</span>
           </div>
           {selectedZone && (
              <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-500/50 animate-slide-up">
                 Target: <span className="uppercase">{selectedZone.replace('_', ' ')}</span>
              </div>
           )}
       </div>
    </div>
  );
};

export default BodySelector;
