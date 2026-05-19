import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './Knapsack01.css';

// Generate items for knapsack
const generateItems = (caseType = 'average') => {
  let items = [
    { id: 1, weight: 2, value: 10 },
    { id: 2, weight: 3, value: 15 },
    { id: 3, weight: 5, value: 25 },
    { id: 4, weight: 7, value: 30 },
  ];

  if (caseType === 'best') {
    items = items.map((item) => ({
      ...item,
      weight: Math.floor(item.weight * 0.5) + 1,
      value: item.value * 2,
    }));
  } else if (caseType === 'worst') {
    items = items.map((item) => ({
      ...item,
      weight: item.weight * 2,
      value: Math.floor(item.value * 0.5) + 1,
    }));
  } else {
    items = items.map((item) => ({
      ...item,
      weight: Math.floor(Math.random() * 8) + 1,
      value: Math.floor(Math.random() * 30) + 5,
    }));
  }

  return { items, capacity: 10 };
};

const Knapsack01 = () => {
  const [data, setData] = useState(generateItems());
  const [isRunning, setIsRunning] = useState(false);
  const [dpTable, setDpTable] = useState([]);
  const [currentCell, setCurrentCell] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin 0/1 Knapsack Algorithm']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, assignments: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({
    i: 0,
    w: 0,
    dp: [],
    selected: [],
  });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runKnapsackStep = async () => {
    let { i, w, dp, selected } = stateRef.current;
    const { items, capacity } = data;

    if (i === 0 && w === 0) {
      // Initialize DP table
      dp = Array(items.length + 1)
        .fill()
        .map(() => Array(capacity + 1).fill(0));
      setDpTable(dp);
      setStepDescription([
        `Step ${stepCount + 1}: Initialize DP table`,
        `Rows: ${items.length + 1} (items), Columns: ${capacity + 1} (weight capacity)`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 2);
    }

    if (i < items.length + 1 && w < capacity + 1) {
      setCurrentCell({ i, w });
      if (i === 0 || w === 0) {
        // Base case
        dp[i][w] = 0;
        setDpTable([...dp]);
        setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + 1 }));
        setStepDescription([
          `Step ${stepCount + 1}: Base case at DP[${i}][${w}] = 0`,
          `No items or no capacity`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments + 1} assignments`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);
      } else {
        // Compute DP[i][w]
        const item = items[i - 1];
        const withoutItem = dp[i - 1][w];
        let withItem = 0;
        if (item.weight <= w) {
          withItem = item.value + dp[i - 1][w - item.weight];
          setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        } else {
          setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        }
        dp[i][w] = Math.max(withoutItem, withItem);
        setDpTable([...dp]);
        setOperationCount((prev) => ({ ...prev, assignments: prev.assignments + 1 }));
        setStepDescription([
          `Step ${stepCount + 1}: Compute DP[${i}][${w}]`,
          `Item ${item.id}: weight=${item.weight}, value=${item.value}`,
          `Without item: ${withoutItem}, With item: ${withItem}`,
          `DP[${i}][${w}] = max(${withoutItem}, ${withItem}) = ${dp[i][w]}`,
          `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.assignments + 1} assignments`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed);
      }

      // Move to next cell
      w++;
      if (w > capacity) {
        i++;
        w = 0;
      }
      stateRef.current = { i, w, dp, selected };
    } else {
      // Backtrack to find selected items
      let currW = capacity;
      let currI = items.length;
      selected = [];
      while (currI > 0 && currW >= 0) {
        setCurrentCell({ i: currI, w: currW });
        if (currI > 0 && dp[currI][currW] !== dp[currI - 1][currW]) {
          selected.push(items[currI - 1]);
          currW -= items[currI - 1].weight;
        }
        currI--;
        setSelectedItems([...selected].reverse());
        setStepDescription([
          `Step ${stepCount + 1}: Backtracking at DP[${currI}][${currW}]`,
          `Selected items: ${selected.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ') || 'None'}`,
          `Current weight: ${currW}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);
      }

      setStepDescription([
        `0/1 Knapsack Algorithm completed!`,
        `Maximum value: ${dp[items.length][capacity]}`,
        `Selected items: ${selected.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ') || 'None'}`,
        `Total weight: ${selected.reduce((sum, item) => sum + item.weight, 0)}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
        `Time: O(n*W), Space: O(n*W)`,
      ]);
      setIsRunning(false);
      setIsPaused(false);
      setCurrentCell(null);
      setSelectedItems([...selected].reverse());
      clearInterval(intervalRef.current);
      stateRef.current = { i: 0, w: 0, dp: [], selected: [] };
    }
  };

  const handleStart = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setStepDescription([
      `Starting 0/1 Knapsack Algorithm (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Items: ${data.items.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ')}`,
      `Capacity: ${data.capacity}`,
      `Time: O(n*W), Space: O(n*W)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    setDpTable([]);
    setSelectedItems([]);
    setCurrentCell(null);
    stateRef.current = { i: 0, w: 0, dp: [], selected: [] };
    intervalRef.current = setInterval(runKnapsackStep, speed);
  };

  const handleStep = async () => {
    if (isRunning && !isPaused) return;
    setIsRunning(true);
    setIsPaused(true);
    await runKnapsackStep();
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming 0/1 Knapsack Algorithm`,
        `Current cell: DP[${stateRef.current.i}][${stateRef.current.w}]`,
        `Selected items: ${stateRef.current.selected.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ') || 'None'}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
      intervalRef.current = setInterval(runKnapsackStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}`,
        `Current cell: DP[${stateRef.current.i}][${stateRef.current.w}]`,
        `Selected items: ${stateRef.current.selected.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ') || 'None'}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.assignments} assignments`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newData = generateItems(caseType);
    setData(newData);
    setIsRunning(false);
    setIsPaused(false);
    setDpTable([]);
    setSelectedItems([]);
    setCurrentCell(null);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New items: ${newData.items.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ')}`,
      `Capacity: ${newData.capacity}`,
      `Time: O(n*W), Space: O(n*W)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { i: 0, w: 0, dp: [], selected: [] };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isRunning && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runKnapsackStep, newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newData = generateItems(newCase);
    setData(newData);
    setIsRunning(false);
    setIsPaused(false);
    setDpTable([]);
    setSelectedItems([]);
    setCurrentCell(null);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New items: ${newData.items.map((item) => `Item ${item.id}(${item.weight},${item.value})`).join(', ')}`,
      `Capacity: ${newData.capacity}`,
      `Time: O(n*W), Space: O(n*W)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, assignments: 0 });
    stateRef.current = { i: 0, w: 0, dp: [], selected: [] };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <motion.div
      className="knapsack01-algorithm-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="knapsack01-algorithm-title"
    >
      <section className="knapsack01-header-section" aria-label="0/1 Knapsack Algorithm Header">
        <h1 id="knapsack01-algorithm-title" className="knapsack01-animation-title">
          0/1 Knapsack Algorithm
        </h1>
        <p className="knapsack01-animation-subtitle">Maximize Value with Weight Constraints</p>
      </section>

      <section className="knapsack01-visualization-section" aria-label="Items and DP Table Visualization">
        <div className="knapsack01-items-info">
          <p>
            Total Value:{' '}
            <span className="knapsack01-target-value">
              {selectedItems.reduce((sum, item) => sum + item.value, 0)}
            </span>
          </p>
          <p>
            Total Weight:{' '}
            <span className="knapsack01-target-value">
              {selectedItems.reduce((sum, item) => sum + item.weight, 0)}/{data.capacity}
            </span>
          </p>
        </div>
        <div className="knapsack01-visualization-container">
          <div className="knapsack01-items-container">
            {data.items.map((item) => (
              <motion.div
                key={`knapsack01-item-${item.id}`}
                className={`knapsack01-item ${
                  selectedItems.includes(item) ? 'knapsack01-item-selected' : ''
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <span>Item {item.id}</span>
                <span>W: {item.weight}</span>
                <span>V: {item.value}</span>
              </motion.div>
            ))}
            <motion.div
              className="knapsack01-bag"
              animate={{
                scale: selectedItems.length > 0 ? [1, 1.05, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: selectedItems.length > 0 ? 1 : 0 }}
            >
              <span>Knapsack (Capacity: {data.capacity})</span>
              {selectedItems.map((item) => (
                <span key={`knapsack01-bag-item-${item.id}`}>
                  Item {item.id} ({item.weight},{item.value})
                </span>
              ))}
            </motion.div>
          </div>
          <div className="knapsack01-table-container">
            <table className="knapsack01-dp-table">
              <thead>
                <tr>
                  <th></th>
                  {[...Array(data.capacity + 1)].map((_, w) => (
                    <th key={`knapsack01-th-${w}`}>W={w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dpTable.map((row, i) => (
                  <tr key={`knapsack01-row-${i}`}>
                    <td>Item {i === 0 ? 0 : data.items[i - 1].id}</td>
                    {row.map((value, w) => (
                      <td
                        key={`knapsack01-cell-${i}-${w}`}
                        className={`knapsack01-cell ${
                          currentCell && currentCell.i === i && currentCell.w === w
                            ? 'knapsack01-cell-current'
                            : selectedItems.some(
                                (item) =>
                                  i > 0 &&
                                  w >= item.weight &&
                                  dpTable[i][w] === item.value + (dpTable[i - 1][w - item.weight] || 0)
                              )
                            ? 'knapsack01-cell-selected'
                            : ''
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="knapsack01-info-section" aria-label="Algorithm Information">
        <div className="knapsack01-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'knapsack01-primary' : 'knapsack01-secondary'}>
              {line}
            </p>
          ))}
        </div>
        <div className="knapsack01-complexity-visuals">
          <div className="knapsack01-complexity-card">
            <h3>Time Complexity: O(n*W)</h3>
            <div
              className="knapsack01-operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.assignments) * 5, 200)}px` }}
            />
            <p>
              {operationCount.comparisons} comparisons, {operationCount.assignments} assignments
            </p>
          </div>
          <div className="knapsack01-complexity-card">
            <h3>Space Complexity: O(n*W)</h3>
            <div className="knapsack01-memory-bar" style={{ width: `${(data.items.length * data.capacity) / 10}px` }} />
            <p>
              {data.items.length} items, {data.capacity} capacity
            </p>
          </div>
        </div>
      </section>

      <section className="knapsack01-controls-section" aria-label="Animation Controls">
        <div className="knapsack01-animation-controls">
          <button
            className="knapsack01-control-button knapsack01-start-button"
            onClick={handleStart}
            disabled={isRunning && !isPaused}
            aria-label="Start 0/1 Knapsack Algorithm"
          >
            <PlayIcon className="knapsack01-control-icon" />
            Start
          </button>
          <button
            className="knapsack01-control-button knapsack01-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isRunning}
            aria-label={isPaused ? 'Resume Algorithm' : 'Pause Algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="knapsack01-control-icon" />
            ) : (
              <PauseIcon className="knapsack01-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            className="knapsack01-control-button knapsack01-step-button"
            onClick={handleStep}
            disabled={isRunning && !isPaused}
            aria-label="Step Through Algorithm"
          >
            <ArrowRightIcon className="knapsack01-control-icon" />
            Step
          </button>
          <button
            className="knapsack01-control-button knapsack01-reset-button"
            onClick={handleReset}
            aria-label="Reset Knapsack"
          >
            <ArrowPathIcon className="knapsack01-control-icon" />
            Reset
          </button>
          <div className="knapsack01-speed-control">
            <label htmlFor="knapsack01-speed-select" className="knapsack01-control-label">
              Speed:
            </label>
            <select
              id="knapsack01-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="knapsack01-control-dropdown"
              aria-label="Select Animation Speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="knapsack01-case-control">
            <label htmlFor="knapsack01-case-select" className="knapsack01-control-label">
              Case:
            </label>
            <select
              id="knapsack01-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="knapsack01-control-dropdown"
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

export default Knapsack01;