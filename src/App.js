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

function normalizeFieldBase(type) {
  return String(type || "component")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function createUniqueFieldId(type, existingNodes) {
  const base = normalizeFieldBase(type) || "component";
  const used = new Set(existingNodes.map((n) => String(n.fieldId || "").toLowerCase()));
  let index = 1;
  while (used.has(`${base}${index}`.toLowerCase())) {
    index += 1;
  }
  return `${base}${index}`;
}

function dedupeFieldId(candidate, type, usedLowercase) {
  const fallbackBase = normalizeFieldBase(type) || "component";
  const normalizedCandidate = String(candidate || "").trim();
  const base = normalizedCandidate || fallbackBase;

  if (!usedLowercase.has(base.toLowerCase())) {
    usedLowercase.add(base.toLowerCase());
    return base;
  }

  let index = 1;
  let generated = `${fallbackBase}${index}`;
  while (usedLowercase.has(generated.toLowerCase())) {
    index += 1;
    generated = `${fallbackBase}${index}`;
  }
  usedLowercase.add(generated.toLowerCase());
  return generated;
}

function createNode(type, x, y, existingNodes) {
  const base = DEFAULT_NODE_PROPS[type] || { width: 120, height: 40, content: "" };
  return {
    fieldId: createUniqueFieldId(type, existingNodes),
    type,
    x,
    y,
    width: base.width,
    height: base.height,
    content: base.content,
    // Visual component attribute for exported/imported schema.
    enabled: true,
  };
}

function App() {
  const [nodes, setNodes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [dragState, setDragState] = useState(null); // { fieldIds, startX, startY, origins }
  const [resizeState, setResizeState] = useState(null); // { fieldId, edge, startX, startY, startWidth, startHeight }
  const [selectionBox, setSelectionBox] = useState(null); // { startX, startY, currentX, currentY, additive }
  const [contextMenu, setContextMenu] = useState(null); // { x, y }
  const [rawJson, setRawJson] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [fieldIdError, setFieldIdError] = useState("");

  const canvasRef = useRef(null);

  const selectedNode = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    return nodes.find((n) => n.fieldId === selectedIds[0]) || null;
  }, [nodes, selectedIds]);

  const isLayoutEditable = true;
  const isContentEditable = () => true;

  // keep export UI in sync with internal state
  const nodesForExport = useMemo(
    () =>
      nodes.map(({ fieldId, type, x, y, width, height, content, enabled }) => ({
        fieldId,
        type,
        x,
        y,
        width,
        height,
        content,
        enabled,
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
    setNodes((prev) => [...prev, createNode(type, x - 40, y - 20, prev)]);
  };

  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  const handleNodeMouseDown = (e, fieldId) => {
    e.stopPropagation();
    const canvasPos = getCanvasPosition(e);
    const node = nodes.find((n) => n.fieldId === fieldId);
    if (!node) return;
    const isCtrlMulti = e.ctrlKey || e.metaKey;
    if (isCtrlMulti) {
      setSelectedIds((prev) =>
        prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
      );
      return;
    }
    setSelectedIds((prev) => (prev.includes(fieldId) ? prev : [fieldId]));
    if (isLayoutEditable) {
      const fieldIdsToMove = selectedIds.includes(fieldId) ? selectedIds : [fieldId];
      const origins = {};
      fieldIdsToMove.forEach((id) => {
        const current = nodes.find((n) => n.fieldId === id);
        if (current) origins[id] = { x: current.x, y: current.y };
      });
      setDragState({
        fieldIds: fieldIdsToMove,
        startX: canvasPos.x,
        startY: canvasPos.y,
        origins,
      });
    }
  };

  const handleCanvasMouseDown = (e) => {
    setContextMenu(null);
    if (!canvasRef.current) return;
    const canvasPos = getCanvasPosition(e);
    setSelectionBox({
      startX: canvasPos.x,
      startY: canvasPos.y,
      currentX: canvasPos.x,
      currentY: canvasPos.y,
      additive: e.ctrlKey || e.metaKey,
    });
    if (!(e.ctrlKey || e.metaKey)) {
      setSelectedIds([]);
    }
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;

    const canvasPos = getCanvasPosition(e);

    // Dragging
    if (dragState) {
      const dx = canvasPos.x - dragState.startX;
      const dy = canvasPos.y - dragState.startY;
      setNodes((prev) =>
        prev.map((node) =>
          dragState.fieldIds.includes(node.fieldId)
            ? {
                ...node,
                x: (dragState.origins[node.fieldId]?.x ?? node.x) + dx,
                y: (dragState.origins[node.fieldId]?.y ?? node.y) + dy,
              }
            : node
        )
      );
    }

    if (selectionBox) {
      setSelectionBox((prev) =>
        prev
          ? {
              ...prev,
              currentX: canvasPos.x,
              currentY: canvasPos.y,
            }
          : prev
      );
    }

    // Resizing
    if (resizeState) {
      const dx = canvasPos.x - resizeState.startX;
      const dy = canvasPos.y - resizeState.startY;
      setNodes((prev) =>
        prev.map((node) => {
          if (node.fieldId !== resizeState.fieldId) return node;
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
    if (selectionBox) {
      const left = Math.min(selectionBox.startX, selectionBox.currentX);
      const right = Math.max(selectionBox.startX, selectionBox.currentX);
      const top = Math.min(selectionBox.startY, selectionBox.currentY);
      const bottom = Math.max(selectionBox.startY, selectionBox.currentY);
      const hasArea = Math.abs(selectionBox.currentX - selectionBox.startX) > 3 ||
        Math.abs(selectionBox.currentY - selectionBox.startY) > 3;
      if (!hasArea) {
        setSelectedIds([]);
      } else {
        const hitIds = nodes
          .filter((n) => n.x < right && n.x + n.width > left && n.y < bottom && n.y + n.height > top)
          .map((n) => n.fieldId);
        setSelectedIds((prev) => {
          if (selectionBox.additive) {
            const merged = new Set([...prev, ...hitIds]);
            return Array.from(merged);
          }
          return hitIds;
        });
      }
      setSelectionBox(null);
    }
  };

  const handleDoubleClick = (fieldId) => {
    const node = nodes.find((n) => n.fieldId === fieldId);
    if (!node) return;
    setEditingId(fieldId);
  };

  const handleContentChange = (fieldId, value) => {
    const node = nodes.find((n) => n.fieldId === fieldId);
    if (!node) return;
    setNodes((prev) =>
      prev.map((node) => (node.fieldId === fieldId ? { ...node, content: value } : node))
    );
  };

  const handleResizeMouseDown = (e, fieldId, edge) => {
    if (!isLayoutEditable) return;
    e.stopPropagation();
    const node = nodes.find((n) => n.fieldId === fieldId);
    if (!node) return;
    const { x, y } = getCanvasPosition(e);
    setSelectedIds([fieldId]);
    setResizeState({
      fieldId,
      edge,
      startX: x,
      startY: y,
      startWidth: node.width,
      startHeight: node.height,
    });
  };

  const handlePositionInputChange = (field, value) => {
    if (!selectedNode) return;
    if (!isLayoutEditable) return;
    const numeric = parseInt(value, 10);
    if (Number.isNaN(numeric)) return;
    setNodes((prev) =>
      prev.map((node) =>
        node.fieldId === selectedNode.fieldId ? { ...node, [field]: numeric } : node
      )
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (!isLayoutEditable) return;
    setNodes((prev) => prev.filter((n) => !selectedIds.includes(n.fieldId)));
    setSelectedIds([]);
    if (editingId && selectedIds.includes(editingId)) {
      setEditingId(null);
    }
  };

  const duplicateSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    const offset = 20;
    setNodes((prev) => {
      const selectedNodes = prev.filter((n) => selectedIds.includes(n.fieldId));
      if (selectedNodes.length === 0) return prev;
      const used = new Set(prev.map((n) => String(n.fieldId || "").toLowerCase()));
      const clones = selectedNodes.map((node) => {
        const fieldId = dedupeFieldId("", node.type, used);
        return {
          ...node,
          fieldId,
          x: node.x + offset,
          y: node.y + offset,
        };
      });
      setSelectedIds(clones.map((n) => n.fieldId));
      return [...prev, ...clones];
    });
    setEditingId(null);
    setContextMenu(null);
  }, [selectedIds]);

  const handleNodeContextMenu = (e, fieldId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIds((prev) => (prev.includes(fieldId) ? prev : [fieldId]));
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleFieldIdChange = (value) => {
    if (!selectedNode) return;
    const next = value.trim();
    if (!next) {
      setFieldIdError("Field id is required.");
      return;
    }
    const duplicate = nodes.some(
      (node) =>
        node.fieldId !== selectedNode.fieldId &&
        String(node.fieldId || "").toLowerCase() === next.toLowerCase()
    );
    if (duplicate) {
      setFieldIdError(`Field id "${next}" already exists.`);
      return;
    }
    const previousFieldId = selectedNode.fieldId;
    setFieldIdError("");
    setNodes((prev) =>
      prev.map((node) =>
        node.fieldId === previousFieldId ? { ...node, fieldId: next } : node
      )
    );
    setSelectedIds((prev) => prev.map((id) => (id === previousFieldId ? next : id)));
    setEditingId((prev) => (prev === previousFieldId ? next : prev));
    setDragState((prev) =>
      prev
        ? {
            ...prev,
            fieldIds: prev.fieldIds.map((id) => (id === previousFieldId ? next : id)),
            origins: Object.fromEntries(
              Object.entries(prev.origins).map(([id, pos]) => [
                id === previousFieldId ? next : id,
                pos,
              ])
            ),
          }
        : prev
    );
    setResizeState((prev) =>
      prev && prev.fieldId === previousFieldId ? { ...prev, fieldId: next } : prev
    );
  };

  useEffect(() => {
    setFieldIdError("");
  }, [selectedIds]);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      const isTyping =
        tag === "input" || tag === "textarea" || e.target?.isContentEditable;
      if (isTyping) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        if (selectedIds.length === 0) return;
        e.preventDefault();
        duplicateSelected();
      }
      if (e.key === "Escape") {
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duplicateSelected, selectedIds.length]);

  const handleJsonChange = (value) => {
    setRawJson(value);
    if (!value.trim()) {
      setNodes([]);
      setSelectedIds([]);
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

      const usedFieldIds = new Set();
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

          const parseEnabled = (v, defaultVal) => {
            if (typeof v === "boolean") return v;
            if (typeof v === "number") return v !== 0;
            if (typeof v === "string") {
              const s = v.trim().toLowerCase();
              if (["true", "1", "yes", "y", "enabled"].includes(s)) return true;
              if (["false", "0", "no", "n", "disabled"].includes(s)) return false;
            }
            return defaultVal;
          };

          const enabled =
            typeof item.enabled !== "undefined"
              ? parseEnabled(item.enabled, true)
              : typeof item.disabled !== "undefined"
                ? !parseEnabled(item.disabled, false)
                : true;

          const incomingFieldId =
            typeof item.fieldId === "string"
              ? item.fieldId
              : typeof item.field === "string"
                ? item.field
                : typeof item.name === "string"
                  ? item.name
                  : "";
          const fieldId = dedupeFieldId(incomingFieldId, type, usedFieldIds);

          return { fieldId, type, x, y, width, height, content, enabled };
        })
        .filter(Boolean);

      setNodes(cleaned);
      setSelectedIds([]);
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
      onMouseDown={() => setContextMenu(null)}
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
                opacity: 1,
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
              disabled={selectedIds.length === 0 || !isLayoutEditable}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                background: selectedIds.length > 0 && isLayoutEditable ? "#fee2e2" : "#f9fafb",
                color: selectedIds.length > 0 && isLayoutEditable ? "#b91c1c" : "#9ca3af",
                fontSize: 12,
                cursor: selectedIds.length > 0 && isLayoutEditable ? "pointer" : "default",
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
              const isSelected = selectedIds.includes(node.fieldId);
              const isEditing = node.fieldId === editingId;
              const disabledByAttribute = node.enabled === false;
              const showResizeHandles = isSelected && isLayoutEditable;
              const canEditThisContent = isContentEditable(node);

              const commonStyle = {
                position: "absolute",
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderRadius: 8,
                border: disabledByAttribute
                  ? isSelected
                    ? "2px dashed #2563eb"
                    : "1px dashed #d1d5db"
                  : isSelected
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                background: "#ffffff",
                boxShadow: isSelected
                  ? "0 0 0 2px rgba(37,99,235,0.15), 0 4px 10px rgba(15,23,42,0.08)"
                  : "0 2px 6px rgba(15,23,42,0.06)",
                boxSizing: "border-box",
                padding: 8,
                cursor: isLayoutEditable
                  ? dragState && dragState.fieldIds.includes(node.fieldId)
                    ? "grabbing"
                    : "grab"
                  : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none",
                backgroundClip: "padding-box",
                opacity: disabledByAttribute ? 0.45 : 1,
              };

              let contentEl = null;
              if (node.type === "text") {
                if (isEditing && canEditThisContent) {
                  contentEl = (
                    <textarea
                      autoFocus
                      value={node.content}
                      onChange={(e) => handleContentChange(node.fieldId, e.target.value)}
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
                      filter: disabledByAttribute ? "blur(1px)" : "none",
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
                    {isEditing && canEditThisContent ? (
                      <input
                        autoFocus
                        value={node.content}
                        onChange={(e) => handleContentChange(node.fieldId, e.target.value)}
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
                    {isEditing && canEditThisContent ? (
                      <input
                        autoFocus
                        value={node.content}
                        onChange={(e) => handleContentChange(node.fieldId, e.target.value)}
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
                  key={node.fieldId}
                  style={commonStyle}
                  onMouseDown={(e) => handleNodeMouseDown(e, node.fieldId)}
                  onDoubleClick={() => handleDoubleClick(node.fieldId)}
                  onContextMenu={(e) => handleNodeContextMenu(e, node.fieldId)}
                >
                  {contentEl}

                  {/* Resize handles */}
                  {showResizeHandles && (
                    <>
                      {/* corners */}
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "top-left")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "top-right")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "bottom-left")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "bottom-right")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "top")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "bottom")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "left")}
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
                        onMouseDown={(e) => handleResizeMouseDown(e, node.fieldId, "right")}
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
            {selectionBox ? (
              <div
                style={{
                  position: "absolute",
                  left: Math.min(selectionBox.startX, selectionBox.currentX),
                  top: Math.min(selectionBox.startY, selectionBox.currentY),
                  width: Math.abs(selectionBox.currentX - selectionBox.startX),
                  height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  border: "1px dashed #2563eb",
                  background: "rgba(37,99,235,0.12)",
                  pointerEvents: "none",
                }}
              />
            ) : null}
            {contextMenu ? (
              <div
                style={{
                  position: "fixed",
                  left: contextMenu.x,
                  top: contextMenu.y,
                  zIndex: 50,
                  background: "#ffffff",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  boxShadow: "0 6px 24px rgba(15,23,42,0.16)",
                  minWidth: 140,
                  padding: 4,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={duplicateSelected}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    padding: "8px 10px",
                    fontSize: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  Duplicate
                </button>
              </div>
            ) : null}
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
                    <label>Enabled</label>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={selectedNode.enabled !== false}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.fieldId === selectedNode.fieldId ? { ...n, enabled } : n
                            )
                          );
                        }}
                        style={{ transform: "scale(1.05)", margin: 0 }}
                      />
                    </div>
                    <label>Field Id</label>
                    <input
                      type="text"
                      value={selectedNode.fieldId || ""}
                      onChange={(e) => handleFieldIdChange(e.target.value)}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: fieldIdError ? "1px solid #dc2626" : "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                    <label>X</label>
                    <input
                      type="number"
                      value={Math.round(selectedNode.x)}
                      onChange={(e) => handlePositionInputChange("x", e.target.value)}
                      disabled={!isLayoutEditable}
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
                      disabled={!isLayoutEditable}
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
                      disabled={!isLayoutEditable}
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
                      disabled={!isLayoutEditable}
                      style={{
                        padding: "4px 6px",
                        borderRadius: 6,
                        border: "1px solid #d1d5db",
                        fontSize: 12,
                      }}
                    />
                  </div>
                  {fieldIdError ? (
                    <div style={{ marginTop: 6, fontSize: 11, color: "#b91c1c" }}>
                      {fieldIdError}
                    </div>
                  ) : null}
                  {selectedNode.type === "image" && (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 12, marginBottom: 4 }}>Image URL</div>
                      <input
                        type="text"
                        value={selectedNode.content}
                        onChange={(e) =>
                          handleContentChange(selectedNode.fieldId, e.target.value)
                        }
                        disabled={!isContentEditable(selectedNode)}
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
              ) : selectedIds.length > 1 ? (
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {selectedIds.length} components selected.
                </div>
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
                readOnly={false}
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

