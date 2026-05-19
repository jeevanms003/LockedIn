import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/solid';
import './QuickSort.css';

// Generate array for sorting
const generateArray = (caseType = 'average', size = 10) => {
  if (caseType === 'best') {
    return Array.from({ length: size }, (_, i) => (i + 1) * 10); // [10, 20, ..., 100]
  } else if (caseType === 'worst') {
    return Array.from({ length: size }, (_, i) => (size - i) * 10); // [100, 90, ..., 10]
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10); // Random [10-100]
};

const QuickSort = () => {
  const [array, setArray] = useState(generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, swaps: 0 });
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Quick Sort']);
  const [stepCount, setStepCount] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [caseType, setCaseType] = useState('average');
  const [pivotIndex, setPivotIndex] = useState(null);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [subarray, setSubarray] = useState([0, array.length - 1]);
  const intervalRef = useRef(null);

  const quickSort = (arr, low, high, steps) => {
    if (low < high) {
      const pi = partition(arr, low, high, steps);
      quickSort(arr, low, pi - 1, steps);
      quickSort(arr, pi + 1, high, steps);
    }
  };

  const partition = (arr, low, high, steps) => {
    const pivot = arr[high];
    let i = low - 1;
    steps.push({
      type: 'pivot',
      pivotIndex: high,
      low,
      high,
      array: [...arr],
      comparisons: 0,
      swaps: 0,
      comparing: [],
      subarray: [low, high],
    });
    for (let j = low; j < high; j++) {
      steps.push({
        type: 'compare',
        pivotIndex: high,
        low,
        high,
        i,
        j,
        array: [...arr],
        comparisons: 1,
        swaps: 0,
        comparing: [j, high],
        subarray: [low, high],
      });
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({
          type: 'swap',
          pivotIndex: high,
          low,
          high,
          i,
          j,
          array: [...arr],
          comparisons: 0,
          swaps: 1,
          comparing: [i, j],
          subarray: [low, high],
        });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({
      type: 'place-pivot',
      pivotIndex: i + 1,
      low,
      high,
      array: [...arr],
      comparisons: 0,
      swaps: 1,
      comparing: [],
      subarray: [low, high],
    });
    return i + 1;
  };

  const handleStart = () => {
    if (isSorting) return;
    setIsSorting(true);
    setIsPaused(false);
    setStepIndex(0);
    setStepCount(0);
    setOperationCount({ comparisons: 0, swaps: 0 });
    setPivotIndex(null);
    setComparingIndices([]);
    setSubarray([0, array.length - 1]);
    setStepDescription([
      `Starting Quick Sort (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Array: ${array.join(', ')}`,
      `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
    ]);
    const newSteps = [];
    const tempArray = [...array];
    quickSort(tempArray, 0, array.length - 1, newSteps);
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
      const newSteps = [];
      const tempArray = [...array];
      quickSort(tempArray, 0, array.length - 1, newSteps);
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
        `Resuming Quick Sort at step ${stepIndex + 1}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
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
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newArray = generateArray(caseType);
    setArray(newArray);
    setIsSorting(false);
    setIsPaused(false);
    setStepIndex(0);
    setSteps([]);
    setCurrentStep(null);
    setPivotIndex(null);
    setComparingIndices([]);
    setSubarray([0, array.length - 1]);
    setOperationCount({ comparisons: 0, swaps: 0 });
    setStepCount(0);
    setStepDescription([
      `Reinitializing Array (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New array: ${newArray.join(', ')}`,
      `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
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

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newArray = generateArray(newCase);
    setArray(newArray);
    setIsSorting(false);
    setIsPaused(false);
    setStepIndex(0);
    setSteps([]);
    setCurrentStep(null);
    setPivotIndex(null);
    setComparingIndices([]);
    setSubarray([0, array.length - 1]);
    setOperationCount({ comparisons: 0, swaps: 0 });
    setStepCount(0);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New array: ${newArray.join(', ')}`,
      `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
    ]);
  };

  useEffect(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      setCurrentStep(step);
      setArray(step.array);
      setPivotIndex(step.pivotIndex);
      setComparingIndices(step.comparing || []);
      setSubarray([step.low, step.high]);
      setOperationCount((prev) => ({
        comparisons: prev.comparisons + (step.comparisons || 0),
        swaps: prev.swaps + (step.swaps || 0),
      }));

      if (step.type === 'pivot') {
        setStepDescription([
          `Step ${stepCount + 1}: Selecting pivot ${step.array[step.pivotIndex]} at index ${step.pivotIndex}`,
          `Subarray [${step.low}–${step.high}]: ${step.array.slice(step.low, step.high + 1).join(', ')}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
          `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
        ]);
      } else if (step.type === 'compare') {
        setStepDescription([
          `Step ${stepCount + 1}: Comparing ${step.array[step.j]} (index ${step.j}) with pivot ${step.array[step.pivotIndex]}`,
          `Subarray [${step.low}–${step.high}]: ${step.array.slice(step.low, step.high + 1).join(', ')}`,
          `i: ${step.i}, j: ${step.j}`,
          `Operations: ${operationCount.comparisons + step.comparisons} comparisons, ${operationCount.swaps} swaps`,
          `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
        ]);
      } else if (step.type === 'swap') {
        setStepDescription([
          `Step ${stepCount + 1}: Swapping ${step.array[step.i]} (index ${step.i}) with ${step.array[step.j]} (index ${step.j})`,
          `Subarray [${step.low}–${step.high}]: ${step.array.slice(step.low, step.high + 1).join(', ')}`,
          `i: ${step.i}, j: ${step.j}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps + step.swaps} swaps`,
          `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
        ]);
      } else if (step.type === 'place-pivot') {
        setStepDescription([
          `Step ${stepCount + 1}: Placing pivot ${step.array[step.pivotIndex]} at final position ${step.pivotIndex}`,
          `Subarray [${step.low}–${step.high}]: ${step.array.slice(step.low, step.high + 1).join(', ')}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps + step.swaps} swaps`,
          `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
        ]);
      }
    } else if (stepIndex === steps.length && steps.length > 0) {
      setStepDescription([
        `Quick Sort completed! Sorted array: ${array.join(', ')}`,
        `Total: ${stepCount} steps`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.swaps} swaps`,
        `Time: O(n log n) average, O(n²) worst, Space: O(log n)`,
      ]);
      setPivotIndex(null);
      setComparingIndices([]);
      setSubarray([0, array.length - 1]);
      setIsSorting(false);
      setIsPaused(false);
      clearInterval(intervalRef.current);
    }
  }, [stepIndex]);

  useEffect(() => {
    // Particle background
    const canvas = document.createElement('canvas');
    canvas.className = 'qs-particle-bg';
    document.querySelector('.qs-container')?.appendChild(canvas);
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
      className="qs-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="qs-title"
    >
      <section className="qs-header-section" aria-label="Quick Sort Header">
        <h1 id="qs-title" className="qs-animation-title">Quick Sort</h1>
        <p className="qs-animation-subtitle">Partition and conquer with elegance</p>
      </section>

      <section className="qs-visualization-section" aria-label="Array Visualization">
        <div className="qs-array-wrapper">
          <div className="qs-index-row">
            {array.map((_, idx) => (
              <div key={`index-${idx}`} className="qs-index-cell">{idx}</div>
            ))}
          </div>
          <div className="qs-value-row">
            {array.map((val, idx) => (
              <div key={`value-${idx}`} className="qs-value-cell">{val}</div>
            ))}
          </div>
          <AnimatePresence>
            <div className="qs-array-container">
              {array.map((value, index) => {
                const isPivot = index === pivotIndex;
                const isComparing = comparingIndices.includes(index);
                const isSorted = stepIndex >= steps.length && steps.length > 0;
                const isInSubarray = index >= subarray[0] && index <= subarray[1];
                const isLessThanPivot = currentStep && isComparing && value < array[pivotIndex];
                const isGreaterThanPivot = currentStep && isComparing && value > array[pivotIndex];
                return (
                  <motion.div
                    key={`bar-${index}-${value}`}
                    className={`qs-array-bar 
                      ${isPivot ? 'qs-pivot' : ''} 
                      ${isComparing ? 'qs-comparing' : ''} 
                      ${isSorted ? 'qs-sorted' : ''} 
                      ${isLessThanPivot ? 'qs-less' : ''} 
                      ${isGreaterThanPivot ? 'qs-greater' : ''}`}
                    layout
                    initial={{ height: 0, y: 20 }}
                    animate={{
                      height: `${Math.min(value * 1.5, 200)}px`,
                      opacity: isInSubarray || isSorted ? 1 : 0.3,
                      background: isSorted
                        ? 'var(--sorted)'
                        : isPivot
                        ? 'var(--pivot)'
                        : isLessThanPivot
                        ? 'var(--less)'
                        : isGreaterThanPivot
                        ? 'var(--greater)'
                        : isComparing
                        ? 'var(--comparing)'
                        : 'var(--bar-bg)',
                      scale: isPivot || isComparing ? 1.1 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                    whileHover={{ scale: 1.05 }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Value ${value} at index ${index}`}
                    onKeyDown={(e) => e.key === 'Enter' && alert(`Value ${value} at index ${index}`)}
                  >
                    {isComparing && (
                      <motion.div
                        className="qs-comparison-label"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {isLessThanPivot ? '<' : isGreaterThanPivot ? '>' : '='}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
              {currentStep && currentStep.subarray && (
                <>
                  <motion.div
                    className="qs-bracket qs-bracket-left"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ left: `${subarray[0] * 50}px` }}
                  >
                    [
                  </motion.div>
                  <motion.div
                    className="qs-bracket qs-bracket-right"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ left: `${(subarray[1] + 1) * 50 - 20}px` }}
                  >
                    ]
                  </motion.div>
                </>
              )}
            </div>
          </AnimatePresence>
        </div>
      </section>

      <section className="qs-info-section" aria-label="Algorithm Information">
        <div className="qs-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'qs-primary' : 'qs-secondary'}>{line}</p>
          ))}
        </div>
        <div className="qs-complexity-visuals">
          <motion.div
            className="qs-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Time Complexity: O(n log n)</h3>
            <motion.div
              className="qs-operation-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((operationCount.comparisons + operationCount.swaps) * 10, 200)}px` }}
              transition={{ duration: 0.5 }}
            />
            <p>{operationCount.comparisons} comparisons, {operationCount.swaps} swaps</p>
          </motion.div>
          <motion.div
            className="qs-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Space Complexity: O(log n)</h3>
            <motion.div
              className="qs-memory-bar"
              initial={{ width: 0 }}
              animate={{ width: `60px` }}
              transition={{ duration: 0.5 }}
            />
            <p>Recursion stack</p>
          </motion.div>
        </div>
        <div className="qs-timeline" role="progressbar" aria-label="Algorithm Progress">
          {Array.from({ length: Math.min(10, array.length * Math.log2(array.length)) }).map((_, idx) => (
            <motion.div
              key={idx}
              className="qs-timeline-marker"
              initial={{ opacity: 0 }}
              animate={{ opacity: stepCount > idx * 2 ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              title={`Step ${idx * 2 + 1}`}
            />
          ))}
          <motion.div
            className="qs-timeline-progress"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stepCount / (array.length * Math.log2(array.length))) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </section>

      <section className="qs-controls-section" aria-label="Animation Controls">
        <div className="qs-animation-controls">
          <motion.button
            className="qs-control-button qs-start-button"
            onClick={handleStart}
            disabled={isSorting && !isPaused}
            aria-label="Start Quick Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-cyan)' }}
            whileTap={{ scale: 0.95 }}
            title="Start the algorithm"
          >
            <PlayIcon className="qs-control-icon" />
            Start
          </motion.button>
          <motion.button
            className="qs-control-button qs-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isSorting}
            aria-label={isPaused ? 'Resume Sort' : 'Pause Sort'}
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-magenta)' }}
            whileTap={{ scale: 0.95 }}
            title={isPaused ? 'Resume the algorithm' : 'Pause the algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="qs-control-icon" />
            ) : (
              <PauseIcon className="qs-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          <motion.button
            className="qs-control-button qs-step-button"
            onClick={handleStep}
            disabled={isSorting && !isPaused}
            aria-label="Step Through Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-violet)' }}
            whileTap={{ scale: 0.95 }}
            title="Step through the algorithm"
          >
            <ArrowRightIcon className="qs-control-icon" />
            Step
          </motion.button>
          <motion.button
            className="qs-control-button qs-reset-button"
            onClick={handleReset}
            aria-label="Reset Array"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-purple)' }}
            whileTap={{ scale: 0.95 }}
            title="Reset the array"
          >
            <ArrowPathIcon className="qs-control-icon" />
            Reset
          </motion.button>
          <div className="qs-speed-control">
            <label htmlFor="qs-speed-select" className="qs-control-label">Speed:</label>
            <select
              id="qs-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="qs-control-dropdown"
              aria-label="Select Animation Speed"
              title="Adjust animation speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="qs-case-control">
            <label htmlFor="qs-case-select" className="qs-control-label">Case:</label>
            <select
              id="qs-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="qs-control-dropdown"
              aria-label="Select Case Type"
              title="Select array case type"
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

export default QuickSort;