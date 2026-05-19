import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './PrimsAlgorithm.css';

// MinHeap implementation for priority queue
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(edge) {
    this.heap.push(edge);
    return this.bubbleUp(this.heap.length - 1); // Return indices for animation
  }

  bubbleUp(index) {
    const swapPath = [index];
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].weight < this.heap[parent].weight) {
        [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
        swapPath.push(parent);
        index = parent;
      } else {
        break;
      }
    }
    return swapPath;
  }

  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return { min: this.heap.pop(), swapPath: [] };
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    const swapPath = this.bubbleDown(0);
    return { min, swapPath };
  }

  bubbleDown(index) {
    const swapPath = [index];
    const last = this.heap.length - 1;
    while (true) {
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left <= last && this.heap[left].weight < this.heap[smallest].weight) {
        smallest = left;
      }
      if (right <= last && this.heap[right].weight < this.heap[smallest].weight) {
        smallest = right;
      }
      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        swapPath.push(smallest);
        index = smallest;
      } else {
        break;
      }
    }
    return swapPath;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  getHeap() {
    return [...this.heap];
  }
}

// Generate a connected weighted undirected graph
const generateGraph = (caseType = 'average') => {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
  // Base chain for connectivity
  let edges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'B', to: 'C', weight: 2 },
    { from: 'C', to: 'D', weight: 3 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 5 },
    // Additional edges for density
    { from: 'A', to: 'C', weight: 4 },
    { from: 'B', to: 'D', weight: 3 },
    { from: 'C', to: 'E', weight: 2 },
    { from: 'D', to: 'F', weight: 6 },
    { from: 'A', to: 'F', weight: 7 },
  ];

  if (caseType === 'best') {
    edges = edges.map((edge) => ({
      ...edge,
      weight: Math.floor(edge.weight * 0.5) + 1,
    }));
  } else if (caseType === 'worst') {
    edges = edges.map((edge) => ({
      ...edge,
      weight: edge.weight * 2,
    }));
  } else {
    edges = edges.map((edge) => ({
      ...edge,
      weight: Math.floor(Math.random() * 10) + 1,
    }));
  }

  return { nodes, edges };
};

const PrimsAlgorithm = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [mstEdges, setMstEdges] = useState([]);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [comparisonEdges, setComparisonEdges] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [heapOperation, setHeapOperation] = useState(null); // 'insert', 'extract'
  const [heapHighlightIndices, setHeapHighlightIndices] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Prim\'s Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, heapOps: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    visited: new Set(),
    heap: new MinHeap(),
    mst: [],
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runPrimStep = async () => {
    const { visited, heap, mst } = stateRef.current;
    const edges = [...graph.edges];

    if (visited.size === 0) {
      visited.add(graph.nodes[0]);
      setVisitedNodes([graph.nodes[0]]);
      const newEdges = edges.filter(
        (edge) => edge.from === graph.nodes[0] || edge.to === graph.nodes[0]
      );
      newEdges.forEach((edge) => {
        const swapPath = heap.insert(edge);
        setHeapHighlightIndices(swapPath);
        setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
      });
      setPriorityQueue(heap.getHeap());
      setHeapOperation('insert');
      setStepDescription([
        `Step ${stepCount + 1}: Initialize with node ${graph.nodes[0]}`,
        `Node ${graph.nodes[0]} added to MST`,
        `Enqueued edges: ${newEdges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Priority Queue updated`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps + newEdges.length} heap ops`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 2);
      setHeapOperation(null);
      setHeapHighlightIndices([]);
    }

    // Highlight edges in priority queue
    setComparisonEdges(heap.getHeap());
    setStepDescription([
      `Step ${stepCount + 1}: Priority Queue (${heap.getHeap().length} edges)`,
      `Edges: ${heap.getHeap().map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Extracting minimum weight edge`,
      `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
    ]);
    await delay(speed / 2);

    // Extract minimum edge
    const result = heap.extractMin();
    if (!result) {
      setStepDescription([
        `Error: Priority Queue empty`,
        `Graph may be disconnected`,
        `Visited nodes: ${[...visited].join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentEdge(null);
      setComparisonEdges([]);
      setPriorityQueue([]);
      setHeapHighlightIndices([]);
      clearInterval(intervalRef.current);
      return;
    }

    const { min: minEdge, swapPath } = result;
    setPriorityQueue(heap.getHeap());
    setHeapOperation('extract');
    setHeapHighlightIndices(swapPath);
    setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
    await delay(speed / 2);
    setHeapOperation(null);
    setHeapHighlightIndices([]);

    setCurrentEdge(minEdge);
    setStepDescription([
      `Step ${stepCount + 1}: Extracted edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight})`,
      `Checking if edge connects new node`,
      `Priority Queue: ${heap.getHeap().map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount((prev) => prev + 1);
    await delay(speed / 2);

    // Check if edge connects a new node
    const newNode = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
    if (!visited.has(newNode)) {
      mst.push(minEdge);
      setMstEdges([...mst]);
      visited.add(newNode);
      setVisitedNodes([...visited]);
      setStepDescription([
        `Added edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight}) to MST`,
        `New node ${newNode} added to MST`,
        `Total MST weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
        `Time: O(E log V), Space: O(V + E)`,
      ]);

      // Add new edges from the new node
      const newEdges = edges.filter(
        (edge) =>
          (edge.from === newNode && !visited.has(edge.to)) ||
          (edge.to === newNode && !visited.has(edge.from))
      );
      newEdges.forEach((edge) => {
        const swapPath = heap.insert(edge);
        setHeapHighlightIndices(swapPath);
        setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
      });
      setPriorityQueue(heap.getHeap());
      setHeapOperation('insert');
      await delay(speed / 2);
      setHeapOperation(null);
      setHeapHighlightIndices([]);
    }

    setCurrentEdge(null);
    setComparisonEdges([]);

    if (visited.size === graph.nodes.length) {
      setStepDescription([
        `Minimum Spanning Tree completed!`,
        `Total edges: ${mst.length}`,
        `Total weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
        `Time: O(E log V), Space: O(V + E)`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentEdge(null);
      setComparisonEdges([]);
      setPriorityQueue([]);
      clearInterval(intervalRef.current);
    }

    stateRef.current = { visited, heap, mst };
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Prim's Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, heapOps: 0 });
    setMstEdges([]);
    setVisitedNodes([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    stateRef.current = {
      visited: new Set(),
      heap: new MinHeap(),
      mst: [],
    };
    intervalRef.current = setInterval(runPrimStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runPrimStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Prim's Algorithm`,
        `Visited nodes: ${[...stateRef.current.visited].join(', ')}`,
        `MST edges: ${stateRef.current.mst.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      ]);
      intervalRef.current = setInterval(runPrimStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Visited nodes: ${[...stateRef.current.visited].join(', ')}`,
        `MST edges: ${stateRef.current.mst.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(caseType);
    setGraph(newGraph);
    setIsRunning(false);
    setIsPaused(false);
    setMstEdges([]);
    setVisitedNodes([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setHeapOperation(null);
    setHeapHighlightIndices([]);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, heapOps: 0 });
    stateRef.current = {
      visited: new Set(),
      heap: new MinHeap(),
      mst: [],
    };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runPrimStep, newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(newCase);
    setGraph(newGraph);
    setIsRunning(false);
    setIsPaused(false);
    setMstEdges([]);
    setVisitedNodes([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setHeapOperation(null);
    setHeapHighlightIndices([]);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, heapOps: 0 });
    stateRef.current = {
      visited: new Set(),
      heap: new MinHeap(),
      mst: [],
    };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // Circular layout for graph nodes
  const nodePositions = graph.nodes.reduce((acc, node, idx) => {
    const angle = (2 * Math.PI * idx) / graph.nodes.length;
    const radius = 160;
    return {
      ...acc,
      [node]: {
        x: 220 + radius * Math.cos(angle),
        y: 220 + radius * Math.sin(angle),
      },
    };
  }, {});

  // Heap node positions for tree visualization
  const getHeapNodePositions = (heap) => {
    const positions = [];
    const maxLevel = Math.floor(Math.log2(heap.length)) + 1;
    const width = 400;
    const height = 200;
    const levelHeight = height / (maxLevel + 1);

    heap.forEach((_, index) => {
      const level = Math.floor(Math.log2(index + 1));
      const nodesInLevel = Math.min(2 ** level, heap.length - 2 ** level + 1);
      const xSpacing = width / (nodesInLevel + 1);
      const positionInLevel = index + 1 - 2 ** level;
      const x = xSpacing * (positionInLevel + 1);
      const y = (level + 1) * levelHeight;
      positions.push({ x, y });
    });

    return positions;
  };

  const heapNodePositions = getHeapNodePositions(priorityQueue);

  return (
    <motion.div
      className="prims-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="prims-algorithm-title"
    >
      <section className="header-section" aria-label="Prim's Algorithm Header">
        <h1 id="prims-algorithm-title" className="animation-title">
          Prim's Algorithm
        </h1>
        <p className="animation-subtitle">Construct a Minimum Spanning Tree with Greedy Selection</p>
      </section>

      <section className="visualization-section" aria-label="Graph and Priority Queue Visualization">
        <div className="graph-info">
          <p>
            Total MST Weight:{' '}
            <span className="target-value">
              {mstEdges.reduce((sum, edge) => sum + edge.weight, 0)}
            </span>
          </p>
        </div>
        <div className="visualization-container">
          <svg className="graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`edge ${
                    mstEdges.includes(edge)
                      ? 'mst-edge'
                      : currentEdge === edge
                      ? 'current-edge'
                      : comparisonEdges.includes(edge)
                      ? 'comparison-edge'
                      : ''
                  }`}
                />
                <text
                  x={(nodePositions[edge.from].x + nodePositions[edge.to].x) / 2}
                  y={(nodePositions[edge.from].y + nodePositions[edge.to].y) / 2 - 10}
                  className="edge-weight"
                >
                  {edge.weight}
                </text>
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`node ${visitedNodes.includes(node) ? 'visited' : ''}`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="node-label"
                >
                  {node}
                </text>
              </g>
            ))}
          </svg>
          <svg className="heap-container" width="440" height="240">
            <text x="220" y="30" className="heap-title" textAnchor="middle">
              Priority Queue (Min-Heap)
            </text>
            {priorityQueue.map((edge, index) => {
              const { x, y } = heapNodePositions[index];
              const parentIndex = Math.floor((index - 1) / 2);
              return (
                <g key={`heap-node-${index}`}>
                  {index > 0 && (
                    <line
                      x1={heapNodePositions[parentIndex].x}
                      y1={heapNodePositions[parentIndex].y + 15}
                      x2={x}
                      y2={y - 15}
                      className={`heap-edge ${
                        heapHighlightIndices.includes(index) || heapHighlightIndices.includes(parentIndex)
                          ? 'heap-edge-highlight'
                          : ''
                      }`}
                    />
                  )}
                  <motion.rect
                    x={x - 40}
                    y={y - 15}
                    width="80"
                    height="30"
                    rx="8"
                    className={`heap-node ${
                      heapOperation === 'insert' && heapHighlightIndices.includes(index)
                        ? 'heap-node-insert'
                        : heapOperation === 'extract' && heapHighlightIndices.includes(index)
                        ? 'heap-node-extract'
                        : ''
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    className="heap-node-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {`${edge.from}-${edge.to}(${edge.weight})`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <section className="info-section" aria-label="Algorithm Information">
        <div className="step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'primary' : 'secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="complexity-visuals">
          <div className="complexity-card">
            <h3>Time Complexity: O(E log V)</h3>
            <div
              className="operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.heapOps) * 10, 200)}px` }}
            />
            <p>
              {operationCount.comparisons} comparisons, {operationCount.heapOps} heap ops
            </p>
          </div>
          <div className="complexity-card">
            <h3>Space Complexity: O(V + E)</h3>
            <div className="memory-bar" style={{ width: `100px` }} />
            <p>
              {graph.nodes.length} nodes, {graph.edges.length} edges
            </p>
          </div>
        </div>
      </section>

      <section className="controls-section" aria-label="Animation Controls">
        <div className="animation-controls">
          <button
            className="control-button start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start Prim's Algorithm"
          >
            <PlayIcon className="control-icon" />
            Start
          </button>
          <button
            className="control-button pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="control-icon" />
            ) : (
              <PauseIcon className="control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="control-button step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="control-icon" />
            Step
          </button>
          <button
            className="control-button reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="control-icon" />
            Reset
          </button>
          <div className="speed-control">
            <label htmlFor="speed-select" className="control-label">
              Speed:
            </label>
            <select
              id="speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="case-control">
            <label htmlFor="case-select" className="control-label">
              Case:
            </label>
            <select
              id="case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="control-dropdown"
              aria-label="Select Case Type"
            >
              <option value="best">Best Case</option>
              <option value="worst">Worst Case</option>
              <option value="average">Average Case</option>
            </select>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default PrimsAlgorithm;