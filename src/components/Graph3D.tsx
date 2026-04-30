"use client";

import { useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";

export interface Graph3DHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitAll: () => void;
  cameraPosition: (pos: any, lookAt?: any, ms?: number) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
}

interface Props {
  graphData: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  width: number;
  height: number;
  backgroundColor: string;
  nodeThreeObject: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  nodeLabel: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  nodeVal: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  linkColor: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  linkWidth: number;
  linkOpacity: number;
  onNodeClick: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  autoRotate?: boolean;
  onReady?: (handle: Graph3DHandle) => void;
}

export function Graph3DWrapper(props: Props) {
  const fgRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  // Expose handle to parent via callback — only once after mount
  const readySent = useRef(false);
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || !props.onReady || readySent.current) return;
    readySent.current = true;
    props.onReady({
      zoomIn: () => {
        const p = fg.cameraPosition();
        fg.cameraPosition({ x: p.x * 0.7, y: p.y * 0.7, z: p.z * 0.7 }, undefined, 300);
      },
      zoomOut: () => {
        const p = fg.cameraPosition();
        fg.cameraPosition({ x: p.x * 1.4, y: p.y * 1.4, z: p.z * 1.4 }, undefined, 300);
      },
      fitAll: () => fg.zoomToFit(400, 100),
      cameraPosition: (pos, lookAt, ms) => fg.cameraPosition(pos, lookAt, ms),
    });
  });

  // Setup after mount
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    const timer = setTimeout(() => {
      fg.d3Force("charge")?.strength(0);
      fg.d3Force("link")?.strength(0);
      fg.zoomToFit(600, 120);
      const controls = fg.controls();
      if (controls) {
        controls.autoRotate = props.autoRotate ?? true;
        controls.autoRotateSpeed = 0.3;
        controls.minDistance = 200;
        controls.maxDistance = 1800;
        controls.enableDamping = true;
        controls.dampingFactor = 0.1;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [props.autoRotate]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={props.graphData}
      width={props.width}
      height={props.height}
      backgroundColor={props.backgroundColor}
      nodeThreeObject={props.nodeThreeObject}
      nodeLabel={props.nodeLabel}
      nodeVal={props.nodeVal}
      linkColor={props.linkColor}
      linkWidth={props.linkWidth}
      linkOpacity={props.linkOpacity}
      onNodeClick={props.onNodeClick}
      enableNodeDrag={false}
      enableNavigationControls={true}
      showNavInfo={false}
      cooldownTime={0}
      d3AlphaDecay={1}
      d3VelocityDecay={1}
    />
  );
}
