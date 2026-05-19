import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './BellmanFord.css';

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

  return { nodes, edges, source: 'A' };
};

const BellmanFord = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [isRunning, setIsRunning] = useState(false);
  const [distances, setDistances] = useState({});
  const [currentEdge, setCurrentEdge] = useState(null);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Bellman-Ford Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, assignments: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    iteration: 0,
    edgeIndex: 0,
    dist: {},
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runBellmanFordStep = async () => {
    let { iteration, edgeIndex, dist } = stateRef.current;
    const { nodes, edges, source } = graph;

    if (iteration === 0 && edgeIndex === 0) {
      // Initialize distances
      dist = nodes.reduce((acc, node) => ({ ...acc, [node]: node === source ? 0 : Infinity }), {});
      setDistances(dist);
      setStepDescription([
        `Step ${stepCount + 1}: Initialize distances`,
        `Source: ${source}, Distances: ${nodes.map((n) => `${n}=${dist[n] === Infinity ? '∞' : dist[n]}`).join(', ')}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setStepCount((prev) => prev + 1);
      setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + nodes.length }));
      await delay(speed / 2);
    }

    if (iteration < nodes.length - 1) {
      if (edgeIndex < edges.length) {
        const edge = edges[edgeIndex];
        setCurrentEdge(edge);
        const u = edge.from;
        const v = edge.to;
        const newDist = dist[u] + edge.weight;
        setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        if (dist[u] !== Infinity && newDist < dist[v]) {
          dist[v] = newDist;
          setDistances({ ...dist });
          setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + 1 }));
          setStepDescription([
            `Step ${stepCount + 1}: Relax edge ${u}->${v} (weight=${edge.weight})`,
            `Distance[${u}]=${dist[u] === Infinity ? '∞' : dist[u]}`,
            `New distance[${v}]: ${dist[u]} + ${edge.weight} = ${newDist}`,
            `Old distance[${v}]: ${dist[v] === Infinity ? '∞' : dist[v]}`,
            `Update distance[${v}] = ${newDist}`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments + 1} assignments`,
          ]);
        } else {
          setStepDescription([
            `Step ${stepCount + 1}: Check edge ${u}->${v} (weight=${edge.weight})`,
            `Distance[${u}]=${dist[u] === Infinity ? '∞' : dist[u]}`,
            `New distance[${v}]: ${dist[u] === Infinity ? '∞' : newDist}`,
            `Old distance[${v}]: ${dist[v] === Infinity ? '∞' : dist[v]}`,
            `No update needed`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments} assignments`,
          ]);
        }
        setStepCount((prev) => prev + 1);
        await delay(speed);

        // Move to next edge
        edgeIndex++;
        stateRef.current = { iteration, edgeIndex, dist };
      } else {
        // Move to next iteration
        edgeIndex = 0;
        iteration++;
        setCurrentIteration(iteration);
        setCurrentEdge(null);
        setStepDescription([
          `Step ${stepCount + 1}: Start iteration ${iteration + 1}`,
          `Distances: ${nodes.map((n) => `${n}=${dist[n] === Infinity ? '∞' : dist[n]}`).join(', ')}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);
        stateRef.current = { iteration, edgeIndex, dist };
      }
    } else {
      // Check for negative cycles
      let negativeCycle = false;
      for (const edge of edges) {
        setCurrentEdge(edge);
        const u = edge.from;
        const v = edge.to;
        const newDist = dist[u] + edge.weight;
        setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        if (dist[u] !== Infinity && newDist < dist[v]) {
          negativeCycle = true;
          setStepDescription([
            `Step ${stepCount + 1}: Negative cycle detected!`,
            `Edge ${u}->${v} (weight=${edge.weight})`,
            `Distance[${u}]=${dist[u] === Infinity ? '∞' : dist[u]}`,
            `New distance[${v}]: ${newDist} < ${dist[v] === Infinity ? '∞' : dist[v]}`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments} assignments`,
          ]);
          setStepCount((prev) => prev + 1);
          await delay(speed);
          break;
        }
      }

      if (!negativeCycle) {
        setStepDescription([
          `Bellman-Ford Algorithm completed!`,
          `Shortest distances from ${source}: ${nodes.map((n) => `${n}=${dist[n] === Infinity ? '∞' : dist[n]}`).join(', ')}`,
          `No negative cycles detected`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
          `Time: O(V*E), Space: O(V)`,
        ]);
      }
      setIsRunning(false);
      setIsPaused(false);
      setCurrentEdge(null);
      setCurrentIteration(0);
      clearInterval(intervalRef.current);
      stateRef.current = { iteration: 0, edgeIndex: 0, dist: {} };
    }
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Bellman-Ford Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Source: ${graph.source}, Nodes: ${graph.nodes.join(', ')}`,
      `Edges: ${graph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V*E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    setDistances({});
    setCurrentEdge(null);
    setCurrentIteration(0);
    stateRef.current = { iteration: 0, edgeIndex: 0, dist: {} };
    intervalRef.current = setInterval(runBellmanFordStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runBellmanFordStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Bellman-Ford Algorithm`,
        `Iteration: ${stateRef.current.iteration + 1}`,
        `Current edge: ${stateRef.current.edgeIndex < graph.edges.length ? `${graph.edges[stateRef.current.edgeIndex].from}->${graph.edges[stateRef.current.edgeIndex].to}` : 'None'}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      intervalRef.current = setInterval(runBellmanFordStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Iteration: ${stateRef.current.iteration + 1}`,
        `Current edge: ${stateRef.current.edgeIndex < graph.edges.length ? `${graph.edges[stateRef.current.edgeIndex].from}->${graph.edges[stateRef.current.edgeIndex].to}` : 'None'}`,
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
    setDistances({});
    setCurrentEdge(null);
    setCurrentIteration(0);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V*E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { iteration: 0, edgeIndex: 0, dist: {} };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runBellmanFordStep, newSpeed);
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
    setDistances({});
    setCurrentEdge(null);
    setCurrentIteration(0);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New source: ${newGraph.source}, New nodes: ${newGraph.nodes.join(', ')}`,
      `New edges: ${newGraph.edges.map((e) => `${e.from}->${e.to}(${e.weight})`).join(', ')}`,
      `Time: O(V*E), Space: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { iteration: 0, edgeIndex: 0, dist: {} };
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
      className="bellmanford-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="bellmanford-algorithm-title"
    >
      <section className="bellmanford-header-section" aria-label="Bellman-Ford Algorithm Header">
        <h1 id="bellmanford-algorithm-title" className="bellmanford-animation-title">
          Bellman-Ford Algorithm
        </h1>
        <p className="bellmanford-animation-subtitle">Single-Source Shortest Paths with Negative Weights</p>
      </section>

      <section className="bellmanford-visualization-section" aria-label="Graph and Distances Visualization">
        <div className="bellmanford-info">
          <p>
            Source Node:{' '}
            <span className="bellmanford-target-value">{graph.source}</span>
          </p>
          <p>
            Iteration:{' '}
            <span className="bellmanford-target-value">{currentIteration + 1}/{graph.nodes.length - 1}</span>
          </p>
        </div>
        <div className="bellmanford-visualization-container">
          <svg className="bellmanford-graph-container" width="440" height="440">
            {graph.edges.map((edge, idx) => (
              <g key={`bellmanford-edge-group-${idx}`}>
                <line
                  x1={nodePositions[edge.from].x}
                  y1={nodePositions[edge.from].y}
                  x2={nodePositions[edge.to].x}
                  y2={nodePositions[edge.to].y}
                  className={`bellmanford-edge ${
                    currentEdge && edge.from === currentEdge.from && edge.to === currentEdge.to
                      ? 'bellmanford-edge-highlighted'
                      : ''
                  }`}
                />
                <text
                  x={(nodePositions[edge.from].x + nodePositions[edge.to].x) / 2}
                  y={(nodePositions[edge.from].y + nodePositions[edge.to].y) / 2 - 10}
                  className="bellmanford-edge-weight"
                >
                  {edge.weight}
                </text>
              </g>
            ))}
            {graph.nodes.map((node) => (
              <g key={`bellmanford-node-${node}`}>
                <circle
                  cx={nodePositions[node].x}
                  cy={nodePositions[node].y}
                  r="25"
                  className={`bellmanford-node ${
                    node === graph.source ? 'bellmanford-node-source' : distances[node] !== Infinity ? 'bellmanford-node-reached' : ''
                  }`}
                />
                <text
                  x={nodePositions[node].x}
                  y={nodePositions[node].y + 5}
                  className="bellmanford-node-label"
                >
                  {node} ({distances[node] === Infinity ? '∞' : distances[node]})
                </text>
              </g>
            ))}
          </svg>
          <div className="bellmanford-distances-container">
            <h3>Distances from {graph.source}</h3>
            <div className="bellmanford-distances-list">
              {graph.nodes.map((node) => (
                <motion.div
                  key={`bellmanford-distance-${node}`}
                  className="bellmanford-distance-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <span>{node}: {distances[node] === Infinity ? '∞' : distances[node]}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bellmanford-info-section" aria-label="Algorithm Information">
        <div className="bellmanford-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'bellmanford-primary' : 'bellmanford-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="bellmanford-complexity-visuals">
          <div className="bellmanford-complexity-card">
            <h3>Time Complexity: O(V*E)</h3>
            <div
              className="bellmanford-operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.assignments) * 5, 200)}px` }}
            />
            <p>
              {operationCount.comparisons} comparisons, {operationCount.assignments} assignments
            </p>
          </div>
          <div className="bellmanford-complexity-card">
            <h3>Space Complexity: O(V)</h3>
            <div
              className="bellmanford-memory-bar"
              style={{ width: `${graph.nodes.length * 10}px` }}
            />
            <p>{graph.nodes.length} nodes</p>
          </div>
        </div>
      </section>

      <section className="bellmanford-controls-section" aria-label="Animation Controls">
        <div className="bellmanford-animation-controls">
          <button
            className="bellmanford-control-button bellmanford-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start Bellman-Ford Algorithm"
          >
            <PlayIcon className="bellmanford-control-icon" />
            Start
          </button>
          <button
            className="bellmanford-control-button bellmanford-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="bellmanford-control-icon" />
            ) : (
              <PauseIcon className="bellmanford-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="bellmanford-control-button bellmanford-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="bellmanford-control-icon" />
            Step
          </button>
          <button
            className="bellmanford-control-button bellmanford-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
          >
            <ArrowPathIcon className="bellmanford-control-icon" />
            Reset
          </button>
          <div className="bellmanford-speed-control">
            <label htmlFor="bellmanford-speed-select" className="bellmanford-control-label">
              Speed:
            </label>
            <select
              id="bellmanford-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="bellmanford-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="bellmanford-case-control">
            <label htmlFor="bellmanford-case-select" className="bellmanford-control-label">
              Case:
            </label>
            <select
              id="bellmanford-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="bellmanford-control-dropdown"
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

export default BellmanFord;