import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './BinarySearch.css';

const generateArray = (caseType = 'average') => {
  const size = 10;
  let arr, target;
  if (caseType === 'best') {
    arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // Sorted, target in middle
    target = 50; // Middle element for O(1) comparison
  } else if (caseType === 'worst') {
    arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; // Sorted, target at end
    target = 100; // Last element for O(log n) comparisons
  } else {
    arr = [10, 15, 30, 35, 50, 60, 75, 80, 90, 100]; // Sorted with slight variations
    target = arr[Math.floor(Math.random() * size)]; // Random target for average case
  }
  return { array: arr, target };
};

const BinarySearch = () => {
  const [data, setData] = useState(generateArray());
  const [isSearching, setIsSearching] = useState(false);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [mid, setMid] = useState(null);
  const [found, setFound] = useState(false);
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Binary Search']);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState({ comparisons: 0 });
  const [speed, setSpeed] = useState(1000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState('average');
  const stateRef = useRef({ left: 0, right: null, mid: null });
  const intervalRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const runSearchStep = async () => {
    let { left, right, mid } = stateRef.current;
    let arr = [...data.array];
    const target = data.target;
    const n = arr.length;

    if (right === null) right = n - 1;

    if (left <= right) {
      mid = Math.floor((left + right) / 2);
      setLeft(left);
      setRight(right);
      setMid(mid);
      setOperationCount((prev) => ({ ...prev, comparisons: prev.comparisons + 1 }));
      setStepDescription([
        `Step ${stepCount + 1}: Checking index ${mid} (value ${arr[mid]})`,
        `Target: ${target}, Range: [${left}, ${right}]`,
        `Compare ${arr[mid]} with ${target}`,
        `Operations: ${operationCount.comparisons + 1} comparisons`,
      ]);
      setStepCount((prev) => prev + 1);
      await delay(speed / 2);

      if (arr[mid] === target) {
        setFound(true);
        setStepDescription([
          `Target ${target} found at index ${mid}!`,
          `Binary Search completed in ${stepCount + 1} steps`,
          `Total: ${operationCount.comparisons + 1} comparisons`,
          `Time: O(log n), Space: O(1)`,
        ]);
        setIsSearching(false);
        setIsPaused(false);
        clearInterval(intervalRef.current);
        return;
      } else if (arr[mid] < target) {
        left = mid + 1;
        setStepDescription([
          `${arr[mid]} < ${target}, search right half`,
          `New range: [${left}, ${right}]`,
          `Operations: ${operationCount.comparisons + 1} comparisons`,
          `Time: O(log n), Space: O(1)`,
        ]);
      } else {
        right = mid - 1;
        setStepDescription([
          `${arr[mid]} > ${target}, search left half`,
          `New range: [${left}, ${right}]`,
          `Operations: ${operationCount.comparisons + 1} comparisons`,
          `Time: O(log n), Space: O(1)`,
        ]);
      }
      stateRef.current = { left, right, mid };
      await delay(speed / 2);
      setLeft(left);
      setRight(right);
      setMid(mid);
    } else {
      setStepDescription([
        `Target ${target} not found in array`,
        `Binary Search completed in ${stepCount + 1} steps`,
        `Total: ${operationCount.comparisons} comparisons`,
        `Time: O(log n), Space: O(1)`,
      ]);
      setIsSearching(false);
      setIsPaused(false);
      setLeft(null);
      setRight(null);
      setMid(null);
      setFound(false);
      clearInterval(intervalRef.current);
    }
  };

  const handleSearch = () => {
    if (isSearching) return;
    setIsSearching(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Binary Search (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Array: ${data.array.join(', ')}`,
      `Target: ${data.target}`,
      `Time: O(log n), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0 });
    setLeft(0);
    setRight(null);
    setMid(null);
    setFound(false);
    stateRef.current = { left: 0, right: null, mid: null };
    intervalRef.current = setInterval(runSearchStep, speed);
  };

  const handleStep = async () => {
    if (isSearching && !isPaused) return;
    setIsSearching(true);
    setIsPaused(true);
    await runSearchStep();
  };

  const handlePauseResume = () => {
    if (!isSearching) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming Binary Search`,
        `Range: [${stateRef.current.left}, ${stateRef.current.right}]`,
        `Operations: ${operationCount.comparisons} comparisons`,
      ]);
      intervalRef.current = setInterval(runSearchStep, speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at range [${stateRef.current.left}, ${stateRef.current.right}]`,
        `Click 'Step' or 'Resume'`,
        `Operations: ${operationCount.comparisons} comparisons`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newData = generateArray(caseType);
    setData(newData);
    setIsSearching(false);
    setIsPaused(false);
    setLeft(null);
    setRight(null);
    setMid(null);
    setFound(false);
    setStepDescription([
      `Reset (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New array: ${newData.array.join(', ')}`,
      `New target: ${newData.target}`,
      `Time: O(log n), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0 });
    stateRef.current = { left: 0, right: null, mid: null };
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isSearching && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(runSearchStep, newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newData = generateArray(newCase);
    setData(newData);
    setIsSearching(false);
    setIsPaused(false);
    setLeft(null);
    setRight(null);
    setMid(null);
    setFound(false);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New array: ${newData.array.join(', ')}`,
      `New target: ${newData.target}`,
      `Time: O(log n), Space: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount({ comparisons: 0 });
    stateRef.current = { left: 0, right: null, mid: null };
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <motion.div
      className="binary-search-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="binary-search-title"
    >
      <section className="header-section" aria-label="Binary Search Header">
        <h1 id="binary-search-title" className="animation-title">Binary Search</h1>
        <p className="animation-subtitle">Find a target in a sorted array efficiently</p>
      </section>

      <section className="visualization-section" aria-label="Visualization">
        <div className="target-info">
          <p>Target: <span className="target-value">{data.target}</span></p>
        </div>
        <div className="array-wrapper">
          <div className="pointer-row">
            {data.array.map((_, idx) => (
              <div key={`pointer-${idx}`} className="pointer-cell">
                {idx === left && (
                  <div className="pointer left-pointer" aria-label="Left pointer">L</div>
                )}
                {idx === right && (
                  <div className="pointer right-pointer" aria-label="Right pointer">R</div>
                )}
                {idx === mid && (
                  <div className="pointer mid-pointer" aria-label="Mid pointer">M</div>
                )}
              </div>
            ))}
          </div>
          <div className="index-row">
            {data.array.map((_, idx) => (
              <div key={`index-${idx}`} className="index-cell">{idx}</div>
            ))}
          </div>
          <div className="value-row">
            {data.array.map((val, idx) => (
              <div key={`value-${idx}`} className="value-cell">{val}</div>
            ))}
          </div>
          <AnimatePresence>
            <div className="array-container">
              {data.array.map((val, idx) => (
                <motion.div
                  key={`bar-${idx}`}
                  className={`array-bar 
                    ${idx === left ? 'left' : ''} 
                    ${idx === right ? 'right' : ''} 
                    ${idx === mid ? 'mid' : ''} 
                    ${found && idx === mid ? 'found' : ''}`}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(val * 1.5, 200)}px` }} // Cap height for visibility
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
            <h3>Time Complexity: O(log n)</h3>
            <div
              className="operation-bar"
              style={{ width: `${Math.min(operationCount.comparisons * 20, 200)}px` }}
            />
            <p>{operationCount.comparisons} comparisons</p>
          </div>
          <div className="complexity-card">
            <h3>Space Complexity: O(1)</h3>
            <div className="memory-bar" style={{ width: `60px` }} />
            <p>3 variables (left, right, mid)</p>
          </div>
        </div>
      </section>

      <section className="controls-section" aria-label="Animation Controls">
        <div className="animation-controls">
          <button
            className="control-button start-button"
            onClick={handleSearch}
            disabled={isSearching && !isPaused}
            aria-label="Start Binary Search"
          >
            <PlayIcon className="control-icon" />
            Start
          </button>
          <button
            className="control-button pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isSearching}
            aria-label={isPaused ? 'Resume Search' : 'Pause Search'}
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
            disabled={isSearching && !isPaused}
            aria-label="Step Through Search"
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

export default BinarySearch;