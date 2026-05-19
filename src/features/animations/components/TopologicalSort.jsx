import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './TopologicalSort.css';

// Sample DAG (Directed Acyclic Graph)
const initialGraph = {
  nodes: ['A', 'B', 'C', 'D', 'E'],
  edges: [
    { from: 'A', to: 'C', id: 'A-C' },
    { from: 'A', to: 'B', id: 'A-B' },
    { from: 'B', to: 'D', id: 'B-D' },
    { from: 'C', to: 'D', id: 'C-D' },
    { from: 'D', to: 'E', id: 'D-E' },
  ],
  positions: {
    A: { x: 100, y: 100 },
    B: { x: 100, y: 200 },
    C: { x: 200, y: 100 },
    D: { x: 200, y: 200 },
    E: { x: 300, y: 200 },
  },
};

const TopologicalSort = () => {
  const [graph, setGraph] = useState(initialGraph);
  const [inDegrees, setInDegrees] = useState({});
  const [queue, setQueue] = useState([]);
  const [sortedList, setSortedList] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [currentEdges, setCurrentEdges] = useState([]);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Topological Sort']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ nodesProcessed: 0, edgesRemoved: 0 });
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef(null);

  // Initialize in-degrees
  const initializeInDegrees = () => {
    const inDeg = {};
    graph.nodes.forEach((node) => {
      inDeg[node] = 0;
    });
    graph.edges.forEach((edge) => {
      inDeg[edge.to] = (inDeg[edge.to] || 0) + 1;
    });
    return inDeg;
  };

  // Kahn's Algorithm for Topological Sort
  const topologicalSort = () => {
    const steps = [];
    const tempInDegrees = { ...inDegrees };
    const tempQueue = Object.keys(tempInDegrees).filter((node) => tempInDegrees[node] === 0);
    const tempSorted = [];
    const tempEdges = [...graph.edges];
    let nodesProcessed = 0;
    let edgesRemoved = 0;

    while (tempQueue.length > 0) {
      const node = tempQueue.shift();
      tempSorted.push(node);
      nodesProcessed += 1;
      steps.push({
        type: 'process',
        node,
        inDegrees: { ...tempInDegrees },
        queue: [...tempQueue],
        sorted: [...tempSorted],
        edges: [...tempEdges],
        nodesProcessed,
        edgesRemoved,
      });

      const outgoingEdges = tempEdges.filter((edge) => edge.from === node);
      outgoingEdges.forEach((edge) => {
        tempInDegrees[edge.to] -= 1;
        edgesRemoved += 1;
        steps.push({
          type: 'edge',
          node,
          edge,
          inDegrees: { ...tempInDegrees },
          queue: [...tempQueue],
          sorted: [...tempSorted],
          edges: [...tempEdges],
          nodesProcessed,
          edgesRemoved,
        });
        if (tempInDegrees[edge.to] === 0) {
          tempQueue.push(edge.to);
          steps.push({
            type: 'queue',
            node: edge.to,
            inDegrees: { ...tempInDegrees },
            queue: [...tempQueue],
            sorted: [...tempSorted],
            edges: [...tempEdges],
            nodesProcessed,
            edgesRemoved,
          });
        }
      });
      tempEdges.splice(
        tempEdges.findIndex((e) => e.from === node),
        outgoingEdges.length
      );
    }

    if (tempSorted.length !== graph.nodes.length) {
      steps.push({
        type: 'error',
        message: 'Graph contains a cycle! Topological sort not possible.',
        inDegrees: { ...tempInDegrees },
        queue: [...tempQueue],
        sorted: [...tempSorted],
        edges: [...tempEdges],
        nodesProcessed,
        edgesRemoved,
      });
    } else {
      steps.push({
        type: 'complete',
        sorted: [...tempSorted],
        inDegrees: { ...tempInDegrees },
        queue: [],
        edges: [],
        nodesProcessed,
        edgesRemoved,
      });
    }
    return steps;
  };

  const handleStart = () => {
    if (isSorting) return;
    setIsSorting(true);
    setIsPaused(false);
    setStepIndex(0);
    setStepCount(0);
    setOperationCount({ nodesProcessed: 0, edgesRemoved: 0 });
    setSortedList([]);
    setQueue([]);
    setCurrentNode(null);
    setCurrentEdges([]);
    setInDegrees(initializeInDegrees());
    setStepDescription([
      `Starting Topological Sort (Kahn’s Algorithm)`,
      `Initial in-degrees: ${JSON.stringify(initializeInDegrees())}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
    const newSteps = topologicalSort();
    setSteps(newSteps);
    intervalRef.current = setInterval(() => {
      setStepIndex((prev) => prev + 1);
      setStepCount((prev) => prev + 1);
    }, speed);
  };

  const handleStep = () => {
    if (isSorting && !isPaused) return;
    setIsSorting(true);
    setIsPaused(true);
    if (steps.length === 0) {
      setInDegrees(initializeInDegrees());
      const newSteps = topologicalSort();
      setSteps(newSteps);
    }
    if (stepIndex < steps.length) {
      setStepIndex((prev) => prev + 1);
      setStepCount((prev) => prev + 1);
    }
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Topological Sort at step ${stepIndex + 1}`,
        `Operations: ${operationCount.nodesProcessed} nodes processed, ${operationCount.edgesRemoved} edges removed`,
      ]);
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => prev + 1);
        setStepCount((prev) => prev + 1);
      }, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepIndex}`,
        `Click 'Step' or 'Resume'`,
        `Operations: ${operationCount.nodesProcessed} nodes processed, ${operationCount.edgesRemoved} edges removed`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setGraph(initialGraph);
    setInDegrees(initializeInDegrees());
    setQueue([]);
    setSortedList([]);
    setCurrentNode(null);
    setCurrentEdges([]);
    setIsSorting(false);
    setIsPaused(false);
    setStepIndex(0);
    setSteps([]);
    setStepCount(0);
    setOperationCount({ nodesProcessed: 0, edgesRemoved: 0 });
    setStepDescription([
      `Reset Graph`,
      `Nodes: ${initialGraph.nodes.join(', ')}`,
      `Edges: ${initialGraph.edges.map((e) => `${e.from}→${e.to}`).join(', ')}`,
      `Time: O(V + E), Space: O(V)`,
    ]);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isSorting && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => prev + 1);
        setStepCount((prev) => prev + 1);
      }, newSpeed);
    }
  };

  useEffect(() => {
    setInDegrees(initializeInDegrees());
  }, []);

  useEffect(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      setInDegrees(step.inDegrees);
      setQueue(step.queue);
      setSortedList(step.sorted);
      setOperationCount({
        nodesProcessed: step.nodesProcessed,
        edgesRemoved: step.edgesRemoved,
      });

      if (step.type === 'process') {
        setCurrentNode(step.node);
        setCurrentEdges([]);
        setStepDescription([
          `Step ${stepCount + 1}: Processing node ${step.node} (in-degree: 0)`,
          `Queue: [${step.queue.join(', ')}]`,
          `Sorted: [${step.sorted.join(', ')}]`,
          `Operations: ${step.nodesProcessed} nodes processed, ${step.edgesRemoved} edges removed`,
          `Time: O(V + E), Space: O(V)`,
        ]);
      } else if (step.type === 'edge') {
        setCurrentEdges([step.edge.id]);
        setStepDescription([
          `Step ${stepCount + 1}: Removing edge ${step.edge.from}→${step.edge.to}`,
          `In-degree of ${step.edge.to} reduced to ${step.inDegrees[step.edge.to]}`,
          `Queue: [${step.queue.join(', ')}]`,
          `Sorted: [${step.sorted.join(', ')}]`,
          `Operations: ${step.nodesProcessed} nodes processed, ${step.edgesRemoved} edges removed`,
          `Time: O(V + E), Space: O(V)`,
        ]);
      } else if (step.type === 'queue') {
        setCurrentNode(step.node);
        setCurrentEdges([]);
        setStepDescription([
          `Step ${stepCount + 1}: Adding node ${step.node} to queue (in-degree: 0)`,
          `Queue: [${step.queue.join(', ')}]`,
          `Sorted: [${step.sorted.join(', ')}]`,
          `Operations: ${step.nodesProcessed} nodes processed, ${step.edgesRemoved} edges removed`,
          `Time: O(V + E), Space: O(V)`,
        ]);
      } else if (step.type === 'error') {
        setStepDescription([
          `Error: ${step.message}`,
          `Sorted so far: [${step.sorted.join(', ')}]`,
          `Operations: ${step.nodesProcessed} nodes processed, ${step.edgesRemoved} edges removed`,
        ]);
        setIsSorting(false);
        setIsPaused(false);
        clearInterval(intervalRef.current);
      } else if (step.type === 'complete') {
        setStepDescription([
          `Topological Sort completed! Sorted order: ${step.sorted.join(', ')}`,
          `Total: ${stepCount} steps`,
          `Operations: ${step.nodesProcessed} nodes processed, ${step.edgesRemoved} edges removed`,
          `Time: O(V + E), Space: O(V)`,
        ]);
        setCurrentNode(null);
        setCurrentEdges([]);
        setIsSorting(false);
        setIsPaused(false);
        clearInterval(intervalRef.current);
      }
    }
  }, [stepIndex]);

  useEffect(() => {
    // Particle background
    const canvas = document.createElement('canvas');
    canvas.className = 'ts-particle-bg';
    document.querySelector('.ts-container')?.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      vx: Math.random() * 0.5 - 0.25,
      vy: Math.random() * 0.5 - 0.25,
    }));

    const animateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animateParticles);
    };
    animateParticles();

    return () => {
      canvas.remove();
      clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <motion.div
      className="ts-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="ts-title"
    >
      <section className="ts-header-section" aria-label="Topological Sort Header">
        <h1 id="ts-title" className="ts-animation-title">Topological Sort</h1>
        <p className="ts-animation-subtitle">Order nodes in a directed acyclic graph</p>
      </section>

      <section className="ts-visualization-section" aria-label="Graph Visualization">
        <div className="ts-graph-wrapper">
          <svg className="ts-edges-svg" width="400" height="300">
            <AnimatePresence>
              {graph.edges.map((edge) => (
                <motion.line
                  key={edge.id}
                  x1={graph.positions[edge.from].x}
                  y1={graph.positions[edge.from].y}
                  x2={graph.positions[edge.to].x}
                  y2={graph.positions[edge.to].y}
                  stroke={currentEdges.includes(edge.id) ? 'var(--accent-magenta)' : 'var(--edge)'}
                  strokeWidth="2"
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: currentEdges.includes(edge.id) ? 0.3 : 1,
                    stroke: currentEdges.includes(edge.id) ? 'var(--accent-magenta)' : 'var(--edge)',
                  }}
                  transition={{ duration: 0.5 }}
                  markerEnd="url(#arrow)"
                />
              ))}
            </AnimatePresence>
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--edge)" />
              </marker>
            </defs>
          </svg>
          {graph.nodes.map((node) => {
            const isInQueue = queue.includes(node);
            const isProcessed = sortedList.includes(node);
            const isCurrent = currentNode === node && !isProcessed;
            return (
              <motion.div
                key={node}
                className={`ts-node ${isInQueue ? 'ts-queue' : ''} ${isProcessed ? 'ts-processed' : ''} ${isCurrent ? 'ts-current' : ''}`}
                style={{
                  left: isProcessed ? 50 + sortedList.indexOf(node) * 60 : graph.positions[node].x - 25,
                  top: isProcessed ? 350 : graph.positions[node].y - 25,
                }}
                initial={{ scale: 0 }}
                animate={{
                  scale: isCurrent ? [1, 1.1, 1] : 1,
                  background: isProcessed
                    ? 'var(--processed)'
                    : isInQueue
                    ? 'var(--queue)'
                    : isCurrent
                    ? 'var(--current)'
                    : 'var(--node-bg)',
                }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                whileHover={{ scale: 1.05 }}
                role="button"
                tabIndex={0}
                aria-label={`Node ${node}, in-degree: ${inDegrees[node] || 0}`}
                onKeyDown={(e) => e.key === 'Enter' && alert(`Node ${node}, in-degree: ${inDegrees[node] || 0}`)}
              >
                {node}
                <motion.span
                  className="ts-in-degree"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {inDegrees[node] || 0}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
        <div className="ts-result-row">
          <h3>Sorted Order:</h3>
          <div className="ts-result-nodes">
            <AnimatePresence>
              {sortedList.map((node, index) => (
                <motion.div
                  key={`result-${node}`}
                  className="ts-result-node"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {node}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="ts-info-section" aria-label="Algorithm Information">
        <div className="ts-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'ts-primary' : 'ts-secondary'}>{line}</p>
          ))}
        </div>
        <div className="ts-complexity-visuals">
          <motion.div
            className="ts-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Time Complexity: O(V + E)</h3>
            <motion.div
              className="ts-operation-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((operationCount.nodesProcessed + operationCount.edgesRemoved) * 10, 200)}px` }}
              transition={{ duration: 0.5 }}
            />
            <p>{operationCount.nodesProcessed} nodes processed, {operationCount.edgesRemoved} edges removed</p>
          </motion.div>
          <motion.div
            className="ts-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Space Complexity: O(V)</h3>
            <motion.div
              className="ts-memory-bar"
              initial={{ width: 0 }}
              animate={{ width: `60px` }}
              transition={{ duration: 0.5 }}
            />
            <p>Queue and in-degree storage</p>
          </motion.div>
        </div>
        <div className="ts-timeline" role="progressbar" aria-label="Algorithm Progress">
          {Array.from({ length: Math.min(10, graph.nodes.length + graph.edges.length) }).map((_, idx) => (
            <motion.div
              key={idx}
              className="ts-timeline-marker"
              initial={{ opacity: 0 }}
              animate={{ opacity: stepCount > idx * 2 ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              title={`Step ${idx * 2 + 1}`}
            />
          ))}
          <motion.div
            className="ts-timeline-progress"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stepCount / (graph.nodes.length + graph.edges.length)) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </section>

      <section className="ts-controls-section" aria-label="Animation Controls">
        <div className="ts-animation-controls">
          <motion.button
            className="ts-control-button ts-start-button"
            onClick={handleStart}
            disabled={isSorting && !isPaused}
            aria-label="Start Topological Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-cyan)' }}
            whileTap={{ scale: 0.95 }}
            title="Start the algorithm"
          >
            <PlayIcon className="ts-control-icon" />
            Start
          </motion.button>
          <motion.button
            className="ts-control-button ts-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isSorting}
            aria-label={isPaused ? 'Resume Sort' : 'Pause Sort'}
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-magenta)' }}
            whileTap={{ scale: 0.95 }}
            title={isPaused ? 'Resume the algorithm' : 'Pause the algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="ts-control-icon" />
            ) : (
              <PauseIcon className="ts-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          <motion.button
            className="ts-control-button ts-step-button"
            onClick={handleStep}
            disabled={isSorting && !isPaused}
            aria-label="Step Through Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-violet)' }}
            whileTap={{ scale: 0.95 }}
            title="Step through the algorithm"
          >
            <ArrowRightIcon className="ts-control-icon" />
            Step
          </motion.button>
          <motion.button
            className="ts-control-button ts-reset-button"
            onClick={handleReset}
            aria-label="Reset Graph"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-purple)' }}
            whileTap={{ scale: 0.95 }}
            title="Reset the graph"
          >
            <ArrowPathIcon className="ts-control-icon" />
            Reset
          </motion.button>
          <div className="ts-speed-control">
            <label htmlFor="ts-speed-select" className="ts-control-label">Speed:</label>
            <select
              id="ts-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="ts-control-dropdown"
              aria-label="Select Animation Speed"
              title="Adjust animation speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default TopologicalSort;