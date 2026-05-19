import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  ArrowRightIcon,
  ArrowPathIcon,
  ArrowDownIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/solid';
import './MergeSort.css';

// Generate array for sorting
const generateArray = (caseType = 'average', size = 10) => {
  if (caseType === 'best') {
    return Array.from({ length: size }, (_, i) => (i + 1) * 10); // [10, 20, ..., 100]
  } else if (caseType === 'worst') {
    return Array.from({ length: size }, (_, i) => (size - i) * 10); // [100, 90, ..., 10]
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10); // Random [10-100]
};

const MergeSort = () => {
  const [array, setArray] = useState(generateArray());
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [operationCount, setOperationCount] = useState({ comparisons: 0, copies: 0 });
  const [stepDescription, setStepDescription] = useState(['Click "Start" to begin Merge Sort']);
  const [stepCount, setStepCount] = useState(0);
  const [speed, setSpeed] = useState(1000);
  const [caseType, setCaseType] = useState('average');
  const [comparing, setComparing] = useState([]); // Track indices being compared
  const intervalRef = useRef(null);

  const mergeSort = (arr, start, end, steps) => {
    if (start < end) {
      const mid = Math.floor((start + end) / 2);
      // Record divide step
      steps.push({
        type: 'divide',
        left: { indices: [start, mid], values: arr.slice(start, mid + 1) },
        right: { indices: [mid + 1, end], values: arr.slice(mid + 1, end + 1) },
        array: [...arr],
      });
      mergeSort(arr, start, mid, steps);
      mergeSort(arr, mid + 1, end, steps);
      merge(arr, start, mid, end, steps);
    }
  };

  const merge = (arr, start, mid, end, steps) => {
    const left = arr.slice(start, mid + 1);
    const right = arr.slice(mid + 1, end + 1);
    let step = {
      type: 'merge',
      left: { indices: [start, mid], values: [...left] },
      right: { indices: [mid + 1, end], values: [...right] },
      merged: { indices: [start, end], values: [] },
      comparisons: 0,
      copies: 0,
      comparing: [],
      array: [...arr],
    };
    steps.push(step);
    let i = 0,
      j = 0,
      k = start;
    while (i < left.length && j < right.length) {
      step.comparisons += 1;
      step.comparing = [start + i, mid + 1 + j];
      steps.push({ ...step, type: 'compare', array: [...arr] });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        step.merged.values.push({ index: k, value: left[i] });
        step.copies += 1;
        i++;
      } else {
        arr[k] = right[j];
        step.merged.values.push({ index: k, value: right[j] });
        step.copies += 1;
        j++;
      }
      k++;
      steps.push({ ...step, type: 'merge', array: [...arr], comparing: [] });
    }
    while (i < left.length) {
      arr[k] = left[i];
      step.merged.values.push({ index: k, value: left[i] });
      step.copies += 1;
      i++;
      k++;
      steps.push({ ...step, type: 'merge', array: [...arr], comparing: [] });
    }
    while (j < right.length) {
      arr[k] = right[j];
      step.merged.values.push({ index: k, value: right[j] });
      step.copies += 1;
      j++;
      k++;
      steps.push({ ...step, type: 'merge', array: [...arr], comparing: [] });
    }
    step.array = [...arr];
  };

  const handleStart = () => {
    if (isSorting) return;
    setIsSorting(true);
    setIsPaused(false);
    setStepIndex(0);
    setStepCount(0);
    setOperationCount({ comparisons: 0, copies: 0 });
    setComparing([]);
    setStepDescription([
      `Starting Merge Sort (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `Array: ${array.join(', ')}`,
      `Time: O(n log n), Space: O(n)`,
    ]);
    const newSteps = [];
    const tempArray = [...array];
    mergeSort(tempArray, 0, array.length - 1, newSteps);
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
      mergeSort(tempArray, 0, array.length - 1, newSteps);
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
        `Resuming Merge Sort at step ${stepIndex + 1}`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.copies} copies`,
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
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.copies} copies`,
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
    setComparing([]);
    setOperationCount({ comparisons: 0, copies: 0 });
    setStepCount(0);
    setStepDescription([
      `Reinitializing Array (${caseType.charAt(0).toUpperCase() + caseType.slice(1)} Case)`,
      `New array: ${newArray.join(', ')}`,
      `Time: O(n log n), Space: O(n)`,
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
    setComparing([]);
    setOperationCount({ comparisons: 0, copies: 0 });
    setStepCount(0);
    setStepDescription([
      `${newCase.charAt(0).toUpperCase() + newCase.slice(1)} Case selected`,
      `New array: ${newArray.join(', ')}`,
      `Time: O(n log n), Space: O(n)`,
    ]);
  };

  useEffect(() => {
    if (stepIndex < steps.length) {
      const step = steps[stepIndex];
      setCurrentStep(step);
      setComparing(step.comparing || []);
      setOperationCount((prev) => ({
        comparisons: prev.comparisons + (step.comparisons || 0),
        copies: prev.copies + (step.copies || 0),
      }));
      if (step.type === 'divide') {
        setStepDescription([
          `Step ${stepCount + 1}: Dividing array`,
          `Left half [${step.left.indices[0]}–${step.left.indices[1]}]: ${step.left.values.join(', ')}`,
          `Right half [${step.right.indices[0]}–${step.right.indices[1]}]: ${step.right.values.join(', ')}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.copies} copies`,
          `Time: O(n log n), Space: O(n)`,
        ]);
      } else if (step.type === 'compare') {
        setStepDescription([
          `Step ${stepCount + 1}: Comparing ${array[step.comparing[0]]} (index ${step.comparing[0]}) and ${array[step.comparing[1]]} (index ${step.comparing[1]})`,
          `Left half: ${step.left.values.join(', ')}`,
          `Right half: ${step.right.values.join(', ')}`,
          `Operations: ${operationCount.comparisons + (step.comparisons || 0)} comparisons, ${operationCount.copies} copies`,
          `Time: O(n log n), Space: O(n)`,
        ]);
      } else if (step.type === 'merge') {
        setStepDescription([
          `Step ${stepCount + 1}: Merging elements`,
          `Merged so far: [${step.merged.values.map((v) => v.value).join(', ')}]`,
          `Left half: ${step.left.values.join(', ')}`,
          `Right half: ${step.right.values.join(', ')}`,
          `Operations: ${operationCount.comparisons} comparisons, ${operationCount.copies + (step.copies || 0)} copies`,
          `Time: O(n log n), Space: O(n)`,
        ]);
      }
      setArray(step.array);
    } else if (stepIndex === steps.length && steps.length > 0) {
      setStepDescription([
        `Merge Sort completed! Sorted array: ${array.join(', ')}`,
        `Total: ${stepCount} steps`,
        `Operations: ${operationCount.comparisons} comparisons, ${operationCount.copies} copies`,
        `Time: O(n log n), Space: O(n)`,
      ]);
      setComparing([]);
      setIsSorting(false);
      setIsPaused(false);
      clearInterval(intervalRef.current);
    }
  }, [stepIndex]);

  useEffect(() => {
    // Particle background
    const canvas = document.createElement('canvas');
    canvas.className = 'ms-particle-bg';
    document.querySelector('.ms-container')?.appendChild(canvas);
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
      className="ms-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="ms-title"
    >
      <section className="ms-header-section" aria-label="Merge Sort Header">
        <h1 id="ms-title" className="ms-animation-title">Merge Sort</h1>
        <p className="ms-animation-subtitle">Divide, conquer, and merge with elegance</p>
      </section>

      <section className="ms-visualization-section" aria-label="Array Visualization">
        <div className="ms-array-wrapper">
          <div className="ms-index-row">
            {array.map((_, idx) => (
              <div key={`index-${idx}`} className="ms-index-cell">{idx}</div>
            ))}
          </div>
          <div className="ms-value-row">
            {array.map((val, idx) => (
              <div key={`value-${idx}`} className="ms-value-cell">{val}</div>
            ))}
          </div>
          <AnimatePresence>
            <div className="ms-array-container">
              {array.map((value, index) => {
                const isLeft =
                  currentStep &&
                  currentStep.left &&
                  index >= currentStep.left.indices[0] &&
                  index <= currentStep.left.indices[1];
                const isRight =
                  currentStep &&
                  currentStep.right &&
                  index >= currentStep.right.indices[0] &&
                  index <= currentStep.right.indices[1];
                const isMerged =
                  currentStep &&
                  currentStep.merged &&
                  currentStep.merged.values.some((v) => v.index === index);
                const isComparing = comparing.includes(index);
                const isSorted = stepIndex >= steps.length && steps.length > 0;
                const isDividing = currentStep && currentStep.type === 'divide';
                return (
                  <motion.div
                    key={`bar-${index}-${value}`}
                    className={`ms-array-bar 
                      ${isLeft ? 'ms-left' : ''} 
                      ${isRight ? 'ms-right' : ''} 
                      ${isMerged ? 'ms-merged' : ''} 
                      ${isComparing ? 'ms-comparing' : ''} 
                      ${isSorted ? 'ms-sorted' : ''}`}
                    layout
                    initial={{ height: 0, y: 20 }}
                    animate={{
                      height: `${Math.min(value * 1.5, 200)}px`,
                      x: isDividing
                        ? isLeft
                          ? -20 * (currentStep.left.indices[1] - index + 1)
                          : isRight
                          ? 20 * (index - currentStep.right.indices[0] + 1)
                          : 0
                        : 0,
                      background: isSorted
                        ? 'var(--sorted)'
                        : isMerged
                        ? 'var(--merged)'
                        : isComparing
                        ? 'var(--comparing)'
                        : isLeft
                        ? 'var(--left)'
                        : isRight
                        ? 'var(--right)'
                        : 'var(--bar-bg)',
                      scale: isMerged || isComparing ? 1.1 : 1,
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
                        className="ms-comparison-arrow"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {comparing[0] === index ? (
                          <ArrowDownIcon className="ms-arrow-icon" />
                        ) : (
                          <ArrowUpIcon className="ms-arrow-icon" />
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        </div>
      </section>

      <section className="ms-info-section" aria-label="Algorithm Information">
        <div className="ms-step-description" aria-live="polite">
          {stepDescription.map((line, idx) => (
            <p key={idx} className={idx === 0 ? 'ms-primary' : 'ms-secondary'}>{line}</p>
          ))}
        </div>
        <div className="ms-complexity-visuals">
          <motion.div
            className="ms-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Time Complexity: O(n log n)</h3>
            <motion.div
              className="ms-operation-bar"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((operationCount.comparisons + operationCount.copies) * 10, 200)}px` }}
              transition={{ duration: 0.5 }}
            />
            <p>{operationCount.comparisons} comparisons, {operationCount.copies} copies</p>
          </motion.div>
          <motion.div
            className="ms-complexity-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Space Complexity: O(n)</h3>
            <motion.div
              className="ms-memory-bar"
              initial={{ width: 0 }}
              animate={{ width: `60px` }}
              transition={{ duration: 0.5 }}
            />
            <p>Temporary arrays for merging</p>
          </motion.div>
        </div>
        <div className="ms-timeline" role="progressbar" aria-label="Algorithm Progress">
          {Array.from({ length: Math.min(10, array.length * Math.log2(array.length)) }).map((_, idx) => (
            <motion.div
              key={idx}
              className="ms-timeline-marker"
              initial={{ opacity: 0 }}
              animate={{ opacity: stepCount > idx * 2 ? 1 : 0.3 }}
              transition={{ duration: 0.3 }}
              title={`Step ${idx * 2 + 1}`}
            />
          ))}
          <motion.div
            className="ms-timeline-progress"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((stepCount / (array.length * Math.log2(array.length))) * 100, 100)}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </section>

      <section className="ms-controls-section" aria-label="Animation Controls">
        <div className="ms-animation-controls">
          <motion.button
            className="ms-control-button ms-start-button"
            onClick={handleStart}
            disabled={isSorting && !isPaused}
            aria-label="Start Merge Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-cyan)' }}
            whileTap={{ scale: 0.95 }}
            title="Start the algorithm"
          >
            <PlayIcon className="ms-control-icon" />
            Start
          </motion.button>
          <motion.button
            className="ms-control-button ms-pause-resume-button"
            onClick={handlePauseResume}
            disabled={!isSorting}
            aria-label={isPaused ? 'Resume Sort' : 'Pause Sort'}
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-magenta)' }}
            whileTap={{ scale: 0.95 }}
            title={isPaused ? 'Resume the algorithm' : 'Pause the algorithm'}
          >
            {isPaused ? (
              <PlayIcon className="ms-control-icon" />
            ) : (
              <PauseIcon className="ms-control-icon" />
            )}
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>
          <motion.button
            className="ms-control-button ms-step-button"
            onClick={handleStep}
            disabled={isSorting && !isPaused}
            aria-label="Step Through Sort"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-violet)' }}
            whileTap={{ scale: 0.95 }}
            title="Step through the algorithm"
          >
            <ArrowRightIcon className="ms-control-icon" />
            Step
          </motion.button>
          <motion.button
            className="ms-control-button ms-reset-button"
            onClick={handleReset}
            aria-label="Reset Array"
            whileHover={{ scale: 1.08, boxShadow: '0 0 12px var(--accent-purple)' }}
            whileTap={{ scale: 0.95 }}
            title="Reset the array"
          >
            <ArrowPathIcon className="ms-control-icon" />
            Reset
          </motion.button>
          <div className="ms-speed-control">
            <label htmlFor="ms-speed-select" className="ms-control-label">Speed:</label>
            <select
              id="ms-speed-select"
              value={speed}
              onChange={handleSpeedChange}
              className="ms-control-dropdown"
              aria-label="Select Animation Speed"
              title="Adjust animation speed"
            >
              <option value={3000}>Very Slow (3s)</option>
              <option value={2000}>Slow (2s)</option>
              <option value={1000}>Medium (1s)</option>
              <option value={500}>Fast (0.5s)</option>
            </select>
          </div>
          <div className="ms-case-control">
            <label htmlFor="ms-case-select" className="ms-control-label">Case:</label>
            <select
              id="ms-case-select"
              value={caseType}
              onChange={handleCaseChange}
              className="ms-control-dropdown"
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

export default MergeSort;