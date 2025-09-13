"use client";

import React, { useCallback, useState } from "react";
import  {
    ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import { Circle, MapPin, CloudSun, Stethoscope, Activity } from "lucide-react";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Welcome to Swastha Shiksya 🌿" },
    position: { x: 250, y: 0 },
    style: {
      background: "#e6f0ff",
      color: "#0047b3",
      border: "2px solid #0047b3",
      borderRadius: 10,
      padding: 10,
      fontWeight: "bold",
    },
  },
  {
    id: "2",
    data: { label: "🩺 Symptom Checker" },
    position: { x: 100, y: 150 },
    style: {
      background: "#ffe6e6",
      color: "#b30000",
      border: "2px solid #b30000",
      borderRadius: 10,
      padding: 10,
    },
  },
  {
    id: "3",
    data: { label: "🌤️ Weather & Air Analytics" },
    position: { x: 400, y: 150 },
    style: {
      background: "#e6f0ff",
      color: "#0047b3",
      border: "2px solid #0047b3",
      borderRadius: 10,
      padding: 10,
    },
  },
  {
    id: "4",
    data: { label: "📍 Nearest Doctors & Hospitals" },
    position: { x: 250, y: 300 },
    style: {
      background: "#ffe6e6",
      color: "#b30000",
      border: "2px solid #b30000",
      borderRadius: 10,
      padding: 10,
    },
  },
  {
    id: "5",
    type: "output",
    data: { label: "Chat with AI 🤖" },
    position: { x: 250, y: 450 },
    style: {
      background: "#e6f0ff",
      color: "#0047b3",
      border: "2px solid #0047b3",
      borderRadius: 10,
      padding: 10,
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#0047b3" } },
  { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#0047b3" } },
  { id: "e2-4", source: "2", target: "4", animated: true, style: { stroke: "#b30000" } },
  { id: "e3-4", source: "3", target: "4", animated: true, style: { stroke: "#0047b3" } },
  { id: "e4-5", source: "4", target: "5", animated: true, style: { stroke: "#b30000" } },
];

export default function HealthFlowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds:any) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100vh", background: "#fff" }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          style={{ background: "#fff" }}
        >
          {/* <MiniMap
            nodeColor={(node) => {
              if (node.style?.background === "#e6f0ff") return "#0047b3";
              if (node.style?.background === "#ffe6e6") return "#b30000";
              return "#eee";
            }}
          /> */}
          <Controls />
          <Background color="#aaa" gap={16} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
