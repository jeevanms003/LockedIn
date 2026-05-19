import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './Dijkstra.css';

// MinHeap implementation for priority queue
class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(item) {
    this.heap.push(item);
    return this.bubbleUp(this.heap.length - 1);
  }

  bubbleUp(index) {
    const swapPath = [index];
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.heap[index].distance < this.heap[parent].distance) {
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

      if (left <= last && this.heap[left].distance < this.heap[smallest].distance) {
        smallest = left;
      }
      if (right <= last && this.heap[right].distance < this.heap[smallest].distance) {
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

const Dijkstra = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [shortestPathEdges, setShortestPathEdges] = useState([]);
  const [processedNodes, setProcessedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [comparisonEdges, setComparisonEdges] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [heapOperation, setHeapOperation] = useState(null);
  const [heapHighlightIndices, setHeapHighlightIndices] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Dijkstra\'s Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, heapOps: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const [distances, setDistances] = useState({});
  const stateRef = useRef({
    processed: new Set(),
    heap: new MinHeap(),
    predecessors: {},
    distances: {},
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runDijkstraStep = async () => {
    const { processed, heap, predecessors, distances } = stateRef.current;
    const edges = [...graph.edges];

    if (processed.size === 0) {
      const source = graph.nodes[0];
      processed.add(source);
      setProcessedNodes([source]);
      distances[source] = 0;
      graph.nodes.forEach((node) => {
        if (node !== source) distances[node] = Infinity;
      });
      setDistances({ ...distances });
      const newItems = edges
        .filter((edge) => edge.from === source || edge.to === source)
        .map((edge) => {
          const neighbor = edge.from === source ? edge.to : edge.from;
          return { node: neighbor, distance: edge.weight, parent: source };
        });
      newItems.forEach((item) => {
        distances[item.node] = item.distance;
        predecessors[item.node] = item.parent;
        const swapPath = heap.insert(item);
        setHeapHighlightIndices(swapPath);
        setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
      });
      setPriorityQueue(heap.getHeap());
      setHeapOperation('insert');
      setStepDescription([
        `Step ${stepCount + 1}: Initialize with source node ${source}`,
        `Set distance[${source}] = 0, others = ∞`,
        `Enqueued neighbors: ${newItems.map((item) => `${item.node}(${item.distance})`).join(', ')}`,
        `Priority Queue updated`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps + newItems.length} heap ops`,
      ]);
      setStepCount((prev) => prev + 1);
      setDistances({ ...distances });
      await delay(speed / 2);
      setHeapOperation(null);
      setHeapHighlightIndices([]);
    }

    setComparisonEdges(
      edges.filter((edge) =>
        heap.getHeap().some((item) => (edge.from === item.node && processed.has(edge.to)) || (edge.to === item.node && processed.has(edge.from)))
      )
    );
    setStepDescription([
      `Step ${stepCount + 1}: Priority Queue (${heap.getHeap().length} nodes)`,
      `Nodes: ${heap.getHeap().map((item) => `${item.node}(${item.distance})`).join(', ')}`,
      `Extracting node with minimum distance`,
      `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
    ]);
    await delay(speed / 2);

    const result = heap.extractMin();
    if (!result) {
      setStepDescription([
        `Error: Priority Queue empty`,
        `Graph may be disconnected`,
        `Processed nodes: ${[...processed].join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentNode(null);
      setComparisonEdges([]);
      setPriorityQueue([]);
      setHeapHighlightIndices([]);
      clearInterval(intervalRef.current);
      return;
    }

    const { min } = result;
    const { node: minNode, distance, parent } = min;
    setPriorityQueue(heap.getHeap());
    setHeapOperation('extract');
    setHeapHighlightIndices(result.swapPath);
    setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
    await delay(speed / 2);
    setHeapOperation(null);
    setHeapHighlightIndices([]);

    setCurrentNode(minNode);
    setStepDescription([
      `Step ${stepCount + 1}: Extracted node ${minNode} (distance: ${distance})`,
      `Checking neighbors for distance updates`,
      `Priority Queue: ${heap.getHeap().map((item) => `${item.node}(${item.distance})`).join(', ')}`,
      `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount((prev) => prev + 1);
    await delay(speed / 2);

    if (!processed.has(minNode)) {
      processed.add(minNode);
      setProcessedNodes([...processed]);
      if (parent) {
        const edge = edges.find(
          (e) => (e.from === minNode && e.to === parent) || (e.to === minNode && e.from === parent)
        );
        if (edge) setShortestPathEdges((prev) => [...prev, edge]);
      }

      const neighbors = edges.filter(
        (edge) => (edge.from === minNode && !processed.has(edge.to)) || (edge.to === minNode && !processed.has(edge.from))
      );
      neighbors.forEach((edge) => {
        const neighbor = edge.from === minNode ? edge.to : edge.from;
        const newDistance = distances[minNode] + edge.weight;
        setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        if (newDistance < distances[neighbor]) {
          distances[neighbor] = newDistance;
          predecessors[neighbor] = minNode;
          const swapPath = heap.insert({ node: neighbor, distance: newDistance, parent: minNode });
          setHeapHighlightIndices(swapPath);
          setOperationCount((prev) => ({ ...prev, heapOps: prev.heapOps + 1 }));
          setDistances({ ...distances });
          setStepDescription([
            `Updated distance[${neighbor}] = ${newDistance} via ${minNode}`,
            `Added ${neighbor} to Priority Queue`,
            `Priority Queue: ${heap.getHeap().map((item) => `${item.node}(${item.distance})`).join(', ')}`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.heapOps + 1} heap ops`,
            `Time: O(E log V), Space: O(V + E)`,
          ]);
        }
      });
      setPriorityQueue(heap.getHeap());
      setHeapOperation('insert');
      await delay(speed / 2);
      setHeapOperation(null);
      setHeapHighlightIndices([]);
    }

    setCurrentNode(null);
    setComparisonEdges([]);

    if (processed.size === graph.nodes.length) {
      setStepDescription([
        `Shortest Paths completed!`,
        `Total edges in shortest path tree: ${shortestPathEdges.length}`,
        `Distances: ${Object.entries(distances)
          .map(([node, dist]) => `${node}: ${dist}`)
          .join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
        `Time: O(E log V), Space: O(V + E)`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentNode(null);
      setComparisonEdges([]);
      setPriorityQueue([]);
      clearInterval(intervalRef.current);
    }

    stateRef.current = { processed, heap, predecessors, distances };
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Dijkstra's Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}-${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(E log V), Space: O(V + E)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, heapOps: 0 });
    setShortestPathEdges([]);
    setProcessedNodes([]);
    setCurrentNode(null);
    setComparisonEdges([]);
    setPriorityQueue([]);
    setDistances({});
    stateRef.current = {
      processed: new Set(),
      heap: new MinHeap(),
      predecessors: {},
      distances: {},
    };
    intervalRef.current = setInterval(runDijkstraStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runDijkstraStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Dijkstra's Algorithm`,
        `Processed nodes: ${[...stateRef.current.processed].join(', ')}`,
        `Current distances: ${Object.entries(distances)
          .map(([node, dist]) => `${node}: ${dist}`)
          .join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.heapOps} heap ops`,
      ]);
      intervalRef.current = setInterval(runDijkstraStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Processed nodes: ${[...stateRef.current.processed].join(', ')}`,
        `Current distances: ${Object.entries(distances)
          .map(([node, dist]) => `${node}: ${dist}`)
          .join(', ')}`,
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
    setShortestPathEdges([]);
    setProcessedNodes([]);
    setCurrentNode(null);
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
    setDistances({});
    stateRef.current = {
      processed: new Set(),
      heap: new MinHeap(),
      predecessors: {},
      distances: {},
    };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runDijkstraStep, newSpeed);
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
    setShortestPathEdges([]);
    setProcessedNodes([]);
    setCurrentNode(null);
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
    setDistances({});
    stateRef.current = {
      processed: new Set(),
      heap: new MinHeap(),
      predecessors: {},
      distances: {},
    };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

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
      className="dijkstra-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="dijkstra-algorithm-title"
    >
      <section className="dijkstra-header-section" aria-label="Dijkstra's Algorithm Header">
        <h1 id="dijkstra-algorithm-title" className="dijkstra-animation-title">
          Dijkstra's Algorithm
        </h1>
        <p className="dijkstra-animation-subtitle">Find Shortest Paths from a Source Node</p>
      </section>

      <section className="dijkstra-visualization-section" aria-label="Graph and Priority Queue Visualization">
        <div className="dijkstra-graph-info">
          <p>
            Source Node: <span className="dijkstra-target-value">{graph.nodes[0]}</span>
          </p>
          <p>
            Distances:{' '}
            {Object.entries(distances).map(([node, dist]) => (
              <span key={node} className="dijkstra-target-value">
                {node}: {dist === Infinity ? '∞' : dist}
                {node !== Object.keys(distances)[Object.keys(distances).length - 1] ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
        <div className="dijkstra-visualization-container">
          <svg className="dijkstra-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`dijkstra-edge ${
                    shortestPathEdges.includes(edge)
                      ? 'dijkstra-shortest-path-edge'
                      : comparisonEdges.includes(edge)
                      ? 'dijkstra-comparison-edge'
                      : ''
                  }`}
                />
                <text
                  x={(nodePositions[edge.from].x + nodePositions[edge.to].x) / 2}
                  y={(nodePositions[edge.from].y + nodePositions[edge.to].y) / 2 - 10}
                  className="dijkstra-edge-weight"
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
                  className={`dijkstra-node ${
                    processedNodes.includes(node)
                      ? 'dijkstra-processed'
                      : currentNode === node
                      ? 'dijkstra-current'
                      : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="dijkstra-node-label"
                >
                  {node} ({distances[node] === Infinity ? '∞' : distances[node] || '∞'})
                </text>
              </g>
            ))}
          </svg>
          <svg className="dijkstra-heap-container" width="440" height="240">
            <text x="220" y="30" className="dijkstra-heap-title" textAnchor="middle">
              Priority Queue (Min-Heap)
            </text>
            {priorityQueue.map((item, index) => {
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
                      className={`dijkstra-heap-edge ${
                        heapHighlightIndices.includes(index) || heapHighlightIndices.includes(parentIndex)
                          ? 'dijkstra-heap-edge-highlight'
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
                    className={`dijkstra-heap-node ${
                      heapOperation === 'insert' && heapHighlightIndices.includes(index)
                        ? 'dijkstra-heap-node-insert'
                        : heapOperation === 'extract' && heapHighlightIndices.includes(index)
                        ? 'dijkstra-heap-node-extract'
                        : ''
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  <text
                    x={x}
                    y={y + 5}
                    className="dijkstra-heap-node-label"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {`${item.node}(${item.distance})`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <section className="dijkstra-info-section" aria-label="Algorithm Information">
        <div className="dijkstra-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'dijkstra-primary' : 'dijkstra-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="dijkstra-complexity-visuals">
          <div className="dijkstra-complexity-card">
            <h3>Time Complexity: O(E log V)</h3>
            <div
              className="dijkstra-operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.heapOps) * 10, 200)}px` }}
            />
            <p>
              {operationCount.comparisons} comparisons, {operationCount.heapOps} heap ops
            </p>
          </div>
          <div className="dijkstra-complexity-card">
            <h3>Space Complexity: O(V + E)</h3>
            <div className="dijkstra-memory-bar" style={{ width: `100px` }} />
            <p>
              {graph.nodes.length} nodes, {graph.edges.length} edges
            </p>
          </div>
        </div>
      </section>

      <section className="dijkstra-controls-section" aria-label="Animation Controls">
        <div className="dijkstra-animation-controls">
          <button
            className="dijkstra-control-button dijkstra-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start Dijkstra's Algorithm"
          >
            <PlayIcon className="dijkstra-control-icon" />
            Start
          </button>
          <button
            className="dijkstra-control-button dijkstra-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="dijkstra-control-icon" />
            ) : (
              <PauseIcon className="dijkstra-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="dijkstra-control-button dijkstra-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="dijkstra-control-icon" />
            Step
          </button>
          <button
            className="dijkstra-control-button dijkstra-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="dijkstra-control-icon" />
            Reset
          </button>
          <div className="dijkstra-speed-control">
            <label htmlFor="dijkstra-speed-select" className="dijkstra-control-label">
              Speed:
            </label>
            <select
              id="dijkstra-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="dijkstra-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="dijkstra-case-control">
            <label htmlFor="dijkstra-case-select" className="dijkstra-control-label">
              Case:
            </label>
            <select
              id="dijkstra-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="dijkstra-control-dropdown"
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

export default Dijkstra;