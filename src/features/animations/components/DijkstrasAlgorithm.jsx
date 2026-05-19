import { useState, useEffect, useRef } from "react";
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import "./DijkstrasAlgorithm.css";

const generateGraph = (caseType = "average") => {
  const nodes = ["A", "B", "C", "D", "E"];
  let edges = [];
  let positions = {
    A: [300, 100],
    B: [150, 250],
    C: [300, 400],
    D: [450, 250],
    E: [300, 250],
  };

  if (caseType === "best") {
    edges = [
      { from: "A", to: "B", weight: 1 },
      { from: "B", to: "C", weight: 1 },
      { from: "C", to: "D", weight: 1 },
      { from: "D", to: "E", weight: 1 },
    ];
  } else if (caseType === "worst") {
    edges = [
      { from: "A", to: "B", weight: 10 },
      { from: "A", to: "C", weight: 10 },
      { from: "A", to: "D", weight: 10 },
      { from: "A", to: "E", weight: 10 },
      { from: "B", to: "C", weight: 10 },
      { from: "B", to: "D", weight: 10 },
      { from: "B", to: "E", weight: 10 },
      { from: "C", to: "D", weight: 10 },
      { from: "C", to: "E", weight: 10 },
      { from: "D", to: "E", weight: 10 },
    ];
  } else {
    edges = [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 8 },
      { from: "B", to: "C", weight: 2 },
      { from: "B", to: "E", weight: 6 },
      { from: "C", to: "D", weight: 3 },
      { from: "D", to: "E", weight: 5 },
    ];
  }

  return { nodes, edges, positions };
};

const DijkstrasAlgorithm = () => {
  const [graph, setGraph] = useState(generateGraph());
  const [distances, setDistances] = useState({});
  const [predecessors, setPredecessors] = useState({});
  const [visited, setVisited] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);
  const [currentEdge, setCurrentEdge] = useState(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepDescription, setStepDescription] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({
    comparisons: 0,
    assignments: 0,
  });
  const [speed, setSpeed] = useState(2000);
  const [caseType, setCaseType] = useState("average");
  const intervalRef = useRef(null);
  const stateRef = useRef({ steps: [], currentStep: 0 });
  const comparePointsRef = useRef([]);

  const dijkstraSteps = (graph, source) => {
    const steps = [];
    const dist = {};
    const pred = {};
    const pq = [];
    graph.nodes.forEach((node) => {
      dist[node] = node === source ? 0 : Infinity;
      pred[node] = null;
    });
    pq.push([0, source]);

    steps.push({ type: "init", dist, pred, pq: [...pq], source });

    while (pq.length) {
      pq.sort((a, b) => a[0] - b[0]);
      const [d, u] = pq.shift();
      steps.push({ type: "select", node: u, dist: d });

      if (visited.has(u)) continue;
      const newVisited = new Set(visited);
      newVisited.add(u);
      steps.push({ type: "visit", node: u, visited: newVisited });

      const neighbors = graph.edges.filter((e) => e.from === u);
      for (const { to: v, weight } of neighbors) {
        steps.push({ type: "check", from: u, to: v, weight, dist });
        if (!newVisited.has(v) && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
          pred[v] = u;
          pq.push([dist[v], v]);
          steps.push({
            type: "update",
            node: v,
            dist: dist[v],
            pred: u,
            pq: [...pq],
          });
        }
      }
    }

    steps.push({ type: "finish", dist, pred });
    return steps;
  };

  const drawComparePath = () => {
    comparePointsRef.current = currentEdge
      ? [
          graph.positions[currentEdge.from],
          graph.positions[currentEdge.to],
        ]
      : [];
  };

  const runSortStep = async () => {
    const steps = stateRef.current.steps;
    let currentStep = stateRef.current.currentStep;

    if (currentStep >= steps.length) {
      finishSort();
      return;
    }

    const step = steps[currentStep];
    if (step.type === "init") {
      setDistances(step.dist);
      setPredecessors(step.pred);
      setVisited(new Set());
      setCurrentNode(step.source);
      setCurrentEdge(null);
      drawComparePath();
      setStepDescription([
        `Initializing Dijkstra’s Algorithm from node ${step.source}`,
        `Distances: ${Object.entries(step.dist)
          .map(([k, v]) => `${k}=${v === Infinity ? "∞" : v}`)
          .join(", ")}`,
        `Priority queue: [${step.pq.map(([d, n]) => `${n}:${d}`).join(", ")}]`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 2);
    } else if (step.type === "select") {
      setCurrentNode(step.node);
      setCurrentEdge(null);
      drawComparePath();
      setStepDescription([
        `Selecting node ${step.node} with distance ${step.dist}`,
        `Priority queue: [${step.pq.map(([d, n]) => `${n}:${d}`).join(", ")}]`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setOperationCount((prev) => ({
        ...prev,
        comparisons: prev.comparisons + 1,
      }));
      setStepCount((prev) => prev + 1);
      await delay(speed / 3);
    } else if (step.type === "check") {
      setCurrentEdge({ from: step.from, to: step.to, weight: step.weight });
      drawComparePath();
      setStepDescription([
        `Checking neighbor ${step.to} from ${step.from}`,
        `Current dist=${step.dist[step.to] === Infinity ? "∞" : step.dist[step.to]}`,
        `New dist=${step.dist[step.from] + step.weight}`,
        `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setOperationCount((prev) => ({
        ...prev,
        comparisons: prev.comparisons + 1,
      }));
      setStepCount((prev) => prev + 1);
      await delay(speed / 3);
    } else if (step.type === "update") {
      setDistances((prev) => ({ ...prev, [step.node]: step.dist }));
      setPredecessors((prev) => ({ ...prev, [step.node]: step.pred }));
      setCurrentEdge(null);
      drawComparePath();
      setStepDescription([
        `Updating ${step.node}’s distance to ${step.dist}`,
        `Predecessor set to ${step.pred}`,
        `Priority queue: [${step.pq.map(([d, n]) => `${n}:${d}`).join(", ")}]`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments + 1} assignments`,
      ]);
      setOperationCount((prev) => ({
        ...prev,
        assignments: prev.assignments + 1,
      }));
      setStepCount((prev) => prev + 1);
      await delay(speed / 3);
    } else if (step.type === "visit") {
      setVisited(step.visited);
      setCurrentEdge(null);
      drawComparePath();
      setStepDescription([
        `Marking ${step.node} as visited`,
        `Visited nodes: ${[...step.visited].join(", ")}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 3);
    } else if (step.type === "finish") {
      setDistances(step.dist);
      setPredecessors(step.pred);
      setCurrentNode(null);
      setCurrentEdge(null);
      drawComparePath();
      const paths = Object.entries(step.dist).map(([node, dist]) => {
        let path = [];
        let curr = node;
        while (curr) {
          path.push(curr);
          curr = step.pred[curr];
        }
        return `${node}: dist=${dist}, path=${path.reverse().join("→")}`;
      });
      setStepDescription([
        `Dijkstra’s Algorithm completed after ${stepCount + 1} steps`,
        `Shortest paths: ${paths.join("; ")}`,
        `Total operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
        `Time Complexity: O((V+E) log V)`,
        `Space Complexity: O(V)`,
      ]);
      setStepCount((prev) => prev + 1);
      clearInterval(intervalRef.current);
      setIsSorting(false);
      setIsPaused(false);
      stateRef.current = { steps: [], currentStep: 0 };
    }

    stateRef.current.currentStep = currentStep + 1;
  };

  const finishSort = () => {
    clearInterval(intervalRef.current);
    setIsSorting(false);
    setIsPaused(false);
    setCurrentNode(null);
    setCurrentEdge(null);
    drawComparePath();
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSort = () => {
    if (isSorting) return;
    setIsSorting(true);
    setIsPaused(false);
    const steps = dijkstraSteps(graph, "A");
    stateRef.current = { steps, currentStep: 0 };
    setStepDescription([
      `Starting Dijkstra’s Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Source node: A`,
      `Time Complexity: O((V+E) log V), Space Complexity: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    setVisited(new Set());
    setCurrentNode(null);
    setCurrentEdge(null);
    drawComparePath();
    intervalRef.current = setInterval(async () => {
      await runSortStep();
    }, speed);
  };

  const handleStep = () => {
    if (isSorting && !isPaused) return;
    if (stateRef.current.steps.length === 0) {
      const steps = dijkstraSteps(graph, "A");
      stateRef.current = { steps, currentStep: 0 };
    }
    setIsSorting(true);
    setIsPaused(true);
    runSortStep();
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Dijkstra’s Algorithm`,
        `Continuing from step ${stateRef.current.currentStep}`,
        `Current operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      intervalRef.current = setInterval(async () => {
        await runSortStep();
      }, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused Dijkstra’s Algorithm`,
        `Current step ${stateRef.current.currentStep}`,
        `Click 'Step' to advance or 'Resume' to continue`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(caseType);
    setGraph(newGraph);
    setIsSorting(false);
    setIsPaused(false);
    setDistances({});
    setPredecessors({});
    setVisited(new Set());
    setCurrentNode(null);
    setCurrentEdge(null);
    drawComparePath();
    setStepDescription([
      `Array Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Ready for a new Dijkstra’s Algorithm run`,
      `Time Complexity: O((V+E) log V), Space Complexity: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { steps: [], currentStep: 0 };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isSorting && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(async () => {
        await runSortStep();
      }, newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newGraph = generateGraph(newCase);
    setGraph(newGraph);
    setIsSorting(false);
    setIsPaused(false);
    setDistances({});
    setPredecessors({});
    setVisited(new Set());
    setCurrentNode(null);
    setCurrentEdge(null);
    drawComparePath();
    setStepDescription([
      `Switched to ${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case`,
      `Ready for Dijkstra’s Algorithm`,
      `Time Complexity: O((V+E) log V), Space Complexity: O(V)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { steps: [], currentStep: 0 };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="animation-container" aria-labelledby="dijkstras-title">
      <h2 id="dijkstras-title" className="animation-title">Dijkstra’s Algorithm</h2>
      <div className="step-description" aria-live="polite">
        {stepDescription.map((line, idx) => (
          <p key={idx} className={idx === 0 ? "primary" : "secondary"}>{line}</p>
        ))}
      </div>
      <div className="graph-wrapper">
        <svg className="graph-svg" viewBox="0 0 600 500">
          {graph.edges.map((edge, idx) => (
            <g key={idx}>
              <line
                x1={graph.positions[edge.from][0]}
                y1={graph.positions[edge.from][1]}
                x2={graph.positions[edge.to][0]}
                y2={graph.positions[edge.to][1]}
                className={`edge ${
                  currentEdge &&
                  currentEdge.from === edge.from &&
                  currentEdge.to === edge.to
                    ? "updating"
                    : predecessors[edge.to] === edge.from ||
                      predecessors[edge.from] === edge.to
                    ? "shortest-path"
                    : ""
                }`}
              />
              <text
                x={(graph.positions[edge.from][0] + graph.positions[edge.to][0]) / 2}
                y={(graph.positions[edge.from][1] + graph.positions[edge.to][1]) / 2 - 10}
                className="edge-weight"
              >
                {edge.weight}
              </text>
            </g>
          ))}
          {graph.nodes.map((node) => (
            <g key={node}>
              <circle
                cx={graph.positions[node][0]}
                cy={graph.positions[node][1]}
                r="30"
                className={`node ${
                  node === currentNode
                    ? "processing"
                    : visited.has(node)
                    ? "visited"
                    : node === "A"
                    ? "source"
                    : distances[node] !== Infinity &&
                      distances[node] !== undefined
                    ? "distance-updated"
                    : ""
                }`}
              />
              <text
                x={graph.positions[node][0]}
                y={graph.positions[node][1] + 10}
                className="node-label"
              >
                {node}
              </text>
              <text
                x={graph.positions[node][0]}
                y={graph.positions[node][1] - 40}
                className="distance-label"
              >
                {distances[node] === Infinity
                  ? "∞"
                  : distances[node] !== undefined
                  ? distances[node]
                  : ""}
              </text>
            </g>
          ))}
          {comparePointsRef.current.length === 2 && (
            <path
              d={`M${comparePointsRef.current[0][0]},${comparePointsRef.current[0][1]} Q${(comparePointsRef.current[0][0] + comparePointsRef.current[1][0]) / 2},${(comparePointsRef.current[0][1] + comparePointsRef.current[1][1]) / 2 - 50} ${comparePointsRef.current[1][0]},${comparePointsRef.current[1][1]}`}
              className="compare-path"
            />
          )}
        </svg>
      </div>
      <div className="complexity-visuals">
        <div className="time-complexity">
          <p title="O((V+E) log V): Priority queue operations">Time Complexity: O((V+E) log V)</p>
          <div
            className="operation-bar"
            style={{ width: `${Math.min((operationCount.comparisons + operationCount.assignments) * 4, 200)}px` }}
          />
          <p>
            {operationCount.comparisons} comparisons, {operationCount.assignments} assignments
          </p>
        </div>
        <div className="space-complexity">
          <p title="O(V): Distance and predecessor arrays">Space Complexity: O(V)</p>
          <div className="memory-bar" style={{ width: `${Math.min(graph.nodes.length * 10, 200)}px` }} />
          <p>{graph.nodes.length} nodes</p>
        </div>
      </div>
      <div className="animation-controls">
        <button
          className="control-button"
          onClick={handleSort}
          disabled={isSorting && !isPaused}
          aria-label="Start Dijkstra’s Algorithm"
        >
          <PlayIcon className="control-icon" />
          Start
        </button>
        <button
          className="control-button"
          onClick={handlePauseResume}
          disabled={!isSorting}
          aria-label={isPaused ? "Resume Sort" : "Pause Sort"}
        >
          {isPaused ? <PlayIcon className="control-icon" /> : <PauseIcon className="control-icon" />}
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          className="control-button"
          onClick={handleStep}
          disabled={isSorting && !isPaused}
          aria-label="Step Through Sort"
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
          <label htmlFor="speed-select-dijkstras" className="speed-label">Speed:</label>
          <select
            id="speed-select-dijkstras"
            value={speed}
            onChange={handleSpeedChange}
            className="speed-dropdown"
            aria-label="Select Animation Speed"
          >
            <option value={3000}>Very Slow (3s)</option>
            <option value={2000}>Slow (2s)</option>
            <option value={1000}>Medium (1s)</option>
            <option value={500}>Fast (0.5s)</option>
          </select>
        </div>
        <div className="case-control">
          <label htmlFor="case-select-dijkstras" className="case-label">Case:</label>
          <select
            id="case-select-dijkstras"
            value={caseType}
            onChange={handleCaseChange}
            className="case-dropdown"
            aria-label="Select Case Type"
          >
            <option value="best">Best Case</option>
            <option value="worst">Worst Case</option>
            <option value="average">Average Case</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default DijkstrasAlgorithm;