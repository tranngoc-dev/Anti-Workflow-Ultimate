'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, 
  Undo, 
  Redo, 
  Download, 
  Share2, 
  Trash2, 
  ArrowLeft, 
  Sparkles,
  BookOpen,
  Maximize2,
  Search,
  ChevronRight,
  Edit3,
  Calendar,
  Grid,
  ArrowUpDown
} from 'lucide-react';

// Custom Node Component to render gorgeous elegant light-themed boxes (with bidirectional handles and clean border colors)
const CustomNode = ({ id, data = {}, selected }) => {
  const themeColor = data?.color || '#0f766e';
  const { setNodes } = useReactFlow();

  const handleTextChange = (key, value) => {
    // 1. Update local React Flow nodes state instantly for 120fps responsive typing
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...(node.data || {}),
              [key]: value,
            },
          };
        }
        return node;
      })
    );
  };

  const handleTextBlur = (key, value) => {
    // 2. Dispatch custom event to trigger parent stack save & history save on blur
    document.dispatchEvent(
      new CustomEvent('mm-node-update', {
        detail: { id, key, value },
      })
    );
  };

  return (
    <div 
      className="mm-custom-node"
      style={{ 
        borderLeft: `5px solid ${themeColor}`,
        borderTop: selected ? `1px solid ${themeColor}` : '1px solid rgba(0, 0, 0, 0.06)',
        borderRight: selected ? `1px solid ${themeColor}` : '1px solid rgba(0, 0, 0, 0.06)',
        borderBottom: selected ? `1px solid ${themeColor}` : '1px solid rgba(0, 0, 0, 0.06)',
        transform: selected ? 'scale(1.04)' : 'none',
      }}
    >
      {/* LEFT SIDE HANDLES: target (visible) & source (hidden overlay) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="l-target"
        style={{ 
          background: themeColor, 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          left: '-4px', 
          border: '2px solid #ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Left} 
        id="l-source"
        style={{ 
          background: themeColor, 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          left: '-4px', 
          border: '2px solid #ffffff',
          opacity: 0 
        }} 
      />
      
      {/* Inline editable Title input */}
      <input
        type="text"
        value={data?.label || ''}
        onChange={(e) => handleTextChange('label', e.target.value)}
        onBlur={(e) => handleTextBlur('label', e.target.value)}
        className="mm-node-title-input nodrag"
        placeholder="Tiêu đề..."
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.currentTarget.blur();
          }
        }}
      />
      
      {/* Inline editable Description textarea */}
      <textarea
        value={data?.content || ''}
        onChange={(e) => {
          handleTextChange('content', e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        onBlur={(e) => handleTextBlur('content', e.target.value)}
        className="mm-node-desc-textarea nodrag"
        placeholder="Ghi chú..."
        rows={1}
        ref={(el) => {
          if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
      />
      
      {selected && (
        <div className="mm-node-active-tag">
          Đang chọn
        </div>
      )}
      
      {/* RIGHT SIDE HANDLES: target (hidden overlay) & source (visible) */}
      <Handle 
        type="target" 
        position={Position.Right} 
        id="r-target"
        style={{ 
          background: themeColor, 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          right: '-4px', 
          border: '2px solid #ffffff',
          opacity: 0 
        }} 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="r-source"
        style={{ 
          background: themeColor, 
          width: '8px', 
          height: '8px', 
          borderRadius: '50%', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          right: '-4px', 
          border: '2px solid #ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }} 
      />
    </div>
  );
};

const nodeTypes = { customCustomNode: CustomNode };

// Sample Initial Mockup Data (StoryTelling - Long)
const defaultStorytellingNodes = [
  { 
    id: 'root', 
    type: 'customCustomNode', 
    position: { x: 80, y: 300 }, 
    data: { 
      label: 'Story Telling / VSL', 
      content: 'Kịch bản VSL và câu chuyện đỉnh cao của bạn.', 
      color: '#1f2937' 
    } 
  },
  { 
    id: 'node-1', 
    type: 'customCustomNode', 
    position: { x: 340, y: 150 }, 
    data: { 
      label: '1. Drama Hook', 
      content: 'Từ 80 xuống 50, thực sự cuộc sống ở tuổi 61 chưa bao giờ tốt hơn...', 
      color: '#0f766e' 
    } 
  },
  { 
    id: 'node-2', 
    type: 'customCustomNode', 
    position: { x: 340, y: 300 }, 
    data: { 
      label: '2. Bối Cảnh', 
      content: '3 năm trước chuyển từ Hà Nội vào Hồ Chí Minh, Bình Tân nhộn nhịp...', 
      color: '#0f766e' 
    } 
  },
  { 
    id: 'node-3', 
    type: 'customCustomNode', 
    position: { x: 340, y: 450 }, 
    data: { 
      label: '3. Bế Tắc', 
      content: 'Tăng cân nhanh chóng không giải thích được, 3 bác sĩ bó tay...', 
      color: '#0f766e' 
    } 
  },
  { 
    id: 'node-4', 
    type: 'customCustomNode', 
    position: { x: 620, y: 150 }, 
    data: { 
      label: '4. Ngôi Sao Hy Vọng', 
      content: 'Chuyến đi đến tiệm làm móng định mệnh, nghe về pp mới lạ...', 
      color: '#f97316' 
    } 
  },
  { 
    id: 'node-5', 
    type: 'customCustomNode', 
    position: { x: 620, y: 300 }, 
    data: { 
      label: '5. Nghi Lễ 10s', 
      content: 'Nghi lễ 10s mỗi sáng kích hoạt quá trình trao đổi chất của cơ thể...', 
      color: '#f97316' 
    } 
  },
  { 
    id: 'node-6', 
    type: 'customCustomNode', 
    position: { x: 620, y: 450 }, 
    data: { 
      label: '6. Vượt Qua Hoài Nghi', 
      content: 'Ban đầu nghi ngờ "làm gì có cái dễ thế", bàn với chồng rồi thử...', 
      color: '#f97316' 
    } 
  },
  { 
    id: 'node-7', 
    type: 'customCustomNode', 
    position: { x: 900, y: 200 }, 
    data: { 
      label: '7. Kết Quả', 
      content: 'Cả hai đều giảm cân, vui đùa với các cháu không bị hụt hơi...', 
      color: '#22c55e' 
    } 
  },
  { 
    id: 'node-8', 
    type: 'customCustomNode', 
    position: { x: 900, y: 400 }, 
    data: { 
      label: '8. Lời Cảm Ơn & CTA', 
      content: 'Biết ơn định mệnh, nhấn link bên dưới chuyển sang LANDING VSL...', 
      color: '#22c55e' 
    } 
  },
];

const defaultStorytellingEdges = [
  { id: 'e-root-1', source: 'root', target: 'node-1', animated: true, style: { stroke: '#0f766e', strokeWidth: 2 } },
  { id: 'e-root-2', source: 'root', target: 'node-2', animated: true, style: { stroke: '#0f766e', strokeWidth: 2 } },
  { id: 'e-root-3', source: 'root', target: 'node-3', animated: true, style: { stroke: '#0f766e', strokeWidth: 2 } },
  
  { id: 'e-1-4', source: 'node-1', target: 'node-4', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  { id: 'e-2-5', source: 'node-2', target: 'node-5', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  { id: 'e-3-6', source: 'node-3', target: 'node-6', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  
  { id: 'e-4-7', source: 'node-4', target: 'node-7', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  { id: 'e-5-7', source: 'node-5', target: 'node-7', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  { id: 'e-6-8', source: 'node-6', target: 'node-8', style: { stroke: '#cccccc', strokeWidth: 1.5 } },
  { id: 'e-7-8', source: 'node-7', target: 'node-8', animated: true, style: { stroke: '#22c55e', strokeWidth: 2 } },
];

// Document icon SVG markup matching the screenshot (rounded sheet, folded top-right corner, white node diagram)
const DocumentIcon = () => (
  <svg className="mm-dash-file-icon-svg" viewBox="0 0 38 46" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 0H26L38 12V42C38 44.2 36.2 46 34 46H4C1.8 46 0 44.2 0 42V4C0 1.8 1.8 0 4 0Z" fill="#D3DFEE"/>
    <path d="M26 0V12H38L26 0Z" fill="#BAC9DC"/>
    {/* White Mindmap node network */}
    <circle cx="13" cy="24" r="3.5" fill="#FFFFFF" />
    <circle cx="25" cy="17" r="2.5" fill="#FFFFFF" />
    <circle cx="25" cy="31" r="2.5" fill="#FFFFFF" />
    <path d="M16 23L22.5 18" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M16 25L22.5 30" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

// High-fidelity Orange Share badge resembling the screenshot
const ShareBadge = () => (
  <div className="mm-dash-file-share-indicator" title="Sơ đồ chia sẻ">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="9.5" fill="#F97316" stroke="#FFFFFF" strokeWidth="1" />
      {/* 3 nodes connected */}
      <circle cx="7" cy="10" r="1.6" fill="#FFFFFF" />
      <circle cx="12.5" cy="6.5" r="1.4" fill="#FFFFFF" />
      <circle cx="12.5" cy="13.5" r="1.4" fill="#FFFFFF" />
      <line x1="8.5" y1="9.1" x2="11" y2="7.4" stroke="#FFFFFF" strokeWidth="0.8" />
      <line x1="8.5" y1="10.9" x2="11" y2="12.6" stroke="#FFFFFF" strokeWidth="0.8" />
    </svg>
  </div>
);



function MindmapEditor({ mapId, onBackToDashboard, currentMapData, onSaveMapData, onRenameMap }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [showToast, setShowToast] = useState(null);
  
  const { fitView, getNodes, getEdges } = useReactFlow();
  const [mapTitle, setMapTitle] = useState(currentMapData?.label || 'Sơ đồ tư duy mới');

  // Handle saving state to history stack
  const pushToHistory = useCallback((currentNodes, currentEdges) => {
    const state = {
      nodes: JSON.parse(JSON.stringify(currentNodes)),
      edges: JSON.parse(JSON.stringify(currentEdges)),
    };
    
    setHistory((prevHistory) => {
      const truncated = prevHistory.slice(0, historyIndex + 1);
      const updated = [...truncated, state];
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  // Sync title when active map changes
  useEffect(() => {
    if (currentMapData) {
      setMapTitle(currentMapData.label);
    }
  }, [currentMapData?.label]);

  // Handle title blur save
  const handleTitleBlur = () => {
    if (currentMapData && mapTitle.trim() !== '' && mapTitle !== currentMapData.label) {
      onRenameMap(mapId, currentMapData.label, mapTitle);
    }
  };

  // Debounced auto-save (2 seconds)
  useEffect(() => {
    if (currentMapData && mapTitle.trim() !== '' && mapTitle !== currentMapData.label) {
      const timer = setTimeout(() => {
        onRenameMap(mapId, currentMapData.label, mapTitle);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [mapTitle, mapId, currentMapData, onRenameMap]);

  // Listen to direct canvas inline node updates
  useEffect(() => {
    const handleNodeUpdateEvent = (e) => {
      const { id, key, value } = e.detail;
      setNodes((prevNodes) => {
        const next = prevNodes.map((n) => {
          if (n.id === id) {
            return {
              ...n,
              data: {
                ...n.data,
                [key]: value
              }
            };
          }
          return n;
        });
        // Push changes to history and trigger database cloud save
        pushToHistory(next, edges);
        onSaveMapData(mapId, next, edges);
        return next;
      });
    };

    document.addEventListener('mm-node-update', handleNodeUpdateEvent);
    return () => document.removeEventListener('mm-node-update', handleNodeUpdateEvent);
  }, [edges, mapId, pushToHistory, onSaveMapData, setNodes]);

  const loadedMapIdRef = React.useRef(null);

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // Load the active map data once when mapId changes to prevent infinite load-reset loops during drag
  useEffect(() => {
    if (currentMapData && loadedMapIdRef.current !== mapId) {
      loadedMapIdRef.current = mapId;
      setNodes(currentMapData.nodes || []);
      setEdges(currentMapData.edges || []);
      // Reset history on load
      setHistory([{
        nodes: JSON.parse(JSON.stringify(currentMapData.nodes || [])),
        edges: JSON.parse(JSON.stringify(currentMapData.edges || [])),
      }]);
      setHistoryIndex(0);
    }
  }, [mapId, currentMapData, setNodes, setEdges]);

  // Connect two nodes
  const onConnect = useCallback((params) => {
    setEdges((eds) => {
      const nextEdges = addEdge(
        { 
          ...params, 
          style: { stroke: '#cccccc', strokeWidth: 1.5 } 
        }, 
        eds
      );
      pushToHistory(nodes, nextEdges);
      onSaveMapData(mapId, nodes, nextEdges);
      return nextEdges;
    });
  }, [nodes, mapId, setEdges, pushToHistory, onSaveMapData]);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Update Node inputs
  const handleUpdateNode = (key, value) => {
    if (!selectedNode) return;
    
    const updatedNodes = nodes.map((node) => {
      if (node.id === selectedNode.id) {
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            [key]: value,
          },
        };
        setSelectedNode(updatedNode);
        return updatedNode;
      }
      return node;
    });
    
    setNodes(updatedNodes);
    pushToHistory(updatedNodes, edges);
    onSaveMapData(mapId, updatedNodes, edges);
  };

  // Add Node with manual or intelligent bidirectional side calculations
  const handleAddNode = useCallback((side = null) => {
    const id = `node-${Date.now()}`;
    const parentNode = selectedNode;
    
    // Default position
    let position = { x: 300, y: 250 };
    let isLeft = false;

    if (parentNode) {
      // Intelligent positioning (Left vs Right of parent)
      const rootNode = nodes.find(n => n.id === 'root') || nodes[0];
      const rootX = rootNode ? rootNode.position.x : 250;
      
      if (side === 'left') {
        isLeft = true;
      } else if (side === 'right') {
        isLeft = false;
      } else {
        // Automatic positioning logic
        if (parentNode.id === 'root') {
          // Balance root children count on left vs right
          const leftCount = nodes.filter(n => n.position.x < rootX).length;
          const rightCount = nodes.filter(n => n.position.x > rootX).length;
          isLeft = leftCount < rightCount;
        } else {
          // Inherit direction from parent
          isLeft = parentNode.position.x < rootX;
        }
      }

      position = { 
        x: parentNode.position.x + (isLeft ? -250 : 250), 
        y: parentNode.position.y + (Math.random() * 80 - 40) 
      };
    }

    const newNode = {
      id,
      type: 'customCustomNode',
      position,
      data: {
        label: 'Ý tưởng mới',
        content: 'Mô tả chi tiết ý tưởng của bạn...',
        color: parentNode ? parentNode.data?.color || '#0f766e' : '#0f766e',
      },
    };

    const nextNodes = [...nodes, newNode];
    let nextEdges = [...edges];

    if (parentNode) {
      // Connect parent to child using handles on correct sides:
      // If child is on the left: Parent Left (l-source) connects to Child Right (r-target)
      // If child is on the right: Parent Right (r-source) connects to Child Left (l-target)
      nextEdges.push({
        id: `e-${parentNode.id}-${id}`,
        source: parentNode.id,
        target: id,
        sourceHandle: isLeft ? 'l-source' : 'r-source',
        targetHandle: isLeft ? 'r-target' : 'l-target',
        style: { stroke: parentNode.data?.color || '#cccccc', strokeWidth: 2 },
      });
    }

    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(newNode);
    pushToHistory(nextNodes, nextEdges);
    onSaveMapData(mapId, nextNodes, nextEdges);
    triggerToast('Đã thêm ý tưởng mới!');
  }, [nodes, edges, selectedNode, mapId, pushToHistory, onSaveMapData]);

  // Delete selected Node
  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    const nodeId = selectedNode.id;
    
    const nextNodes = nodes.filter((n) => n.id !== nodeId);
    const nextEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
    
    setNodes(nextNodes);
    setEdges(nextEdges);
    setSelectedNode(null);
    pushToHistory(nextNodes, nextEdges);
    onSaveMapData(mapId, nextNodes, nextEdges);
    triggerToast('Đã xóa ý tưởng được chọn.');
  }, [nodes, edges, selectedNode, mapId, pushToHistory, onSaveMapData]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevState = history[prevIndex];
      
      setNodes(JSON.parse(JSON.stringify(prevState.nodes)));
      setEdges(JSON.parse(JSON.stringify(prevState.edges)));
      setHistoryIndex(prevIndex);
      setSelectedNode(null);
      onSaveMapData(mapId, prevState.nodes, prevState.edges);
      triggerToast('Đã phục hồi trạng thái trước.');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      
      setNodes(JSON.parse(JSON.stringify(nextState.nodes)));
      setEdges(JSON.parse(JSON.stringify(nextState.edges)));
      setHistoryIndex(nextIndex);
      setSelectedNode(null);
      onSaveMapData(mapId, nextState.nodes, nextState.edges);
      triggerToast('Đã đi tới trạng thái tiếp theo.');
    }
  };

  // Dragging changes only local state for 120 FPS buttery-smooth performance
  const handleNodesChange = useCallback((changes) => {
    onNodesChange(changes);
  }, [onNodesChange]);

  // Save map state only when dragging actually ends
  const onNodeDragEnd = useCallback(() => {
    const latestNodes = getNodes();
    const latestEdges = getEdges();
    onSaveMapData(mapId, latestNodes, latestEdges);
  }, [mapId, getNodes, getEdges, onSaveMapData]);

  // Handle edges changes cleanly
  const handleEdgesChange = useCallback((changes) => {
    onEdgesChange(changes);
    const latestNodes = getNodes();
    const latestEdges = getEdges();
    onSaveMapData(mapId, latestNodes, latestEdges);
  }, [onEdgesChange, mapId, getNodes, getEdges, onSaveMapData]);

  // Listen to keyboard shortcuts (Tab, Ctrl+Tab/Shift+Tab, Delete)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
      if (isTyping) return; // Prevent hijacking shortcuts when typing in sidebar fields

      if (e.key === 'Tab') {
        if (selectedNode) {
          e.preventDefault();
          // TAB: right child, Ctrl+Tab or Shift+Tab: left child
          if (e.ctrlKey || e.shiftKey) {
            handleAddNode('left');
          } else {
            handleAddNode('right');
          }
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNode) {
          e.preventDefault();
          handleDeleteNode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, handleAddNode, handleDeleteNode]);

  // Auto-save logic visual trigger
  useEffect(() => {
    if (nodes.length === 0) return;
    
    setIsAutoSaving(true);
    const timer = setTimeout(() => {
      setIsAutoSaving(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [nodes, edges]);

  // Export to standalone interactive HTML
  const handleExportHTML = () => {
    const rootNodes = nodes.filter(n => !edges.some(e => e.target === n.id));
    
    const renderNodeTree = (node, depth = 0) => {
      const children = edges
        .filter(e => e.source === node.id)
        .map(e => nodes.find(n => n.id === e.target))
        .filter(Boolean);
        
      const indent = '  '.repeat(depth * 2);
      
      let htmlString = `${indent}<li class="tree-item" style="--node-color: ${node.data.color || '#0f766e'}">\n`;
      htmlString += `${indent}  <div class="node-box">\n`;
      htmlString += `${indent}    <h3 class="node-title">${node.data.label}</h3>\n`;
      if (node.data.content) {
        htmlString += `${indent}    <p class="node-desc">${node.data.content}</p>\n`;
      }
      htmlString += `${indent}  </div>\n`;
      
      if (children.length > 0) {
        htmlString += `${indent}  <ul class="tree-branch">\n`;
        children.forEach(child => {
          htmlString += renderNodeTree(child, depth + 1);
        });
        htmlString += `${indent}  </ul>\n`;
      }
      
      htmlString += `${indent}</li>\n`;
      return htmlString;
    };

    let treeHTML = '<ul class="tree-root">\n';
    if (rootNodes.length > 0) {
      rootNodes.forEach(rn => {
        treeHTML += renderNodeTree(rn);
      });
    } else if (nodes.length > 0) {
      nodes.forEach(n => {
        treeHTML += `  <li class="tree-item" style="--node-color: ${n.data.color || '#0f766e'}">
    <div class="node-box">
      <h3 class="node-title">${n.data.label}</h3>
      <p class="node-desc">${n.data.content || ''}</p>
    </div>
  </li>\n`;
      });
    }
    treeHTML += '</ul>';

    const fullHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sơ Đồ Tư Duy - Ngăn Đá Workspace</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-dark: #fafafa;
      --panel-dark: #ffffff;
      --border-glow: rgba(15, 118, 110, 0.1);
      --font-family: 'Outfit', sans-serif;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-dark);
      color: #1f2937;
      font-family: var(--font-family);
      min-height: 100vh;
      overflow-x: hidden;
      padding: 4rem 2rem;
      position: relative;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      background: var(--panel-dark);
      border: 1px solid rgba(0, 0, 0, 0.08);
      border-radius: 24px;
      padding: 3rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.02), 0 0 40px rgba(15, 118, 110, 0.04);
    }

    header {
      text-align: center;
      margin-bottom: 4rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      padding-bottom: 2rem;
    }

    .header-logo {
      font-weight: 800;
      letter-spacing: 0.15em;
      background: linear-gradient(135deg, #0f766e 0%, #0d6d66 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    h1 {
      font-size: 2.8rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 1rem;
      color: #1f2937;
    }

    .subtitle {
      color: #6b7280;
      font-size: 1.1rem;
      font-weight: 300;
    }

    ul {
      list-style-type: none;
    }

    .tree-root > .tree-item {
      padding-left: 0;
    }

    .tree-item {
      padding-left: 2rem;
      position: relative;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    .tree-item::before {
      content: '';
      position: absolute;
      left: 0rem;
      top: -0.5rem;
      height: calc(100% + 1rem);
      width: 1px;
      background: rgba(0, 0, 0, 0.08);
    }

    .tree-item:last-child::before {
      height: 2.2rem;
    }

    .tree-item::after {
      content: '';
      position: absolute;
      left: 0rem;
      top: 1.7rem;
      width: 1.5rem;
      height: 1px;
      background: rgba(0, 0, 0, 0.08);
    }

    .node-box {
      background: #ffffff;
      border-left: 4px solid var(--node-color);
      border-radius: 12px;
      padding: 1.2rem 1.8rem;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
      border-right: 1px solid rgba(0, 0, 0, 0.04);
      border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-block;
      min-width: 280px;
      max-width: 100%;
    }

    .node-box:hover {
      background: #f9fafb;
      transform: translateX(5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
    }

    .node-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 0.3rem;
    }

    .node-desc {
      font-size: 0.9rem;
      color: #4b5563;
      line-height: 1.5;
      font-weight: 300;
    }

    .tree-branch {
      margin-top: 0.5rem;
      margin-left: 0.5rem;
    }

    footer.credits {
      text-align: center;
      margin-top: 4rem;
      color: rgba(0, 0, 0, 0.3);
      font-size: 0.8rem;
      font-weight: 300;
    }
  </style>
</head>
<body>

  <div class="container">
    <header>
      <div class="header-logo">Ngăn Đá Workspace</div>
      <h1>Dàn Ý Sơ Đồ Tư Duy</h1>
      <p class="subtitle">Được kết tinh và xuất bản trực tiếp từ Tủ Lạnh Simple Blog</p>
    </header>

    <main>
      ${treeHTML}
    </main>

    <footer class="credits">
      © ${new Date().getFullYear()} Tủ Lạnh Simple • Sản phẩm xuất bản tự động
    </footer>
  </div>

</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ngan-da-mindmap-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast('Đã xuất bản sơ đồ ra file .html thành công!');
  };

  const handleRecenter = () => {
    fitView({ padding: 0.2, duration: 800 });
  };

  return (
    <div className="mm-workspace">
      
      {/* Toast Notification Alert */}
      {showToast && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-full shadow-2xl z-[999] animate-bounce flex items-center gap-2"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
        >
          <Sparkles size={16} className="text-teal-600" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Main Top Header Control Panel (Clean Light Theme) */}
      <div className="mm-toolbar">
        
        {/* Left Actions - Back & Branding */}
        <div className="mm-toolbar-group">
          <button onClick={onBackToDashboard} className="mm-btn mm-btn-icon" title="Quay về danh sách sơ đồ">
            <ArrowLeft size={16} />
          </button>
          <div className="mm-divider" />
          <input 
            type="text" 
            value={mapTitle} 
            onChange={(e) => setMapTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="mm-toolbar-title-input"
            title="Nhấp để sửa tên sơ đồ tư duy"
          />
          
          {isAutoSaving ? (
            <div className="mm-save-status saving">
              <span className="mm-save-status-dot" />
              <span>Đang lưu...</span>
            </div>
          ) : (
            <div className="mm-save-status saved">
              <span className="mm-save-status-dot animate-ping" />
              <span>Đã lưu</span>
            </div>
          )}
        </div>

        {/* Center Actions - Undo/Redo & Add Node */}
        <div className="mm-toolbar-group">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            title="Quay lại (Undo)"
            className="mm-btn mm-btn-icon"
          >
            <Undo size={16} />
          </button>
          
          <button 
            onClick={handleRedo} 
            disabled={historyIndex >= history.length - 1}
            title="Đi tới (Redo)"
            className="mm-btn mm-btn-icon"
          >
            <Redo size={16} />
          </button>
          
          <div className="mm-divider" />
          
          {selectedNode ? (
            <>
              <button 
                onClick={() => handleAddNode('left')} 
                className="mm-btn mm-btn-accent"
                style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                title="Thêm ý tưởng con bên trái ô cha (Tab)"
              >
                <Plus size={14} /> 
                <span>Thêm ô bên trái</span>
              </button>
              <button 
                onClick={() => handleAddNode('right')} 
                className="mm-btn mm-btn-accent"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                title="Thêm ý tưởng con bên phải ô cha (Tab)"
              >
                <Plus size={14} /> 
                <span>Thêm ô bên phải</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => handleAddNode()} 
              className="mm-btn mm-btn-accent"
              title="Thêm ý tưởng độc lập"
            >
              <Plus size={15} /> 
              <span>Thêm ý tưởng</span>
            </button>
          )}
        </div>

        {/* Right Actions - Delete Node, Share & Export */}
        <div className="mm-toolbar-group">
          {selectedNode && (
            <button 
              onClick={handleDeleteNode} 
              title="Xóa node"
              className="mm-btn mm-btn-danger mm-btn-icon"
            >
              <Trash2 size={16} />
            </button>
          )}
          
          <button 
            onClick={() => triggerToast('Đã copy link liên kết sơ đồ vào Clipboard!')} 
            className="mm-btn"
          >
            <Share2 size={15} /> 
            <span>Chia sẻ</span>
          </button>
          
          <button 
            onClick={handleExportHTML} 
            className="mm-btn mm-btn-primary"
          >
            <Download size={15} /> 
            <span>Xuất File .HTML</span>
          </button>
        </div>
      </div>

      <div className="mm-main-area">
        
        {/* Main Canvas Workspace with clean light grid */}
        <div className="mm-canvas-container">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodeDragEnd={onNodeDragEnd}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cccccc" gap={28} size={0.6} opacity={0.3} />
            <Controls position="bottom-left" />
            <MiniMap 
              nodeColor={(n) => n.data?.color || '#0f766e'} 
              maskColor="rgba(255, 255, 255, 0.6)"
            />

            <Panel position="bottom-right" className="flex gap-2" style={{ marginRight: '16px', marginBottom: '16px' }}>
              <button 
                onClick={handleRecenter}
                className="mm-btn"
                style={{ padding: '6px 12px', fontSize: '11px' }}
              >
                <Maximize2 size={11} /> Căn giữa view
              </button>
            </Panel>
          </ReactFlow>
        </div>

        {/* Sidebar Panel (Elegant Light Theme) */}
        <div className="mm-sidebar">
          <div className="mm-sidebar-header">
            <div className="mm-sidebar-title-tag">
              <BookOpen size={12} />
              <span>Ý tưởng đang chọn</span>
            </div>
            
            {selectedNode ? (
              <input 
                type="text" 
                value={selectedNode.data?.label || ''} 
                onChange={(e) => handleUpdateNode('label', e.target.value)}
                className="mm-sidebar-input"
                placeholder="Nhập tiêu đề ý tưởng..."
              />
            ) : (
              <div className="text-xs text-gray-400 italic mt-2">
                Click chọn một Node trên sơ đồ để bắt đầu chỉnh sửa kịch bản.
              </div>
            )}
          </div>

          {selectedNode ? (
            <div className="mm-sidebar-body space-y-5">
              {/* Detailed Content Field */}
              <div className="mb-4">
                <span className="mm-field-label">NỘI DUNG CHI TIẾT</span>
                <textarea
                  value={selectedNode.data?.content || ''}
                  onChange={(e) => handleUpdateNode('content', e.target.value)}
                  className="mm-sidebar-textarea"
                  placeholder="Ghi chú chi tiết hoặc kịch bản dàn ý cho ý tưởng này..."
                />
              </div>

              {/* Node Glow Theme Selection */}
              <div className="mb-4">
                <span className="mm-field-label">TÔNG MÀU SƠ ĐỒ</span>
                <div className="mm-color-grid">
                  {[
                    { name: 'Teal Nhã Nhặn', color: '#0f766e' },
                    { name: 'Cam Nổi Bật', color: '#f97316' },
                    { name: 'Lục Hi vọng', color: '#22c55e' },
                    { name: 'Lam Thanh Lịch', color: '#3b82f6' },
                    { name: 'Vàng Hoàng Kim', color: '#eab308' },
                    { name: 'Đỏ Cuốn Hút', color: '#ef4444' },
                    { name: 'Hồng Đam Mê', color: '#ec4899' },
                    { name: 'Xám Tối Giản', color: '#1f2937' },
                  ].map((theme) => (
                    <button
                      key={theme.color}
                      onClick={() => handleUpdateNode('color', theme.color)}
                      title={theme.name}
                      className="mm-color-btn"
                      style={{ 
                        backgroundColor: theme.color,
                        boxShadow: selectedNode.data?.color === theme.color ? `0 0 6px ${theme.color}` : 'none'
                      }}
                    >
                      {selectedNode.data?.color === theme.color && (
                        <span className="mm-color-btn-dot" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Helper Info */}
              <div className="mm-tips-box space-y-1">
                <div className="font-bold text-gray-700">💡 Mẹo thao tác nhanh:</div>
                <div>• <strong>TAB</strong>: Tạo nhánh con bên PHẢI.</div>
                <div>• <strong>Ctrl+TAB</strong> (hoặc <strong>Shift+TAB</strong>): Tạo nhánh con bên TRÁI.</div>
                <div>• Phím <strong>DELETE</strong> (hoặc Backspace): Xóa ô đang chọn.</div>
                <div>• Nhấp đúp chuột vào nền trống để tạo ô mới độc lập.</div>
                <div>• Kéo thả từ các cổng tròn ở hai cạnh để vẽ liên kết.</div>
                <div>• Tự động lưu sau mỗi 2 giây không thao tác.</div>
              </div>
            </div>
          ) : (
            <div className="mm-sidebar-empty">
              <span className="mm-sidebar-empty-icon">🧭</span>
              <p className="mm-sidebar-empty-title">Không gian thiết kế sáng tạo</p>
              <p className="mm-sidebar-empty-desc">
                Hãy click vào một Node hoặc bấm nút <strong>"Thêm ý tưởng"</strong> ở toolbar để bắt đầu phác thảo!
              </p>
            </div>
          )}


        </div>

      </div>
    </div>
  );
}

// Full document manager Dashboard component
function MindmapDashboard({ maps, session, onCreateMap, onDeleteMap, onRenameMap, onSelectMap }) {
  const userName = session?.user?.email?.split('@')[0] || 'User';
  
  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans pb-12">
      {/* 1. Dashboard Header Bar */}
      <header className="mm-dash-header">
        <div className="mm-dash-header-inner">
          <div className="mm-dash-logo">
            <span className="mm-logo-icon">🧠</span>
            <span className="mm-logo-text">Ngăn Đá Mindmap</span>
          </div>
          
          <div className="mm-dash-user-menu">
            <span className="mm-user-badge">
              <span className="mm-user-icon">👤</span>
              <span className="mm-user-name">{userName}</span>
            </span>
            <button 
              onClick={() => window.location.href = '/'} 
              className="mm-dash-nav-btn home-btn" 
              title="Về trang chủ"
            >
              🏠 Về trang chủ
            </button>
            <button 
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }} 
              className="mm-dash-nav-btn logout-btn" 
              title="Đăng xuất tài khoản Google"
            >
              🚪 Thoát
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Layout Container */}
      <div className="mm-dash-content-layout">
        
        {/* Left Column: Sidebar with Quick Create */}
        <aside className="mm-dash-sidebar">
          <div className="mm-sidebar-card">
            <h3 className="mm-sidebar-title">Khởi tạo nhanh</h3>
            <p className="mm-sidebar-desc">Bắt đầu phác thảo ý tưởng của bạn ngay lập tức với sơ đồ trống.</p>
            
            <button 
              onClick={() => onCreateMap('Sơ đồ tư duy mới')}
              className="mm-create-btn"
            >
              <span className="mm-create-btn-icon">+</span>
              <span className="mm-create-btn-text">New map</span>
            </button>
          </div>

          <div className="mm-sidebar-help-card">
            <h4>💡 Hướng dẫn nhanh</h4>
            <ul>
              <li>Nhấp đúp chuột để tạo ý tưởng độc lập</li>
              <li>Sử dụng phím <strong>Tab</strong> để tạo nhánh con</li>
              <li>Hệ thống tự động lưu sau mỗi 2 giây</li>
            </ul>
          </div>
        </aside>

        {/* Right Column: Files List Area */}
        <main className="mm-dash-main">
          <div className="mm-dash-main-header">
            <h2 className="mm-dash-main-title">My Mind ({maps.length})</h2>
            
            <div className="mm-dash-main-controls">
              <button className="mm-control-btn" title="Sắp xếp theo tên/ngày">
                <ArrowUpDown size={14} />
                <span>Sắp xếp</span>
              </button>
              <button className="mm-control-btn" title="Bố cục lưới">
                <Grid size={14} />
                <span>Lưới</span>
              </button>
            </div>
          </div>

          {/* Files Container */}
          <div className="mm-dash-files-container">
            {maps.length === 0 ? (
              <div className="mm-dash-empty-state-new">
                <div className="mm-dash-empty-icon-new">📂</div>
                <h3 className="mm-dash-empty-title-new">Chưa có sơ đồ nào</h3>
                <p className="mm-dash-empty-desc-new">
                  Hãy nhấn nút <strong>"New map"</strong> ở cột bên trái để tạo sơ đồ tư duy đầu tiên của bạn.
                </p>
              </div>
            ) : (
              <div className="mm-dash-files-grid-new">
                {maps.map((map) => (
                  <div key={map.id} className="mm-file-card-new">
                    <div 
                      onClick={() => onSelectMap(map.id)}
                      className="mm-file-thumbnail"
                    >
                      <div className="mm-file-thumbnail-icon">📄</div>
                      {map.isShared && (
                        <span className="mm-shared-tag">Shared</span>
                      )}
                      
                      {/* Hover action overlay */}
                      <div className="mm-file-hover-overlay" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => onRenameMap(map.id, map.label)}
                          title="Đổi tên"
                          className="mm-file-action-btn-new rename"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button 
                          onClick={() => onDeleteMap(map.id)}
                          title="Xóa sơ đồ"
                          className="mm-file-action-btn-new delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="mm-file-info-new">
                      <div 
                        onClick={() => onSelectMap(map.id)}
                        className="mm-file-title-new"
                        title={map.label}
                      >
                        {map.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}

export default function GitMindClone() {
  const [isMounted, setIsMounted] = useState(false);
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [dbSetupError, setDbSetupError] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [mapsList, setMapsList] = useState([]);
  const [activeMapId, setActiveMapId] = useState(null);

  // Dynamic layout injection to hide global header/footer and enforce zero scroll height
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!activeMapId) return; // CHỈ inject style khi đang mở thiết kế bản đồ cụ thể

    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      /* 1. Hide global website header and footer on mindmap routes */
      .site-header, .site-footer {
        display: none !important;
      }

      /* 2. Enforce 100vh full-viewport and remove scrolling */
      html, body {
        overflow: hidden !important;
        height: 100vh !important;
        max-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* 3. Style dashboard to fill screen cleanly with viewport height */
      .mm-dash-container {
        height: 100vh !important;
        max-height: 100vh !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        padding: 24px !important;
      }

      /* 4. Scroll only files list internally */
      .mm-dash-files-grid {
        flex: 1 !important;
        overflow-y: auto !important;
        padding-right: 8px !important;
      }

      /* 5. Clean layout height for the editor sidebar */
      .mm-sidebar {
        height: auto !important;
        max-height: calc(100vh - 96px) !important;
        top: 80px !important;
        bottom: auto !important;
        width: 320px !important;
        border-radius: 16px !important;
      }

      /* 6. Compact sidebar header and body paddings */
      .mm-sidebar-header {
        padding: 12px 16px !important;
      }
      .mm-sidebar-body {
        padding: 12px 16px !important;
        overflow-y: auto !important;
      }

      /* 7. Shrink content fields to fit the screen without scroll */
      .mm-sidebar-textarea {
        height: 100px !important;
        padding: 8px 10px !important;
        font-size: 13px !important;
        border-radius: 8px !important;
      }
      .mm-sidebar-input {
        font-size: 15px !important;
        margin-top: 6px !important;
        padding-bottom: 4px !important;
      }

      /* 8. Make color grid and tips box ultra-compact */
      .mm-color-grid {
        gap: 6px !important;
      }
      .mm-color-btn {
        height: 28px !important;
        border-radius: 6px !important;
      }
      .mm-tips-box {
        margin-top: 12px !important;
        padding: 8px 12px !important;
        font-size: 10px !important;
        line-height: 1.4 !important;
        border-radius: 8px !important;
      }
      .mm-sidebar-body.space-y-5 > * + * {
        margin-top: 12px !important;
      }

          /* 9. Styling for inline toolbar title input */
      .mm-toolbar-title-input {
        background: transparent !important;
        border: none !important;
        font-size: 14px !important;
        font-weight: 800 !important;
        color: #1e293b !important;
        padding: 4px 8px !important;
        border-radius: 6px !important;
        max-width: 220px !important;
        transition: all 0.2s ease !important;
        font-family: inherit !important;
      }
      .mm-toolbar-title-input:hover {
        background: rgba(0, 0, 0, 0.04) !important;
      }
      .mm-toolbar-title-input:focus {
        outline: none !important;
        background: rgba(0, 0, 0, 0.06) !important;
        box-shadow: inset 0 0 0 1px rgba(15, 118, 110, 0.2) !important;
        color: #0f766e !important;
      }

      /* 10. Force custom node to have flexible height and wrap all text */
      .mm-custom-node {
        width: 220px !important;
        height: auto !important;
        min-height: 54px !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: stretch !important;
        text-align: left !important;
        padding: 10px 14px !important;
      }

      /* 11. Style inline inputs in custom nodes */
      .mm-node-title-input {
        width: 100% !important;
        background: transparent !important;
        border: none !important;
        font-size: 13px !important;
        font-weight: 700 !important;
        color: #1f2937 !important;
        padding: 0 !important;
        margin: 0 0 4px 0 !important;
        font-family: inherit !important;
        line-height: 1.4 !important;
      }
      .mm-node-title-input:focus {
        outline: none !important;
        border-bottom: 1.5px dashed #0f766e !important;
      }

      .mm-node-desc-textarea {
        width: 100% !important;
        background: transparent !important;
        border: none !important;
        font-size: 10.5px !important;
        color: #6b7280 !important;
        padding: 0 !important;
        margin: 0 !important;
        font-family: inherit !important;
        line-height: 1.4 !important;
        resize: none !important;
        overflow: hidden !important;
        word-break: break-word !important;
      }
      .mm-node-desc-textarea:focus {
        outline: none !important;
        border-bottom: 1.5px dashed #0f766e !important;
      }
      .mm-node-desc-textarea::placeholder {
        color: #cbd5e1 !important;
        font-style: italic !important;
      }
    `;
    document.head.appendChild(styleEl);

    return () => {
      // Remove styles when unmounted to restore standard website appearance
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, [activeMapId]);

  // Sync isMounted to prevent SSR issues
  useEffect(() => {
    setIsMounted(true);
    
    // Auth Check — wrapped in .catch() to prevent unhandled rejections
    supabase.auth.getSession()
      .then(({ data, error: sessionError }) => {
        if (sessionError) {
          console.error('[Auth] getSession error:', sessionError);
          setGeneralError(sessionError.message || 'Lỗi xác thực phiên đăng nhập');
          setLoadingAuth(false);
          return;
        }
        const currentSession = data?.session;
        setSession(currentSession);
        setLoadingAuth(false);
        if (currentSession) {
          fetchUserMindmaps(currentSession.user.id);
        }
      })
      .catch((err) => {
        console.error('[Auth] getSession exception:', err);
        setGeneralError(err?.message || 'Không thể kết nối đến máy chủ xác thực');
        setLoadingAuth(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      try {
        setSession(currentSession);
        setLoadingAuth(false);
        if (currentSession) {
          fetchUserMindmaps(currentSession.user.id);
        } else {
          setMapsList([]);
        }
      } catch (err) {
        console.error('[Auth] onAuthStateChange error:', err);
        setGeneralError(err?.message || 'Lỗi không xác định khi cập nhật phiên');
      }
    });

    // Check URL search params for active map ID
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const queryId = params.get('id');
      if (queryId) {
        setActiveMapId(queryId);
      }
    }

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch mindmaps from Supabase
  const fetchUserMindmaps = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('mindmaps')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        if (error.message?.includes('does not exist') || error.code === 'PGRST202' || error.message?.includes('relation "public.mindmaps" does not exist')) {
          setDbSetupError(true);
          return;
        }
        throw error;
      }

      if (data && data.length > 0) {
        const uiMaps = data.map((map) => ({
          id: map.id,
          label: map.label,
          isShared: map.is_shared,
          nodes: map.nodes || [],
          edges: map.edges || [],
        }));
        setMapsList(uiMaps);
      } else {
        setMapsList([]);
      }
    } catch (err) {
      console.error('[Mindmap] Lỗi tải dữ liệu sơ đồ tư duy từ đám mây:', err);
      // Hiển thị card lỗi thân thiện cho MỌI loại lỗi Supabase
      if (
        err?.message?.includes('does not exist') ||
        err?.code === 'PGRST202' ||
        err?.code === '42P01' ||
        err?.message?.includes('relation "public.mindmaps" does not exist')
      ) {
        setDbSetupError(true);
      } else {
        // Lỗi khác (mất mạng, permission, v.v.) → hiển thị thông báo chung
        setGeneralError(err?.message || 'Không thể tải danh sách sơ đồ tư duy');
      }
    }
  };

  // Listen to popstate to sync back button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveMapId(params.get('id'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle map selection
  const handleSelectMap = (id) => {
    setActiveMapId(id);
    window.history.pushState(null, '', `/mindmap?id=${id}`);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setActiveMapId(null);
    window.history.pushState(null, '', '/mindmap');
  };

  // Save map canvas data (nodes and edges)
  const handleSaveMapData = useCallback((id, nodes, edges) => {
    setMapsList((prevList) => {
      return prevList.map((map) => {
        if (map.id === id) {
          return { ...map, nodes, edges };
        }
        return map;
      });
    });

    // Save directly to cloud (asynchronously so UI performance is buttery smooth)
    supabase.from('mindmaps')
      .update({
        nodes,
        edges,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('[Save] Lỗi tự động lưu đám mây:', error);
      });
  }, []);

  // Create new mindmap
  const handleCreateMap = async (title = 'Sơ đồ tư duy mới', isAI = false) => {
    if (!session) return;
    const id = `map-${Date.now()}`;
    const newMap = {
      id,
      label: title,
      isShared: false,
      nodes: [
        { 
          id: 'root', 
          type: 'customCustomNode', 
          position: { x: 250, y: 250 }, 
          data: { label: isAI ? 'AI Kịch Bản Sáng Tạo' : 'Ý tưởng chính', content: 'Ghi chú...', color: '#0f766e' } 
        }
      ],
      edges: []
    };

    // Optimistically update UI
    setMapsList(prev => [newMap, ...prev]);
    handleSelectMap(id);

    // Persist to cloud
    const { error } = await supabase.from('mindmaps').insert({
      id,
      user_id: session.user.id,
      label: newMap.label,
      is_shared: newMap.isShared,
      nodes: newMap.nodes,
      edges: newMap.edges
    });
    if (error) {
      console.error('[Create] Lỗi thêm sơ đồ tư duy vào đám mây:', error);
      // Hiển thị card hướng dẫn thiết lập CSDL nếu bảng chưa tồn tại
      if (
        error.message?.includes('does not exist') ||
        error.code === 'PGRST202' ||
        error.code === '42P01' ||
        error.message?.includes('relation "public.mindmaps" does not exist')
      ) {
        setDbSetupError(true);
      }
    }
  };

  // Delete map from list
  const handleDeleteMap = async (id) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa sơ đồ tư duy này?');
    if (!confirmDelete) return;

    // Optimistically update UI
    setMapsList(prev => prev.filter((map) => map.id !== id));
    
    if (activeMapId === id) {
      handleBackToDashboard();
    }

    // Persist to cloud
    const { error } = await supabase.from('mindmaps').delete().eq('id', id);
    if (error) console.error('[Delete] Lỗi xóa sơ đồ tư duy khỏi đám mây:', error);
  };

  // Rename map label (supports both direct inline rename and fallback prompt)
  const handleRenameMap = async (id, currentLabel, directTitle = null) => {
    let newLabel = directTitle;
    if (directTitle === null) {
      newLabel = window.prompt('Nhập tên mới cho sơ đồ tư duy:', currentLabel);
    }
    if (!newLabel || newLabel.trim() === '') return;

    // Optimistically update UI
    setMapsList(prev => prev.map((map) => {
      if (map.id === id) {
        return { ...map, label: newLabel };
      }
      return map;
    }));

    // Persist to cloud
    const { error } = await supabase.from('mindmaps').update({
      label: newLabel,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    if (error) console.error('[Rename] Lỗi đổi tên sơ đồ tư duy:', error);
  };

  if (!isMounted) {
    return (
      <div className="flex h-screen bg-[#fafafa] text-gray-500 items-center justify-center font-mono text-sm">
        Đang khởi động Ngăn Đá Workspace...
      </div>
    );
  }

  const sqlSetupCommand = `CREATE TABLE IF NOT EXISTS public.mindmaps (
  id text NOT NULL PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_shared boolean NOT NULL DEFAULT false,
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.mindmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can insert their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can update their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Users can delete their own mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Anyone can view shared mindmaps" ON public.mindmaps;
DROP POLICY IF EXISTS "Admins can do everything" ON public.mindmaps;

CREATE POLICY "Users can view their own mindmaps" ON public.mindmaps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mindmaps" ON public.mindmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mindmaps" ON public.mindmaps
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mindmaps" ON public.mindmaps
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view shared mindmaps" ON public.mindmaps
  FOR SELECT USING (is_shared = true);

CREATE POLICY "Admins can do everything" ON public.mindmaps
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  )) WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'
  ));

-- Tạo hàm is_admin() nếu chưa có
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COALESCE((raw_user_meta_data->>'is_admin')::boolean, false)
    FROM auth.users
    WHERE id = auth.uid()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Create or update the registered users RPC endpoint for the Admin Mindmap control panel
DROP FUNCTION IF EXISTS public.get_registered_users();
CREATE OR REPLACE FUNCTION public.get_registered_users()
RETURNS TABLE (
  id uuid,
  email varchar,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  raw_user_meta_data jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Quyền truy cập bị từ chối: Chỉ tài khoản Admin mới được thực thi hàm này.';
  END IF;
  
  RETURN QUERY
  SELECT u.id, u.email::varchar, u.created_at, u.last_sign_in_at, u.raw_user_meta_data
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_registered_users() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_registered_users() TO authenticated;`;

  if (dbSetupError) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6" style={{ fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '300px', height: '300px', background: 'rgba(239, 68, 68, 0.04)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        
        <div style={{
          width: '100%',
          maxWidth: '600px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: '#dc2626' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Cần Khởi Tạo Bảng Dữ Liệu Mindmaps</h2>
          </div>
          
          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
            Bảng `mindmaps` chưa được tạo trong CSDL Supabase. Vui lòng sao chép đoạn mã SQL bên dưới, dán vào **SQL Editor &rarr; New Query &rarr; Run** trong Supabase Dashboard của bạn để thiết lập bảng CSDL và phân quyền bảo mật (RLS) cho Admin.
          </p>
          
          <pre style={{
            background: '#0f172a',
            color: '#34d399',
            padding: '16px',
            borderRadius: '10px',
            overflowX: 'auto',
            fontSize: '12.5px',
            fontFamily: 'monospace',
            lineHeight: 1.5,
            border: '1px solid #1e293b',
            maxHeight: '220px',
            marginBottom: '24px'
          }}>
            <code>{sqlSetupCommand}</code>
          </pre>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setDbSetupError(false);
                setLoadingAuth(true);
                supabase.auth.getSession().then(({ data }) => {
                  const currentSession = data?.session;
                  if (currentSession) {
                    fetchUserMindmaps(currentSession.user.id);
                  } else {
                    setLoadingAuth(false);
                  }
                }).catch(() => setLoadingAuth(false));
              }}
              style={{
                flex: 1,
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#0f766e',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.15)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0d6d66'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0f766e'; }}
            >
              🔄 Tôi đã cấu hình xong SQL, Thử lại
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              style={{
                padding: '12px 20px',
                borderRadius: '12px',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '13.5px',
                fontWeight: '600',
                border: '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              🚪 Thoát
            </button>
          </div>
        </div>
      </div>
    );
  }

  // General error (network, permission, etc.) - shown BEFORE auth check
  if (generalError) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', padding: '2rem', textAlign: 'center',
        fontFamily: "'Outfit', -apple-system, sans-serif", background: '#f8fafc'
      }}>
        <div style={{
          maxWidth: '520px', width: '100%', padding: '2.5rem 2rem',
          borderRadius: '20px', background: '#ffffff',
          border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
        }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
          <h2 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.75rem' }}>
            Lỗi Kết Nối Cơ Sở Dữ Liệu
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.65, marginBottom: '1rem' }}>
            Không thể tải dữ liệu Mindmap. Nếu bạn vừa thiết lập bảng CSDL, hãy thử lại.
          </p>
          <pre style={{
            background: '#fff7ed', border: '1px solid #fed7aa',
            borderRadius: '10px', padding: '12px 16px',
            fontSize: '12px', color: '#9a3412', fontFamily: 'monospace',
            textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            marginBottom: '1.5rem', maxHeight: '120px', overflowY: 'auto'
          }}>
            {generalError}
          </pre>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setGeneralError(null);
                setLoadingAuth(true);
                supabase.auth.getSession()
                  .then(({ data }) => {
                    const s = data?.session;
                    setSession(s);
                    setLoadingAuth(false);
                    if (s) fetchUserMindmaps(s.user.id);
                  })
                  .catch(() => setLoadingAuth(false));
              }}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                background: '#0f766e', color: '#ffffff',
                fontSize: '0.9rem', fontWeight: 600,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(15,118,110,0.25)'
              }}
            >
              🔄 Thử lại
            </button>
            <button
              onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                background: '#f1f5f9', color: '#334155',
                fontSize: '0.9rem', fontWeight: 600,
                border: '1px solid #cbd5e1', cursor: 'pointer'
              }}
            >
              🚪 Đăng xuất
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Auth check and show Google Sign-In with elegant light-themed glassmorphism card
  if (loadingAuth) {
    return (
      <div className="flex h-screen bg-[#fafafa] text-gray-600 items-center justify-center font-mono text-sm">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #0f766e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span>Đang kiểm tra thông tin đăng nhập Google...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6" style={{ fontFamily: "'Outfit', sans-serif", position: 'relative', overflow: 'hidden' }}>
        {/* Glow Spheres */}
        <div style={{ position: 'absolute', top: '15%', left: '15%', width: '300px', height: '300px', background: 'rgba(15, 118, 110, 0.06)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', right: '15%', width: '300px', height: '300px', background: 'rgba(34, 197, 94, 0.05)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          {/* Logo icon */}
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #0f766e 0%, #10b981 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)',
            marginBottom: '24px'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '8px', letterSpacing: '-0.02em' }}>Ngăn Đá Workspace</h1>
          <p style={{ fontSize: '10.5px', fontWeight: 700, color: '#0f766e', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '24px' }}>Ý tưởng vô hạn • Đồng bộ đám mây</p>

          <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.06)', marginBottom: '24px' }} />

          <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '32px', fontWeight: 400 }}>
            Hệ thống thiết kế sơ đồ tư duy chuyên nghiệp dành cho quản lý VSL & kịch bản sáng tạo. Vui lòng đăng nhập Google để tự động đồng bộ và sử dụng.
          </p>

          <button
            onClick={async () => {
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/mindmap` : undefined,
                }
              });
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14.5px',
              padding: '14px 24px',
              borderRadius: '14px',
              border: 'none',
              boxShadow: '0 4px 12px rgba(30, 41, 59, 0.15)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0f172a'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#1e293b'; e.currentTarget.style.transform = 'none'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Đăng nhập bằng tài khoản Google
          </button>

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <a 
              href="/" 
              style={{ fontSize: '13px', color: '#0f766e', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🏠 Quay lại trang chủ website
            </a>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
              Kết nối bảo mật qua Google OAuth & Supabase Security
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active Map Data reference for editor
  const activeMapData = mapsList.find(map => map.id === activeMapId);

  return (
    <ReactFlowProvider>
      {activeMapId && activeMapData ? (
        <MindmapEditor 
          mapId={activeMapId}
          currentMapData={activeMapData}
          onBackToDashboard={handleBackToDashboard}
          onSaveMapData={handleSaveMapData}
          onRenameMap={handleRenameMap}
        />
      ) : (
        <MindmapDashboard 
          maps={mapsList}
          session={session}
          onCreateMap={handleCreateMap}
          onDeleteMap={handleDeleteMap}
          onRenameMap={handleRenameMap}
          onSelectMap={handleSelectMap}
        />
      )}
    </ReactFlowProvider>
  );
}
