import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './BFS.css';

// Generate a graph with 6 nodes (mix of connected and disconnected components)
const generateGraph = (caseType = 'average') => {
  const nodes = ['A', 'B', 'C', 'D', 'E', 'F'];
  let edges = [
    { from: 'A', to: 'B' },
    { from: 'A', to: 'C' },
    { from: 'B', to: 'D' },
    { from: 'C', to: 'E' },
    { from: 'D', to: 'E' },
    // Node F is disconnected in average case
  ];

  if (caseType === 'best') {
    // Sparse graph (fewer edges)
    edges = [
      { from: 'A', to: 'B' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'D' },
      // F remains disconnected
    ];
  } else if (caseType === 'worst') {
    // Dense graph (more edges)
    edges = [
      { from: 'A', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'A', to: 'D' },
      { from: 'B', to: 'C' },
      { from: 'B', to: 'D' },
      { from: 'B', to: 'E' },
      { from: 'C', to: 'E' },
      { from: 'D', to: 'E' },
      { from: 'E', to: 'F' }, // Connect F
    ];
  }

  // Make undirected by adding reverse edges
  const undirectedEdges = [
    ...edges,
    ...edges.map((e) => ({ from: e.to, to: e.from })),
  ].sort((a, b) => `${a.from}-${a.to}`.localeCompare(`${b.from}-${b.to}`));

  return { nodes, edges: undirectedEdges, source: 'A' };
};

const BFS = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [visited, setVisited] = useState(new Set());
  const [queue, setQueue] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin BFS']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ visits: 0, enqueues: 0, dequeues: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    queue: [],
    visited: new Set(),
    currentNode: null,
    edgeIndex: 0,
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runBFSStep = async () => {
    let { queue, visited, currentNode, edgeIndex } = stateRef.current;
    const { nodes, edges, source } = graph;

    if (queue.length === 0 && !visited.has(source)) {
      // Initialize BFS
      queue = [source];
      visited.add(source);
      setQueue([source]);
      setVisited(new Set([source]));
      setCurrentNode(source);
      setOperationCount((prev) => ({
        ...prev,
        enqueues: prev.enqueues + 1,
        visits: prev.visits + 1,
      }));
      setStepDescription([
        `Step ${stepCount + 1}: Start BFS from source ${source}`,
        `Enqueue ${source} and mark as visited`,
        `Queue: [${source}]`,
        `Visited: ${source}`,
        `Operations: ${operationCount.visits + 1} visits, ${operationCount.enqueues + 1} enqueues, ${operationCount.dequeues} dequeues`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 2);
      stateRef.current = { queue, visited, currentNode: source, edgeIndex: 0 };
    } else if (queue.length > 0) {
      if (!currentNode) {
        // Dequeue a node
        currentNode = queue.shift();
        setQueue([...queue]);
        setCurrentNode(currentNode);
        setOperationCount((prev) => ({
          ...prev,
          dequeues: prev.dequeues + 1,
        }));
        setStepDescription([
          `Step ${stepCount + 1}: Dequeue node ${currentNode}`,
          `Queue: [${queue.join(', ')}]`,
          `Visited: ${[...visited].join(', ')}`,
          `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues + 1} dequeues`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);
        stateRef.current = { queue, visited, currentNode, edgeIndex: 0 };
      } else {
        // Explore neighbors
        const neighbors = edges
          .filter((e) => e.from === currentNode && !visited.has(e.to))
          .map((e) => e.to);
        if (edgeIndex < neighbors.length) {
          const neighbor = neighbors[edgeIndex];
          const edge = edges.find(
            (e) => e.from === currentNode && e.to === neighbor
          );
          setCurrentEdge(edge);
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
            setVisited(new Set(visited));
            setQueue([...queue]);
            setOperationCount((prev) => ({
              ...prev,
              visits: prev.visits + 1,
              enqueues: prev.enqueues + 1,
            }));
            setStepDescription([
              `Step ${stepCount + 1}: Explore edge ${currentNode}->${neighbor}`,
              `Enqueue ${neighbor} and mark as visited`,
              `Queue: [${[...queue, neighbor].join(', ')}]`,
              `Visited: ${[...visited].join(', ')}`,
              `Operations: ${operationCount.visits + 1} visits, ${operationCount.enqueues + 1} enqueues, ${operationCount.dequeues} dequeues`,
            ]);
          } else {
            setStepDescription([
              `Step ${stepCount + 1}: Check edge ${currentNode}->${neighbor}`,
              `Node ${neighbor} already visited, no enqueue`,
              `Queue: [${queue.join(', ')}]`,
              `Visited: ${[...visited].join(', ')}`,
              `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues} dequeues`,
            ]);
          }
          setStepCount((prev) => prev + 1);
          await delay(speed);
          edgeIndex++;
          stateRef.current = { queue, visited, currentNode, edgeIndex };
        } else {
          // Done with current node
          setCurrentNode(null);
          setCurrentEdge(null);
          setStepDescription([
            `Step ${stepCount + 1}: Finished exploring ${currentNode}`,
            `Queue: [${queue.join(', ')}]`,
            `Visited: ${[...visited].join(', ')}`,
            `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues} dequeues`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed / 2);
          stateRef.current = { queue, visited, currentNode: null, edgeIndex: 0 };
        }
      }
    } else {
      // Check for unvisited nodes (disconnected components)
      const unvisitedNode = nodes.find((node) => !visited.has(node));
      if (unvisitedNode) {
        queue = [unvisitedNode];
        visited.add(unvisitedNode);
        setQueue([unvisitedNode]);
        setVisited(new Set(visited));
        setCurrentNode(unvisitedNode);
        setOperationCount((prev) => ({
          ...prev,
          enqueues: prev.enqueues + 1,
          visits: prev.visits + 1,
        }));
        setStepDescription([
          `Step ${stepCount + 1}: Start BFS on unvisited node ${unvisitedNode}`,
          `Enqueue ${unvisitedNode} and mark as visited`,
          `Queue: [${unvisitedNode}]`,
          `Visited: ${[...visited].join(', ')}`,
          `Operations: ${operationCount.visits + 1} visits, ${operationCount.enqueues + 1} enqueues, ${operationCount.dequeues} dequeues`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);
        stateRef.current = { queue, visited, currentNode: unvisitedNode, edgeIndex: 0 };
      } else {
        // BFS completed
        setStepDescription([
          `BFS completed!`,
          `Visited all reachable nodes: ${[...visited].join(', ')}`,
          `Final Queue: []`,
          `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues} dequeues`,
          `Time: O(V + E), Space: O(V)`,
        ]);
        setIsRunning(false);
        setIsPaused(false);
        setCurrentNode(null);
        setCurrentEdge(null);
        setQueue([]);
        clearInterval(intervalRef.current);
        stateRef.current = { queue: [], visited: new Set(visited), currentNode: null, edgeIndex: 0 };
      }
    }
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting BFS (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Source: ${graph.source}, Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, enqueues: 0, dequeues: 0 });
    setVisited(new Set());
    setQueue([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    stateRef.current = { queue: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
    intervalRef.current = setInterval(runBFSStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runBFSStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming BFS`,
        `Current node: ${stateRef.current.currentNode || 'None'}`,
        `Queue: [${stateRef.current.queue.join(', ')}]`,
        `Visited: ${[...stateRef.current.visited].join(', ')}`,
        `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues} dequeues`,
      ]);
      intervalRef.current = setInterval(runBFSStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Current node: ${stateRef.current.currentNode || 'None'}`,
        `Queue: [${stateRef.current.queue.join(', ')}]`,
        `Visited: ${[...stateRef.current.visited].join(', ')}`,
        `Operations: ${operationCount.visits} visits, ${operationCount.enqueues} enqueues, ${operationCount.dequeues} dequeues`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(caseType);
    setGraph(newGraph);
    setIsRunning(false);
    setIsPaused(false);
    setVisited(new Set());
    setQueue([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, enqueues: 0, dequeues: 0 });
    stateRef.current = { queue: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runBFSStep, newSpeed);
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
    setVisited(new Set());
    setQueue([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, enqueues: 0, dequeues: 0 });
    stateRef.current = { queue: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
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

  return (
    <motion.div
      className="bfs-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="bfs-algorithm-title"
    >
      <section className="bfs-header-section" aria-label="BFS Algorithm Header">
        <h1 id="bfs-algorithm-title" className="bfs-animation-title">
          Breadth-First Search (BFS)
        </h1>
        <p className="bfs-animation-subtitle">Graph Traversal with Queue</p>
      </section>

      <section className="bfs-visualization-section" aria-label="Graph and Queue Visualization">
        <div className="bfs-info">
          <p>
            Source Node:{' '}
            <span className="bfs-target-value">{graph.source}</span>
          </p>
          <p>
            Current Node:{' '}
            <span className="bfs-target-value">{currentNode || 'None'}</span>
          </p>
        </div>
        <div className="bfs-visualization-container">
          <svg className="bfs-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`bfs-edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`bfs-edge ${
                    currentEdge && edge.from === currentEdge.from && edge.to === currentEdge.to
                      ? 'bfs-edge-highlighted'
                      : ''
                  }`}
                />
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`bfs-node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`bfs-node ${
                    node === graph.source
                      ? 'bfs-node-source'
                      : visited.has(node)
                      ? 'bfs-node-visited'
                      : currentNode === node
                      ? 'bfs-node-current'
                      : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="bfs-node-label"
                >
                  {node}
                </text>
              </g>
            ))}
          </svg>
          <div className="bfs-queue-container">
            <h3>BFS Queue</h3>
            <div className="bfs-queue-list">
              {queue.map((node, idx) => (
                <motion.div
                  key={`bfs-queue-${node}-${idx}`}
                  className="bfs-queue-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{node}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bfs-info-section" aria-label="Algorithm Information">
        <div className="bfs-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'bfs-primary' : 'bfs-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="bfs-complexity-visuals">
          <div className="bfs-complexity-card">
            <h3>Time Complexity: O(V + E)</h3>
            <div
              className="bfs-operation-bar"
              style={{ width: `${Math.min((operationCount.visits + operationCount.enqueues + operationCount.dequeues) * 5, 200)}px` }}
            />
            <p>
              {operationCount.visits} visits, {operationCount.enqueues} enqueues, {operationCount.dequeues} dequeues
            </p>
          </div>
          <div className="bfs-complexity-card">
            <h3>Space Complexity: O(V)</h3>
            <div
              className="bfs-memory-bar"
              style={{ width: `${graph.nodes.length * 10}px` }}
            />
            <p>{graph.nodes.length} nodes in queue/visited set</p>
          </div>
        </div>
      </section>

      <section className="bfs-controls-section" aria-label="Animation Controls">
        <div className="bfs-animation-controls">
          <button
            className="bfs-control-button bfs-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start BFS Algorithm"
          >
            <PlayIcon className="bfs-control-icon" />
            Start
          </button>
          <button
            className="bfs-control-button bfs-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="bfs-control-icon" />
            ) : (
              <PauseIcon className="bfs-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="bfs-control-button bfs-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="bfs-control-icon" />
            Step
          </button>
          <button
            className="bfs-control-button bfs-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="bfs-control-icon" />
            Reset
          </button>
          <div className="bfs-speed-control">
            <label htmlFor="bfs-speed-select" className="bfs-control-label">
              Speed:
            </label>
            <select
              id="bfs-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="bfs-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="bfs-case-control">
            <label htmlFor="bfs-case-select" className="bfs-control-label">
              Case:
            </label>
            <select
              id="bfs-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="bfs-control-dropdown"
              aria-label="Select Case Type"
            >
              <option value="best">Best Case (Sparse)</option>
              <option value="worst">Worst Case (Dense)</option>
              <option value="average">Average Case</option>
            </select>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default BFS;