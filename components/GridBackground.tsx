import React from 'react';

const GridBackground = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-ink-base">
        {/* Extremely subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
      
      {/* Vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)]"></div>
    </div>
  );
};

export default GridBackground;