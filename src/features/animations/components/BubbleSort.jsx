import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './BubbleSort.css';

const generateArray = (caseType = 'average') => {
  const size = 10;
  let arr;
  if (caseType === 'best') {
    arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // Already sorted
  } else if (caseType === 'worst') {
    arr = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]; // Reverse sorted
  } else {
    arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10); // Random values
  }
  return arr;
};

const BubbleSort = () => {
  const [data, setData] = useState(generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [i, setI] = useState(0);
  const [j, setJ] = useState(0);
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sorted, setSorted] = useState([]);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Bubble Sort']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, swaps: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({ i: 0, j: 0, arr: [], sortedUntil: null });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSortStep = async () => {
    let { i, j, arr, sortedUntil } = stateRef.current;
    const n = arr.length;
    if (sortedUntil === null) sortedUntil = n;

    if (i < n - 1) {
      if (j < sortedUntil - i - 1) {
        setComparing([j, j + 1]);
        setSwapping([]);
        setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
        setStepDescription([
          `Step ${stepCount + 1}: Comparing indices ${j} (${arr[j]}) and ${j + 1} (${arr[j + 1]})`,
          `Pass ${i + 1}, Sorting range: [0, ${sortedUntil - i - 1}]`,
          `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.swaps} swaps`,
          `Time: O(n²), Space: O(1)`,
        ]);
        setStepCount((prev) => prev + 1);
        await delay(speed / 2);

        if (arr[j] > arr[j + 1]) {
          setSwapping([j, j + 1]);
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          setOperationCount((prev) => ({ ...prev, swaps: prev.swaps + 1 }));
          setStepDescription([
            `Swapping ${arr[j + 1]} and ${arr[j]} at indices ${j} and ${j + 1}`,
            `Pass ${i + 1}, Sorting range: [0, ${sortedUntil - i - 1}]`,
            `Operations: ${operationCount.comparisons + 1} comparisons, ${operationCount.swaps + 1} swaps`,
            `Time: O(n²), Space: O(1)`,
          ]);
          await delay(speed / 2);
        }
        setComparing([]);
        setSwapping([]);
        j++;
      } else {
        setSorted((prev) => [...new Set([...prev, sortedUntil - i - 1])]);
        j = 0;
        i++;
      }
      setI(i);
      setJ(j);
      stateRef.current = { i, j, arr: [...arr], sortedUntil };
    } else {
      setSorted((prev) => [...new Set([...prev, ...Array.from({ length: n }, (_, idx) => idx)])]);
      setStepDescription([
        `Bubble Sort completed! Array is sorted`,
        `Total: ${stepCount + 1} steps`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
        `Time: O(n²), Space: O(1)`,
      ]);
      setIsSorting(false);
      setIsPaused(false);
      setComparing([]);
      setSwapping([]);
      setI(0);
      setJ(0);
      clearInterval(intervalRef.current);
    }
    setData([...arr]);
  };

  const handleSort = () => {
    if (isSorting) return;
    setIsSorting(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Bubble Sort (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Array: ${data.join(', ')}`,
      `Time: O(n²), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, swaps: 0 });
    setI(0);
    setJ(0);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    stateRef.current = { i: 0, j: 0, arr: [...data], sortedUntil: null };
    intervalRef.current = setInterval(runSortStep, speed);
  };

  const handleStep = async () => {
    if (isSorting && !isPaused) return;
    setIsSorting(true);
    setIsPaused(true);
    await runSortStep();
  };

  const handlePauseResume = () => {
    if (!isSorting) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Bubble Sort`,
        `Pass ${stateRef.current.i + 1}, Comparing indices ${stateRef.current.j}, ${stateRef.current.j + 1}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
      ]);
      intervalRef.current = setInterval(runSortStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at pass ${stateRef.current.i + 1}, index ${stateRef.current.j}`,
        `Click 'Step' or 'Resume'`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newData = generateArray(caseType);
    setData(newData);
    setIsSorting(false);
    setIsPaused(false);
    setI(0);
    setJ(0);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New array: ${newData.join(', ')}`,
      `Time: O(n²), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, swaps: 0 });
    stateRef.current = { i: 0, j: 0, arr: [...newData], sortedUntil: null };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isSorting && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runSortStep, newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newData = generateArray(newCase);
    setData(newData);
    setIsSorting(false);
    setIsPaused(false);
    setI(0);
    setJ(0);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New array: ${newData.join(', ')}`,
      `Time: O(n²), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0, swaps: 0 });
    stateRef.current = { i: 0, j: 0, arr: [...newData], sortedUntil: null };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <motion.div
      className="bubble-sort-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="bubble-sort-title"
    >
      <section className="header-section" aria-label="Bubble Sort Header">
        <h1 id="bubble-sort-title" className="animation-title">Bubble Sort</h1>
        <p className="animation-subtitle">Sort an array by repeatedly swapping adjacent elements</p>
      </section>

      <section className="visualization-section" aria-label="Visualization">
        <div className="array-wrapper">
          <div className="index-row">
            {data.map((_, idx) => (
              <div key={`index-${idx}`} className="index-cell">{idx}</div>
            ))}
          </div>
          <div className="value-row">
            {data.map((val, idx) => (
              <div key={`value-${idx}`} className="value-cell">{val}</div>
            ))}
          </div>
          <AnimatePresence>
            <div className="array-container">
              {data.map((val, idx) => (
                <motion.div
                  key={`bar-${idx}`}
                  className={`array-bar 
                    ${comparing.includes(idx) ? 'comparing' : ''} 
                    ${swapping.includes(idx) ? 'swapping' : ''} 
                    ${sorted.includes(idx) ? 'sorted' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(val * 1.5, 200)}px` }}
                  transition={{ duration: 0.3 }}
                  aria-label={`Value ${val} at index ${idx}`}
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </section>

      <section className="info-section" aria-label="Algorithm Information">
        <div className="step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'primary' : 'secondary'}>{line}</p>
          ))}
        </div>
        <div className="complexity-visuals">
          <div className="complexity-card">
            <h3>Time Complexity: O(n²)</h3>
            <div
              className="operation-bar"
              style={{ width: `${Math.min((operationCount.comparisons + operationCount.swaps) * 10, 200)}px` }}
            />
            <p>{operationCount.comparisons} comparisons, {operationCount.swaps} swaps</p>
          </div>
          <div className="complexity-card">
            <h3>Space Complexity: O(1)</h3>
            <div className="memory-bar" style={{ width: `60px` }} />
            <p>Minimal variables</p>
          </div>
        </div>
      </section>

      <section className="controls-section" aria-label="Animation Controls">
        <div className="animation-controls">
          <button
            className="control-button start-button"
            onClick={handleSort}
            disabled={isSorting && !isPaused}
            aria-label="Start Bubble Sort"
          >
            <PlayIcon className="control-icon" />
            Start
          </button>
          <button
            className="control-button pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isSorting}
            aria-label={isPaused ? 'Resume Sort' : 'Pause Sort'}
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
            disabled={isSorting && !isPaused}
            aria-label="Step Through Sort"
          >
            <ArrowRightIcon className="control-icon" />
            Step
          </button>
          <button
            className="control-button reset-button"
            onClick={handleReset}
            aria-label="Reset Array"
          >
            <ArrowPathIcon className="control-icon" />
            Reset
          </button>
          <div className="speed-control">
            <label htmlFor="speed-select" className="control-label">Speed:</label>
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
            <label htmlFor="case-select" className="control-label">Case:</label>
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

export default BubbleSort;