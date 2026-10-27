"use client";

import { useEffect, useRef } from "react";

// Jardin 3D du chevalier, fixé derrière le contenu.
// Three.js n'est chargé que côté navigateur ; sans WebGL, le dégradé de .garden reste visible.
export function KnightGarden() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    import("@/lib/knight-garden")
      .then(({ mount }) => {
        if (!cancelled && ref.current) cleanup = mount(ref.current);
      })
      .catch((err) => console.error(err));

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div className="garden" aria-hidden="true">
      <div className="garden-canvas" ref={ref} />
      <div className="garden-veil" />
    </div>
  );
}
