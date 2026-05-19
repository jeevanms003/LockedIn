import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './KruskalsAlgorithm.css';

// MinHeap for priority queue
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(edge) {
    this.heap.push(edge);
    return this.bubbleUp(this.heap.length - 1);
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

  getHeap() {
    return [...this.heap];
  }
}

// UnionFind for cycle detection
class UnionFind {
  constructor(size) {
    this.parent = Array(size)
      .fill()
      .map((_, i) => i);
    this.rank = Array(size).fill(0);
  }

  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }

  union(x, y) {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX === rootY) return false;
    if (this.rank[rootX] < this.rank[rootY]) {
      this.parent[rootX] = rootY;
    } else if (this.rank[rootX] > this.rank[rootY]) {
      this.parent[rootY] = rootX;
    } else {
      this.parent[rootY] = rootX;
      this.rank[rootX]++;
    }
    return true;
  }
}

// Generate a connected weighted undirected graph
const generateGraph = (caseType = 'average') => {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
  let edges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'B', to: 'C', weight: 2 },
    { from: 'C', to: 'D', weight: 3 },
    { from: 'D', to: 'E', weight: 3 },
    { from: 'E', to: 'F', weight: 5 },
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

const KruskalsAlgorithm = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [mstEdges, setMstEdges] = useState([]);
  const [connectedComponents, setConnectedComponents] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [comparisonEdges, setComparisonEdges] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [heapOperation, setHeapOperation] = useState(null);
  const [heapHighlightIndices, setHeapHighlightIndices] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Kruskal\'s Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ unions: 0, finds: 0, heapOps: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    heap: new MinHeap(),
    uf: null,
    mst: [],
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runKruskalStep = async () => {
    const { heap, uf, mst } = stateRef.current;
    const edges = [...graph.edges];

    if (mst.length === 0 && heap.getHeap().length === 0) {
      // Initialize
      stateRef.current.uf = new UnionFind(graph.nodes.length);
      edges.forEach((edge) => {
        const swapPath = heap.insert(edge);
        setHeapHighlightIndices(swapPath);
        setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
      });
      setPriorityQueue(heap.getHeap());
      setHeapOperation('insert');
      setStepDescription([
        `Step ${stepCount + 1}: Initialize Kruskal's Algorithm`,
        `Enqueued all edges: ${edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps + edges.length} heap ops`,
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
      `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps} heap ops`,
    ]);
    await delay(speed / 2);

    // Extract minimum edge
    const result = heap.extractMin();
    if (!result) {
      setStepDescription([
        `Error: Priority Queue empty`,
        `Graph may be disconnected or MST complete`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps} heap ops`,
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
      `Checking for cycle using Union-Find`,
      `Priority Queue: ${heap.getHeap().map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps} heap ops`,
    ]);
    setStepCount((prev) => prev + 1);
    await delay(speed / 2);

    // Check for cycle
    const nodeToIndex = graph.nodes.reduce((acc, node, idx) => ({ ...acc, [node]: idx }), {});
    const u = nodeToIndex[minEdge.from];
    const v = nodeToIndex[minEdge.to];
    setOperationCount((prev) => ({ ...prev, finds: prev.finds + 2 }));
    const canAdd = uf.union(u, v);

    if (canAdd) {
      mst.push(minEdge);
      setMstEdges([...mst]);
      setStepDescription([
        `Added edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight}) to MST`,
        `Merged components of ${minEdge.from} and ${minEdge.to}`,
        `Total MST weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}`,
        `Operations: ${operationCount.unions + 1} unions, ${operationCount.finds + 2} finds, ${operationCount.heapOps} heap ops`,
      ]);
      setOperationCount((prev) => ({ ...prev, unions: prev.unions + 1 }));
      // Update connected components visualization
      const components = {};
      graph.nodes.forEach((node, idx) => {
        const root = uf.find(idx);
        if (!components[root]) components[root] = [];
        components[root].push(node);
      });
      setConnectedComponents(Object.values(components));
      await delay(speed / 2);
    } else {
      setStepDescription([
        `Skipped edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight}) - forms a cycle`,
        `Priority Queue: ${heap.getHeap().map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds + 2} finds, ${operationCount.heapOps} heap ops`,
      ]);
      await delay(speed / 2);
    }

    setCurrentEdge(null);
    setComparisonEdges([]);

    if (mst.length === graph.nodes.length - 1) {
      setStepDescription([
        `Minimum Spanning Tree completed!`,
        `Total edges: ${mst.length}`,
        `Total weight: ${mst.reduce((sum, edge) => sum + edge.weight, 0)}`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds + 2} finds, ${operationCount.heapOps} heap ops`,
        `Time: O(E log E), Space: O(V + E)`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentEdge(null);
      setComparisonEdges([]);
      setPriorityQueue([]);
      setHeapHighlightIndices([]);
      clearInterval(intervalRef.current);
    }

    stateRef.current = { heap, uf, mst };
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Kruskal's Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log E), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ unions: 0, finds: 0, heapOps: 0 });
    setMstEdges([]);
    setConnectedComponents([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setHeapOperation(null);
    setHeapHighlightIndices([]);
    stateRef.current = {
      heap: new MinHeap(),
      uf: null,
      mst: [],
    };
    intervalRef.current = setInterval(runKruskalStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runKruskalStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Kruskal's Algorithm`,
        `MST edges: ${stateRef.current.mst.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps} heap ops`,
      ]);
      intervalRef.current = setInterval(runKruskalStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `MST edges: ${stateRef.current.mst.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.unions} unions, ${operationCount.finds} finds, ${operationCount.heapOps} heap ops`,
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
    setConnectedComponents([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setHeapOperation(null);
    setHeapHighlightIndices([]);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log E), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ unions: 0, finds: 0, heapOps: 0 });
    stateRef.current = {
      heap: new MinHeap(),
      uf: null,
      mst: [],
    };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runKruskalStep, newSpeed);
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
    setConnectedComponents([]);
    setCurrentEdge(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setHeapOperation(null);
    setHeapHighlightIndices([]);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log E), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ unions: 0, finds: 0, heapOps: 0 });
    stateRef.current = {
      heap: new MinHeap(),
      uf: null,
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

  // Heap node positions
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
      className="kruskals-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="kruskals-algorithm-title"
    >
      <section className="kruskals-header-section" aria-label="Kruskal's Algorithm Header">
        <h1 id="kruskals-algorithm-title" className="kruskals-animation-title">
          Kruskal's Algorithm
        </h1>
        <p className="kruskals-animation-subtitle">Construct a Minimum Spanning Tree with Edge Sorting</p>
      </section>

      <section className="kruskals-visualization-section" aria-label="Graph and Priority Queue Visualization">
        <div className="kruskals-graph-info">
          <p>
            Total MST Weight:{' '}
            <span className="kruskals-target-value">
              {mstEdges.reduce((sum, edge) => sum + edge.weight, 0)}
            </span>
          </p>
          <p>
            Connected Components:{' '}
            <span className="kruskals-target-value">
              {connectedComponents.length > 0
                ? connectedComponents.map((comp) => `(${comp.join(', ')})`).join(', ')
                : 'None'}
            </span>
          </p>
        </div>
        <div className="kruskals-visualization-container">
          <svg className="kruskals-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`kruskals-edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`kruskals-edge ${
                    mstEdges.includes(edge)
                      ? 'kruskals-mst-edge'
                      : currentEdge === edge
                      ? 'kruskals-current-edge'
                      : comparisonEdges.includes(edge)
                      ? 'kruskals-comparison-edge'
                      : ''
                  }`}
                />
                <text
                  x={(nodePositions[edge.from].x + nodePositions[edge.to].x) / 2}
                  y={(nodePositions[edge.from].y + nodePositions[edge.to].y) / 2 - 10}
                  className="kruskals-edge-weight"
                >
                  {edge.weight}
                </text>
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`kruskals-node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`kruskals-node ${
                    mstEdges.some((e) => e.from === node || e.to === node) ? 'kruskals-visited' : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="kruskals-node-label"
                >
                  {node}
                </text>
              </g>
            ))}
          </svg>
          <svg className="kruskals-heap-container" width="440" height="240">
            <text x="220" y="30" className="kruskals-heap-title" textAnchor="middle">
              Priority Queue (Min-Heap)
            </text>
            {priorityQueue.map((edge, index) => {
              const { x, y } = heapNodePositions[index];
              const parentIndex = Math.floor((index - 1) / 2);
              return (
                <g key={`kruskals-heap-node-${index}`}>
                  {index > 0 && (
                    <line
                      x1={heapNodePositions[parentIndex].x}
                      y1={heapNodePositions[parentIndex].y + 15}
                      x2={x}
                      y2={y - 15}
                      className={`kruskals-heap-edge ${
                        heapHighlightIndices.includes(index) || heapHighlightIndices.includes(parentIndex)
                          ? 'kruskals-heap-edge-highlight'
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
                    className={`kruskals-heap-node ${
                      heapOperation === 'insert' && heapHighlightIndices.includes(index)
                        ? 'kruskals-heap-node-insert'
                        : heapOperation === 'extract' && heapHighlightIndices.includes(index)
                        ? 'kruskals-heap-node-extract'
                        : ''
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    className="kruskals-heap-node-label"
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

      <section className="kruskals-info-section" aria-label="Algorithm Information">
        <div className="kruskals-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'kruskals-primary' : 'kruskals-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="kruskals-complexity-visuals">
          <div className="kruskals-complexity-card">
            <h3>Time Complexity: O(E log E)</h3>
            <div
              className="kruskals-operation-bar"
              style={{ width: `${Math.min((operationCount.unions + operationCount.finds + operationCount.heapOps) * 5, 200)}px` }}
            />
            <p>
              {operationCount.unions} unions, {operationCount.finds} finds, {operationCount.heapOps} heap ops
            </p>
          </div>
          <div className="kruskals-complexity-card">
            <h3>Space Complexity: O(V + E)</h3>
            <div className="kruskals-memory-bar" style={{ width: `100px` }} />
            <p>
              {graph.nodes.length} nodes, {graph.edges.length} edges
            </p>
          </div>
        </div>
      </section>

      <section className="kruskals-controls-section" aria-label="Animation Controls">
        <div className="kruskals-animation-controls">
          <button
            className="kruskals-control-button kruskals-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start Kruskal's Algorithm"
          >
            <PlayIcon className="kruskals-control-icon" />
            Start
          </button>
          <button
            className="kruskals-control-button kruskals-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="kruskals-control-icon" />
            ) : (
              <PauseIcon className="kruskals-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="kruskals-control-button kruskals-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="kruskals-control-icon" />
            Step
          </button>
          <button
            className="kruskals-control-button kruskals-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="kruskals-control-icon" />
            Reset
          </button>
          <div className="kruskals-speed-control">
            <label htmlFor="kruskals-speed-select" className="kruskals-control-label">
              Speed:
            </label>
            <select
              id="kruskals-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="kruskals-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="kruskals-case-control">
            <label htmlFor="kruskals-case-select" className="kruskals-control-label">
              Case:
            </label>
            <select
              id="kruskals-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="kruskals-control-dropdown"
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

export default KruskalsAlgorithm;
