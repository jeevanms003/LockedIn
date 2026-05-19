import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './DFS.css';

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

const DFS = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [visited, setVisited] = useState(new Set());
  const [stack, setStack] = useState([]);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin DFS']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ visits: 0, pushes: 0, pops: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    stack: [],
    visited: new Set(),
    currentNode: null,
    edgeIndex: 0,
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runDFSStep = async () => {
    let { stack, visited, currentNode, edgeIndex } = stateRef.current;
    const { nodes, edges, source } = graph;

    if (stack.length === 0 && !visited.has(source)) {
      // Initialize DFS
      stack = [source];
      setStack([source]);
      setStepDescription([
        `Step ${stepCount + 1}: Start DFS from source ${source}`,
        `Push ${source} onto stack`,
        `Stack: [${source}]`,
        `Visited: None`,
        `Operations: ${operationCount.visits} visits, ${operationCount.pushes + 1} pushes, ${operationCount.pops} pops`,
      ]);
      setStepCount((prev) => prev + 1);
      setOperationCount((prev) => ({ ...prev, pushes: prev.pushes + 1 }));
      await delay(speed / 2);
      stateRef.current = { stack, visited, currentNode, edgeIndex };
    }

    if (stack.length > 0) {
      if (!currentNode) {
        // Pop a node from stack
        currentNode = stack.pop();
        if (!visited.has(currentNode)) {
          visited.add(currentNode);
          setVisited(new Set(visited));
          setCurrentNode(currentNode);
          setStack([...stack]);
          setOperationCount((prev) => ({
            ...prev,
            visits: prev.visits + 1,
            pops: prev.pops + 1,
          }));
          setStepDescription([
            `Step ${stepCount + 1}: Pop and visit node ${currentNode}`,
            `Stack: [${stack.join(', ')}]`,
            `Visited: ${[...visited].join(', ')}`,
            `Operations: ${operationCount.visits + 1} visits, ${operationCount.pushes} pushes, ${operationCount.pops + 1} pops`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed);
        }
        stateRef.current = { stack, visited, currentNode, edgeIndex: 0 };
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
          stack.push(neighbor);
          setStack([...stack, neighbor]);
          setOperationCount((prev) => ({ ...prev, pushes: prev.pushes + 1 }));
          setStepDescription([
            `Step ${stepCount + 1}: Explore edge ${currentNode}->${neighbor}`,
            `Push ${neighbor} onto stack`,
            `Stack: [${[...stack, neighbor].join(', ')}]`,
            `Visited: ${[...visited].join(', ')}`,
            `Operations: ${operationCount.visits} visits, ${operationCount.pushes + 1} pushes, ${operationCount.pops} pops`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed);
          edgeIndex++;
          stateRef.current = { stack, visited, currentNode, edgeIndex };
        } else {
          // Done with current node
          setCurrentNode(null);
          setCurrentEdge(null);
          setStepDescription([
            `Step ${stepCount + 1}: Finished exploring ${currentNode}`,
            `Stack: [${stack.join(', ')}]`,
            `Visited: ${[...visited].join(', ')}`,
            `Operations: ${operationCount.visits} visits, ${operationCount.pushes} pushes, ${operationCount.pops} pops`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed / 2);
          stateRef.current = { stack, visited, currentNode: null, edgeIndex: 0 };
        }
      }
    } else {
      // Check for unvisited nodes (disconnected components)
      const unvisitedNode = nodes.find((node) => !visited.has(node));
      if (unvisitedNode) {
        stack = [unvisitedNode];
        setStack([unvisitedNode]);
        setStepDescription([
          `Step ${stepCount + 1}: Start DFS on unvisited node ${unvisitedNode}`,
          `Push ${unvisitedNode} onto stack`,
          `Stack: [${unvisitedNode}]`,
          `Visited: ${[...visited].join(', ')}`,
          `Operations: ${operationCount.visits} visits, ${operationCount.pushes + 1} pushes, ${operationCount.pops} pops`,
        ]);
        setStepCount((prev) => prev + 1);
        setOperationCount((prev) => ({ ...prev, pushes: prev.pushes + 1 }));
        await delay(speed / 2);
        stateRef.current = { stack, visited, currentNode: null, edgeIndex: 0 };
      } else {
        // DFS completed
        setStepDescription([
          `DFS completed!`,
          `Visited all reachable nodes: ${[...visited].join(', ')}`,
          `Final Stack: []`,
          `Operations: ${operationCount.visits} visits, ${operationCount.pushes} pushes, ${operationCount.pops} pops`,
          `Time: O(V + E), Space: O(V)`,
        ]);
        setIsRunning(false);
        setIsPaused(false);
        setCurrentNode(null);
        setCurrentEdge(null);
        setStack([]);
        clearInterval(intervalRef.current);
        stateRef.current = { stack: [], visited: new Set(visited), currentNode: null, edgeIndex: 0 };
      }
    }
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting DFS (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Source: ${graph.source}, Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, pushes: 0, pops: 0 });
    setVisited(new Set());
    setStack([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    stateRef.current = { stack: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
    intervalRef.current = setInterval(runDFSStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runDFSStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming DFS`,
        `Current node: ${stateRef.current.currentNode || 'None'}`,
        `Stack: [${stateRef.current.stack.join(', ')}]`,
        `Visited: ${[...stateRef.current.visited].join(', ')}`,
        `Operations: ${operationCount.visits} visits, ${operationCount.pushes} pushes, ${operationCount.pops} pops`,
      ]);
      intervalRef.current = setInterval(runDFSStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Current node: ${stateRef.current.currentNode || 'None'}`,
        `Stack: [${stateRef.current.stack.join(', ')}]`,
        `Visited: ${[...stateRef.current.visited].join(', ')}`,
        `Operations: ${operationCount.visits} visits, ${operationCount.pushes} pushes, ${operationCount.pops} pops`,
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
    setStack([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, pushes: 0, pops: 0 });
    stateRef.current = { stack: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runDFSStep, newSpeed);
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
    setStack([]);
    setCurrentNode(null);
    setCurrentEdge(null);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}-${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ visits: 0, pushes: 0, pops: 0 });
    stateRef.current = { stack: [], visited: new Set(), currentNode: null, edgeIndex: 0 };
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
      className="dfs-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="dfs-algorithm-title"
    >
      <section className="dfs-header-section" aria-label="DFS Algorithm Header">
        <h1 id="dfs-algorithm-title" className="dfs-animation-title">
          Depth-First Search (DFS)
        </h1>
        <p className="dfs-animation-subtitle">Graph Traversal with Stack</p>
      </section>

      <section className="dfs-visualization-section" aria-label="Graph and Stack Visualization">
        <div className="dfs-info">
          <p>
            Source Node:{' '}
            <span className="dfs-target-value">{graph.source}</span>
          </p>
          <p>
            Current Node:{' '}
            <span className="dfs-target-value">{currentNode || 'None'}</span>
          </p>
        </div>
        <div className="dfs-visualization-container">
          <svg className="dfs-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`dfs-edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`dfs-edge ${
                    currentEdge && edge.from === currentEdge.from && edge.to === currentEdge.to
                      ? 'dfs-edge-highlighted'
                      : ''
                  }`}
                />
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`dfs-node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`dfs-node ${
                    node === graph.source
                      ? 'dfs-node-source'
                      : visited.has(node)
                      ? 'dfs-node-visited'
                      : currentNode === node
                      ? 'dfs-node-current'
                      : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="dfs-node-label"
                >
                  {node}
                </text>
              </g>
            ))}
          </svg>
          <div className="dfs-stack-container">
            <h3>DFS Stack</h3>
            <div className="dfs-stack-list">
              {stack.map((node, idx) => (
                <motion.div
                  key={`dfs-stack-${node}-${idx}`}
                  className="dfs-stack-item"
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

      <section className="dfs-info-section" aria-label="Algorithm Information">
        <div className="dfs-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'dfs-primary' : 'dfs-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="dfs-complexity-visuals">
          <div className="dfs-complexity-card">
            <h3>Time Complexity: O(V + E)</h3>
            <div
              className="dfs-operation-bar"
              style={{ width: `${Math.min((operationCount.visits + operationCount.pushes + operationCount.pops) * 5, 200)}px` }}
            />
            <p>
              {operationCount.visits} visits, {operationCount.pushes} pushes, {operationCount.pops} pops
            </p>
          </div>
          <div className="dfs-complexity-card">
            <h3>Space Complexity: O(V)</h3>
            <div
              className="dfs-memory-bar"
              style={{ width: `${graph.nodes.length * 10}px` }}
            />
            <p>{graph.nodes.length} nodes in stack/visited set</p>
          </div>
        </div>
      </section>

      <section className="dfs-controls-section" aria-label="Animation Controls">
        <div className="dfs-animation-controls">
          <button
            className="dfs-control-button dfs-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start DFS Algorithm"
          >
            <PlayIcon className="dfs-control-icon" />
            Start
          </button>
          <button
            className="dfs-control-button dfs-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="dfs-control-icon" />
            ) : (
              <PauseIcon className="dfs-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="dfs-control-button dfs-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="dfs-control-icon" />
            Step
          </button>
          <button
            className="dfs-control-button dfs-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="dfs-control-icon" />
            Reset
          </button>
          <div className="dfs-speed-control">
            <label htmlFor="dfs-speed-select" className="dfs-control-label">
              Speed:
            </label>
            <select
              id="dfs-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="dfs-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="dfs-case-control">
            <label htmlFor="dfs-case-select" className="dfs-control-label">
              Case:
            </label>
            <select
              id="dfs-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="dfs-control-dropdown"
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

export default DFS;