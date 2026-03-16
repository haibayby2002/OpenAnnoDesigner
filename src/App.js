import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PALETTE_ITEMS = [
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "checkbox", label: "Checkbox" },
  { type: "radio", label: "Radio" },
];

const DEFAULT_NODE_PROPS = {
  text: { width: 140, height: 40, content: "Double-click to edit" },
  image: {
    width: 160,
    height: 100,
    content:
      "https://images.pexels.com/photos/2486168/pexels-photo-2486168.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  checkbox: { width: 160, height: 30, content: "Checkbox label" },
  radio: { width: 160, height: 30, content: "Radio label" },
};

const DIAGRAM_ENGINE = "figma-demo-editor";
const DIAGRAM_VERSION = "1.0";

let idCounter = 1;

function createNode(type, x, y) {
  const base = DEFAULT_NODE_PROPS[type] || { width: 120, height: 40, content: "" };
  return {
    id: `node-${idCounter++}`,
    type,
    x,
    y,
    width: base.width,
    height: base.height,
    content: base.content,
  };
}

function App() {
  const [nodes, setNodes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [dragState, setDragState] = useState(null); // { id, offsetX, offsetY }
  const [resizeState, setResizeState] = useState(null); // { id, edge, startX, startY, startWidth, startHeight }
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");

  const canvasRef = useRef(null);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) || null,
    [nodes, selectedId]
  );

  // keep export UI in sync with internal state
  const nodesForExport = useMemo(
    () =>
      nodes.map(({ id, type, x, y, width, height, content }) => ({
        id,
        type,
        x,
        y,
        width,
        height,
        content,
      })),
    [nodes]
  );

  const exportDoc = useMemo(
    () => ({
      header: {
        version: DIAGRAM_VERSION,
        engine: DIAGRAM_ENGINE,
      },
      body: {
        core: {
          nodes: nodesForExport,
        },
      },
    }),
    [nodesForExport]
  );

  useEffect(() => {
    try {
      const encoded = JSON.stringify(exportDoc, null, 2);
      setRawJson((prev) => {
        // Avoid infinite loops: only update if representation changed
        return prev === encoded ? prev : encoded;
      });
      setJsonError("");
    } catch (err) {
      // Should not happen, but keep safe
      setJsonError("Failed to encode JSON");
    }
  }, [exportDoc]);

  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.setData("application/x-node-type", type);
    e.dataTransfer.effectAllowed = "copy";
  };

  const getCanvasPosition = useCallback((event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-node-type");
    if (!type) return;
    const { x, y } = getCanvasPosition(e);
    setNodes((prev) => [...prev, createNode(type, x - 40, y - 20)]);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleNodeMouseDown = (e, id) => {
    e.stopPropagation();
    const canvasPos = getCanvasPosition(e);
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setSelectedId(id);
    setDragState({
      id,
      offsetX: canvasPos.x - node.x,
      offsetY: canvasPos.y - node.y,
    });
  };

  const handleCanvasMouseDown = () => {
    setSelectedId(null);
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const canvasPos = getCanvasPosition(e);

    // Dragging
    if (dragState) {
      setNodes((prev) =>
        prev.map((node) =>
          node.id === dragState.id
            ? {
                ...node,
                x: canvasPos.x - dragState.offsetX,
                y: canvasPos.y - dragState.offsetY,
              }
            : node
        )
      );
    }

    // Resizing
    if (resizeState) {
      const dx = canvasPos.x - resizeState.startX;
      const dy = canvasPos.y - resizeState.startY;
      setNodes((prev) =>
        prev.map((node) => {
          if (node.id !== resizeState.id) return node;
          let { width, height, x, y } = node;
          if (resizeState.edge.includes("right")) {
            width = Math.max(40, resizeState.startWidth + dx);
          }
          if (resizeState.edge.includes("bottom")) {
            height = Math.max(30, resizeState.startHeight + dy);
          }
          if (resizeState.edge.includes("left")) {
            const newWidth = Math.max(40, resizeState.startWidth - dx);
            const delta = newWidth - width;
            width = newWidth;
            x -= delta;
          }
          if (resizeState.edge.includes("top")) {
            const newHeight = Math.max(30, resizeState.startHeight - dy);
            const delta = newHeight - height;
            height = newHeight;
            y -= delta;
          }
          return { ...node, width, height, x, y };
        })
      );
    }
  };

  const endDragOrResize = () => {
    setDragState(null);
    setResizeState(null);
  };

  const handleDoubleClick = (id) => {
    setEditingId(id);
  };

  const handleContentChange = (id, value) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, content: value } : node))
    );
  };

  const handleResizeMouseDown = (e, id, edge) => {
    e.stopPropagation();
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    const { x, y } = getCanvasPosition(e);
    setSelectedId(id);
    setResizeState({
      id,
      edge,
      startX: x,
      startY: y,
      startWidth: node.width,
      startHeight: node.height,
    });
  };

  const handlePositionInputChange = (field, value) => {
    if (!selectedNode) return;
    const numeric = parseInt(value, 10);
    if (Number.isNaN(numeric)) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.id === selectedNode.id ? { ...node, [field]: numeric } : node
      )
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedNode) return;
    setNodes((prev) => prev.filter((n) => n.id !== selectedNode.id));
    setSelectedId(null);
    if (editingId === selectedNode.id) {
      setEditingId(null);
    }
  };

  const handleJsonChange = (value) => {
    setRawJson(value);
    if (!value.trim()) {
      setNodes([]);
      setSelectedId(null);
      setEditingId(null);
      setJsonError("");
      return;
    }

    try {
      const parsed = JSON.parse(value);
      let incomingNodes = null;

      // Back-compat: previous format was just an array of nodes
      if (Array.isArray(parsed)) {
        incomingNodes = parsed;
      } else if (parsed && typeof parsed === "object") {
        const bodyNodes = parsed?.body?.core?.nodes;
        if (Array.isArray(bodyNodes)) {
          incomingNodes = bodyNodes;
        }
      }

      if (!incomingNodes) {
        throw new Error(
          'Expected an array of nodes OR an object with "body.core.nodes" array'
        );
      }

      const cleaned = incomingNodes
        .map((item, index) => {
          if (!item || typeof item !== "object") return null;
          const type = item.type;
          if (!["text", "image", "checkbox", "radio"].includes(type)) return null;

          const x = Number.isFinite(item.x) ? item.x : 40 + index * 20;
          const y = Number.isFinite(item.y) ? item.y : 40 + index * 20;
          const width = Number.isFinite(item.width)
            ? item.width
            : DEFAULT_NODE_PROPS[type]?.width || 120;
          const height = Number.isFinite(item.height)
            ? item.height
            : DEFAULT_NODE_PROPS[type]?.height || 40;
          const content =
            typeof item.content === "string"
              ? item.content
              : DEFAULT_NODE_PROPS[type]?.content || "";

          let id = typeof item.id === "string" && item.id ? item.id : `node-${idCounter++}`;
          return { id, type, x, y, width, height, content };
        })
        .filter(Boolean);

      // update idCounter so new nodes don't clash
      cleaned.forEach((n) => {
        const match = /^node-(\d+)$/.exec(n.id);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num >= idCounter) idCounter = num + 1;
        }
      });

      setNodes(cleaned);
      setSelectedId(null);
      setEditingId(null);
      setJsonError("");
    } catch (err) {
      setJsonError(err.message || "Invalid JSON");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#111827",
        background: "#f3f4f6",
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={endDragOrResize}
      onMouseLeave={endDragOrResize}
    >
      {/* Left palette */}
      <div
        style={{
          width: 220,
          borderRight: "1px solid #e5e7eb",
          padding: "12px 10px",
          background: "#f9fafb",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Components</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
          Drag an item into the canvas.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PALETTE_ITEMS.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, item.type)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                fontSize: 13,
                cursor: "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
              }}
            >
              <span>{item.label}</span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>drag</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main canvas area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            height: 44,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "#ffffff",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600 }}>Diagram editor</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedNode}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: selectedNode ? "#fee2e2" : "#f9fafb",
                color: selectedNode ? "#b91c1c" : "#9ca3af",
                fontSize: 12,
                cursor: selectedNode ? "pointer" : "default",
              }}
            >
              Delete selected
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Canvas */}
          <div
            ref={canvasRef}
            onDrop={handleCanvasDrop}
            onDragOver={handleCanvasDragOver}
            onMouseDown={handleCanvasMouseDown}
            style={{
              flex: 1.4,
              position: "relative",
              backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              backgroundColor: "#f9fafb",
              overflow: "auto",
            }}
          >
            {nodes.map((node) => {
              const isSelected = node.id === selectedId;
              const isEditing = node.id === editingId;

              const commonStyle = {
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderRadius: 8,
                border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
                background: "#ffffff",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(37,99,235,0.15), 0 4px 10px rgba(15,23,42,0.08)"
                  : "0 2px 6px rgba(15,23,42,0.06)",
                boxSizing: "border-box",
                padding: 8,
                cursor: dragState && dragState.id === node.id ? "grabbing" : "grab",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                backgroundClip: "padding-box",
              };

              let contentEl = null;
              if (node.type === "text") {
                if (isEditing) {
                  contentEl = (
                    <textarea
                      autoFocus
                      value={node.content}
                      onChange={(e) => handleContentChange(node.id, e.target.value)}
                      onBlur={() => setEditingId(null)}
                      style={{
                        width: "100%",
                        height: "100%",
                        fontSize: 13,
                        resize: "none",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                      }}
                    />
                  );
                } else {
                  contentEl = (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        fontSize: 13,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        color: "#111827",
                      }}
                    >
                      {node.content}
                    </div>
                  );
                }
              } else if (node.type === "image") {
                contentEl = (
                  <img
                    src={node.content}
                    alt="Node"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "cover",
                      borderRadius: 6,
                    }}
                    draggable={false}
                  />
                );
              } else if (node.type === "checkbox") {
                contentEl = (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      width: "100%",
                    }}
                  >
                    <input type="checkbox" disabled />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={node.content}
                        onChange={(e) => handleContentChange(node.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        style={{
                          flex: 1,
                          border: "none",
                          outline: "none",
                          fontSize: 13,
                          background: "transparent",
                        }}
                      />
                    ) : (
                      <span>{node.content}</span>
                    )}
                  </label>
                );
              } else if (node.type === "radio") {
                contentEl = (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      width: "100%",
                    }}
                  >
                    <input type="radio" disabled />
                    {isEditing ? (
                      <input
                        autoFocus
                        value={node.content}
                        onChange={(e) => handleContentChange(node.id, e.target.value)}
                        onBlur={() => setEditingId(null)}
                        style={{
                          flex: 1,
                          border: "none",
                          outline: "none",
                          fontSize: 13,
                          background: "transparent",
                        }}
                      />
                    ) : (
                      <span>{node.content}</span>
                    )}
                  </label>
                );
              }

              return (
                <div
                  key={node.id}
                  style={commonStyle}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                  onDoubleClick={() => handleDoubleClick(node.id)}
                >
                  {contentEl}

                  {/* Resize handles */}
                  {isSelected && (
                    <>
                      {/* corners */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "top-left")}
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#2563eb",
                          top: -5,
                          left: -5,
                          cursor: "nwse-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "top-right")}
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#2563eb",
                          top: -5,
                          right: -5,
                          cursor: "nesw-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "bottom-left")}
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#2563eb",
                          bottom: -5,
                          left: -5,
                          cursor: "nesw-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "bottom-right")}
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "#2563eb",
                          bottom: -5,
                          right: -5,
                          cursor: "nwse-resize",
                        }}
                      />

                      {/* edges */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "top")}
                        style={{
                          position: "absolute",
                          height: 6,
                          width: 24,
                          top: -3,
                          left: "50%",
                          transform: "translateX(-50%)",
                          cursor: "ns-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "bottom")}
                        style={{
                          position: "absolute",
                          height: 6,
                          width: 24,
                          bottom: -3,
                          left: "50%",
                          transform: "translateX(-50%)",
                          cursor: "ns-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "left")}
                        style={{
                          position: "absolute",
                          width: 6,
                          height: 24,
                          left: -3,
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "ew-resize",
                        }}
                      />
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.id, "right")}
                        style={{
                          position: "absolute",
                          width: 6,
                          height: 24,
                          right: -3,
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "ew-resize",
                        }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side: properties + JSON */}
          <div style={{ width: 360, display: "flex", flexDirection: "column" }}>
            {/* Properties */}
            <div
              style={{
                borderLeft: "1px solid #e5e7eb",
                padding: 12,
                background: "#f9fafb",
                boxSizing: "border-box",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Properties
              </div>
              {selectedNode ? (
                <>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      marginBottom: 10,
                      textTransform: "capitalize",
                    }}
                  >
                    Selected: {selectedNode.type}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: 8,
                      fontSize: 12,
                      alignItems: "center",
                    }}
                  >
                    <label>X</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.x)}
                      onChange={(e) => handlePositionInputChange("x", e.target.value)}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                    <label>Y</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.y)}
                      onChange={(e) => handlePositionInputChange("y", e.target.value)}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                    <label>Width</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.width)}
                      onChange={(e) => handlePositionInputChange("width", e.target.value)}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                    <label>Height</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.height)}
                      onChange={(e) => handlePositionInputChange("height", e.target.value)}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  {selectedNode.type === "image" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>Image URL</div>
                      <input
                        type="text"
                        value={selectedNode.content}
                        onChange={(e) =>
                          handleContentChange(selectedNode.id, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "4px 6px",
                          borderRadius: 6,
                          border: "1px solid #d1d5db",
                          fontSize: 12,
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  Select a component on the canvas to edit its properties.
                </div>
              )}
            </div>

            {/* JSON export/import */}
            <div
              style={{
                flex: 1,
                borderTop: "1px solid #e5e7eb",
                borderLeft: "1px solid #e5e7eb",
                padding: 10,
                background: "#ffffff",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600 }}>Diagram JSON</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  Live encode/decode (copy & paste)
                </div>
              </div>
              <textarea
                value={rawJson}
                onChange={(e) => handleJsonChange(e.target.value)}
                spellCheck={false}
                style={{
                  flex: 1,
                  width: "100%",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                  fontSize: 11.5,
                  padding: 8,
                  borderRadius: 8,
                  border: jsonError ? "1px solid #dc2626" : "1px solid #d1d5db",
                  background: "#f9fafb",
                  resize: "none",
                  boxSizing: "border-box",
                }}
              />
              <div
                style={{
                  fontSize: 11,
                  color: jsonError ? "#b91c1c" : "#6b7280",
                  minHeight: 16,
                }}
              >
                {jsonError
                  ? `Error: ${jsonError}`
                  : 'Format: { header: { version, engine }, body: { core: { nodes: [...] } } }'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

