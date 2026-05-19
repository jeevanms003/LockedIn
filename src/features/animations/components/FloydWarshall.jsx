import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './FloydWarshall.css';

// Generate a weighted directed graph with 5 nodes
const generateGraph = (caseType = 'average') => {
  const nodes = ['A', 'B', 'C', 'D', 'E'];
  let edges = [
    { from: 'A', to: 'B', weight: 4 },
    { from: 'A', to: 'C', weight: 2 },
    { from: 'B', to: 'D', weight: 5 },
    { from: 'C', to: 'B', weight: 1 },
    { from: 'C', to: 'D', weight: 8 },
    { from: 'D', to: 'E', weight: 2 },
    { from: 'E', to: 'A', weight: 3 },
  ];

  if (caseType === 'best') {
    edges = edges.map((edge) => ({
      ...edge,
      weight: Math.max(1, Math.floor(edge.weight * 0.5)),
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

const FloydWarshall = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [distMatrix, setDistMatrix] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  const [highlightedEdges, setHighlightedEdges] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Floyd-Warshall Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, assignments: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    k: 0,
    i: 0,
    j: 0,
    dist: [],
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runFloydWarshallStep = async () => {
    let { k, i, j, dist } = stateRef.current;
    const { nodes, edges } = graph;

    if (k === 0 && i === 0 && j === 0) {
      // Initialize distance matrix
      dist = Array(nodes.length)
        .fill()
        .map(() => Array(nodes.length).fill(Infinity));
      for (let idx = 0; idx < nodes.length; idx++) {
        dist[idx][idx] = 0;
      }
      edges.forEach(({ from, to, weight }) => {
        const u = nodes.indexOf(from);
        const v = nodes.indexOf(to);
        dist[u][v] = weight;
      });
      setDistMatrix(dist);
      setStepDescription([
        `Step ${stepCount + 1}: Initialize distance matrix`,
        `Self-loops: 0, Edges: ${edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setStepCount((prev) => prev + 1);
      setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + nodes.length + edges.length }));
      await delay(speed / 2);
    }

    if (k < nodes.length) {
      setCurrentNode(nodes[k]);
      if (i < nodes.length && j < nodes.length) {
        setCurrentCell({ i, j });
        const newDist = dist[i][k] + dist[k][j];
        setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        if (newDist < dist[i][j]) {
          dist[i][j] = newDist;
          setDistMatrix([...dist]);
          setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + 1 }));
          setHighlightedEdges(
            edges.filter(
              (edge) =>
                (edge.from === nodes[i] && edge.to === nodes[k]) ||
                (edge.from === nodes[k] && edge.to === nodes[j])
            )
          );
          setStepDescription([
            `Step ${stepCount + 1}: Update DP[${nodes[i]}][${nodes[j]}] via ${nodes[k]}`,
            `New distance: ${dist[i][k]} + ${dist[k][j]} = ${newDist}`,
            `Old distance: ${dist[i][j] === Infinity ? '∞' : dist[i][j]}`,
            `DP[${nodes[i]}][${nodes[j]}] = ${newDist}`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments + 1} assignments`,
          ]);
        } else {
          setHighlightedEdges([]);
          setStepDescription([
            `Step ${stepCount + 1}: Check DP[${nodes[i]}][${nodes[j]}] via ${nodes[k]}`,
            `New distance: ${dist[i][k]} + ${dist[k][j]} = ${newDist === Infinity ? '∞' : newDist}`,
            `Old distance: ${dist[i][j] === Infinity ? '∞' : dist[i][j]}`,
            `No update needed`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments} assignments`,
          ]);
        }
        setStepCount((prev) => prev + 1);
        await delay(speed);

        // Move to next cell
        j++;
        if (j >= nodes.length) {
          j = 0;
          i++;
          if (i >= nodes.length) {
            i = 0;
            k++;
          }
        }
        stateRef.current = { k, i, j, dist };
      } else {
        // Move to next intermediate node
        i = 0;
        j = 0;
        k++;
        stateRef.current = { k, i, j, dist };
        if (k < nodes.length) {
          setStepDescription([
            `Step ${stepCount + 1}: Using node ${nodes[k]} as intermediate`,
            `Checking all pairs for updates`,
            `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed / 2);
        }
      }
    } else {
      // Algorithm completed
      setStepDescription([
        `Floyd-Warshall Algorithm completed!`,
        `Shortest paths computed for all pairs`,
        `Distance matrix: ${nodes.map((n, idx) => `${n}: ${dist[idx].map((d) => (d === Infinity ? '∞' : d)).join(', ')}`).join('; ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
        `Time: O(V³), Space: O(V²)`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentCell(null);
      setCurrentNode(null);
      setHighlightedEdges([]);
      clearInterval(intervalRef.current);
      stateRef.current = { k: 0, i: 0, j: 0, dist: [] };
    }
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Floyd-Warshall Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V³), Space: O(V²)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    setDistMatrix([]);
    setCurrentCell(null);
    setCurrentNode(null);
    setHighlightedEdges([]);
    stateRef.current = { k: 0, i: 0, j: 0, dist: [] };
    intervalRef.current = setInterval(runFloydWarshallStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runFloydWarshallStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Floyd-Warshall Algorithm`,
        `Current intermediate node: ${graph.nodes[stateRef.current.k] || 'None'}`,
        `Current cell: DP[${graph.nodes[stateRef.current.i]}][${graph.nodes[stateRef.current.j]}]`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      intervalRef.current = setInterval(runFloydWarshallStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Current intermediate node: ${graph.nodes[stateRef.current.k] || 'None'}`,
        `Current cell: DP[${graph.nodes[stateRef.current.i]}][${graph.nodes[stateRef.current.j]}]`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(caseType);
    setGraph(newGraph);
    setIsRunning(false);
    setIsPaused(false);
    setDistMatrix([]);
    setCurrentCell(null);
    setCurrentNode(null);
    setHighlightedEdges([]);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V³), Space: O(V²)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { k: 0, i: 0, j: 0, dist: [] };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runFloydWarshallStep, newSpeed);
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
    setDistMatrix([]);
    setCurrentCell(null);
    setCurrentNode(null);
    setHighlightedEdges([]);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V³), Space: O(V²)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { k: 0, i: 0, j: 0, dist: [] };
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
      className="floydwarshall-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="floydwarshall-algorithm-title"
    >
      <section className="floydwarshall-header-section" aria-label="Floyd-Warshall Algorithm Header">
        <h1 id="floydwarshall-algorithm-title" className="floydwarshall-animation-title">
          Floyd-Warshall Algorithm
        </h1>
        <p className="floydwarshall-animation-subtitle">All-Pairs Shortest Paths</p>
      </section>

      <section className="floydwarshall-visualization-section" aria-label="Graph and Distance Matrix Visualization">
        <div className="floydwarshall-matrix-info">
          <p>
            Current Intermediate Node:{' '}
            <span className="floydwarshall-target-value">{currentNode || 'None'}</span>
          </p>
        </div>
        <div className="floydwarshall-visualization-container">
          <svg className="floydwarshall-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`floydwarshall-edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`floydwarshall-edge ${
                    highlightedEdges.includes(edge) ? 'floydwarshall-edge-highlighted' : ''
                  }`}
                />
                <text
                  x={(nodePositions[edge.from].x + nodePositions[edge.to].x) / 2}
                  y={(nodePositions[edge.from].y + nodePositions[edge.to].y) / 2 - 10}
                  className="floydwarshall-edge-weight"
                >
                  {edge.weight}
                </text>
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`floydwarshall-node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`floydwarshall-node ${
                    currentNode === node ? 'floydwarshall-node-current' : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="floydwarshall-node-label"
                >
                  {node}
                </text>
              </g>
            ))}
          </svg>
          <div className="floydwarshall-table-container">
            <table className="floydwarshall-dist-table">
              <thead>
                <tr>
                  <th></th>
                  {graph.nodes.map((node) => (
                    <th key={`floydwarshall-th-${node}`}>{node}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {distMatrix.map((row, i) => (
                  <tr key={`floydwarshall-row-${i}`}>
                    <td>{graph.nodes[i]}</td>
                    {row.map((value, j) => (
                      <td
                        key={`floydwarshall-cell-${i}-${j}`}
                        className={`floydwarshall-cell ${
                          currentCell && currentCell.i === i && currentCell.j === j
                            ? 'floydwarshall-cell-current'
                            : ''
                        }`}
                      >
                        {value === Infinity ? '∞' : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="floydwarshall-info-section" aria-label="Algorithm Information">
        <div className="floydwarshall-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'floydwarshall-primary' : 'floydwarshall-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="floydwarshall-complexity-visuals">
          <div className="floydwarshall-complexity-card">
            <h3>Time Complexity: O(V³)</h3>
            <div
              className="floydwarshall-operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.assignments) * 5, 200)}px` }}
            />
            <p>
              {operationCount.comparisons} comparisons, {operationCount.assignments} assignments
            </p>
          </div>
          <div className="floydwarshall-complexity-card">
            <h3>Space Complexity: O(V²)</h3>
            <div
              className="floydwarshall-memory-bar"
              style={{ width: `${(graph.nodes.length * graph.nodes.length) / 10}px` }}
            />
            <p>{graph.nodes.length} x {graph.nodes.length} matrix</p>
          </div>
        </div>
      </section>

      <section className="floydwarshall-controls-section" aria-label="Animation Controls">
        <div className="floydwarshall-animation-controls">
          <button
            className="floydwarshall-control-button floydwarshall-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start Floyd-Warshall Algorithm"
          >
            <PlayIcon className="floydwarshall-control-icon" />
            Start
          </button>
          <button
            className="floydwarshall-control-button floydwarshall-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="floydwarshall-control-icon" />
            ) : (
              <PauseIcon className="floydwarshall-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="floydwarshall-control-button floydwarshall-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="floydwarshall-control-icon" />
            Step
          </button>
          <button
            className="floydwarshall-control-button floydwarshall-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="floydwarshall-control-icon" />
            Reset
          </button>
          <div className="floydwarshall-speed-control">
            <label htmlFor="floydwarshall-speed-select" className="floydwarshall-control-label">
              Speed:
            </label>
            <select
              id="floydwarshall-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="floydwarshall-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="floydwarshall-case-control">
            <label htmlFor="floydwarshall-case-select" className="floydwarshall-control-label">
              Case:
            </label>
            <select
              id="floydwarshall-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="floydwarshall-control-dropdown"
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

export default FloydWarshall;