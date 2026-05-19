import { useState, useEffect, useRef } from "react";
import "./SubsetSum.css";

const generateArray = (size = 8, caseType = "average") => {
  let arr, target;
  if (caseType === "best") {
    // Best Case: Subset exists early (e.g., first elements sum to target)
    arr = Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1);
    target = arr.slice(0, 3).reduce((sum, val) => sum + val, 0);
  } else if (caseType === "worst") {
    // Worst Case: No subset exists
    arr = Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1);
    target = arr.reduce((sum, val) => sum + val, 0) + 1;
  } else {
    // Average Case: Random, may or may not have subset
    arr = Array.from({ length: size }, () => Math.floor(Math.random() * 10) + 1);
    target = Math.floor(Math.random() * (arr.reduce((sum, val) => sum + val, 0) / 2)) + 1;
  }
  return { arr, target };
};

const SubsetSum = () => {
  const [{ arr: initialArray, target: initialTarget }, setArrayAndTarget] = useState(generateArray());
  const [array, setArray] = useState(initialArray);
  const [target, setTarget] = useState(initialTarget);
  const [isSolving, setIsSolving] = useState(false);
  const [included, setIncluded] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentSum, setCurrentSum] = useState(0);
  const [found, setFound] = useState(null);
  const [stepDescription, setStepDescription] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState(0);
  const [spaceUsage, setSpaceUsage] = useState(0); // Tracks recursion depth
  const [speed, setSpeed] = useState(2000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState("average");
  const intervalRef = useRef(null);
  const stateRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const subsetSumStep = async (arr, index, currentSum, includedIndices, recursionDepth) => {
    if (isPaused && !intervalRef.current) return false;
    setCurrentIndex(index);
    setCurrentSum(currentSum);
    setIncluded([...includedIndices]);
    setSpaceUsage(recursionDepth);

    if (currentSum === target) {
      setFound(true);
      setStepDescription([
        `Step ${stepCount + 1}: Found subset summing to ${target}!`,
        `Subset: [${includedIndices.map(i => arr[i]).join(", ")}]`,
        `Time Complexity: O(2^n) - ${operationCount + 1} operations`,
        `Space Complexity: O(n) - Recursion depth ${recursionDepth}`,
      ]);
      setStepCount((prev) => prev + 1);
      setIsSolving(false);
      return true;
    }

    if (index >= arr.length || currentSum > target) {
      setStepDescription([
        `Step ${stepCount + 1}: Backtracking at index ${index}, sum ${currentSum}`,
        `Sum exceeds target or end of array reached.`,
        `Time Complexity: O(2^n) - ${operationCount + 1} operations`,
        `Space Complexity: O(n) - Recursion depth ${recursionDepth}`,
      ]);
      setStepCount((prev) => prev + 1);
      setOperationCount((prev) => prev + 1);
      return false;
    }

    setStepDescription([
      `Step ${stepCount + 1}: Considering ${arr[index]} at index ${index}, current sum ${currentSum}`,
      `Deciding to include or exclude this element.`,
      `Time Complexity: O(2^n) - ${operationCount + 1} operations`,
      `Space Complexity: O(n) - Recursion depth ${recursionDepth}`,
    ]);
    setStepCount((prev) => prev + 1);
    setOperationCount((prev) => prev + 1);
    await delay(speed);

    // Include element
    if (await subsetSumStep(arr, index + 1, currentSum + arr[index], [...includedIndices, index], recursionDepth + 1)) {
      return true;
    }

    // Exclude element
    return await subsetSumStep(arr, index + 1, currentSum, includedIndices, recursionDepth + 1);
  };

  const handleSolve = async () => {
    if (isSolving) return;
    setIsSolving(true);
    setIsPaused(false);
    setStepDescription([
      `Starting Subset Sum (${caseType} case)...`,
      `Finding subset summing to ${target}.`,
      `Time Complexity: O(2^n) - Will track operations.`,
      `Space Complexity: O(n) - Will track recursion depth.`,
    ]);
    setStepCount(0);
    setOperationCount(0);
    setSpaceUsage(0);
    setIncluded([]);
    setCurrentIndex(null);
    setFound(null);
    const result = await subsetSumStep(array, 0, 0, [], 1);
    if (!isPaused && !result) {
      setFound(false);
      setStepDescription([
        `Step ${stepCount + 1}: No subset found summing to ${target}.`,
        `Backtracking complete with ${operationCount} operations.`,
        `Final Time Complexity: O(2^n)`,
        `Final Space Complexity: O(n)`,
      ]);
      setStepCount((prev) => prev + 1);
      setIsSolving(false);
    }
  };

  const handleStep = async () => {
    if (isSolving && !isPaused) return;
    setIsSolving(true);
    setIsPaused(true);
    if (!stateRef.current) {
      stateRef.current = { arr: [...array], index: 0, currentSum: 0, includedIndices: [], recursionDepth: 1, stack: [] };
    }
    let { arr, index, currentSum, includedIndices, recursionDepth, stack } = stateRef.current;

    if (currentSum === target) {
      setFound(true);
      setStepDescription([
        `Step ${stepCount + 1}: Found subset summing to ${target}!`,
        `Subset: [${includedIndices.map(i => arr[i]).join(", ")}]`,
        `Time Complexity: O(2^n) - ${operationCount + 1} operations`,
        `Space Complexity: O(n) - Recursion depth ${recursionDepth}`,
      ]);
      setStepCount((prev) => prev + 1);
      setIsSolving(false);
      setIsPaused(false);
      setCurrentIndex(null);
      setIncluded([...includedIndices]);
      setCurrentSum(currentSum);
      stateRef.current = null;
      return;
    }

    if (index >= arr.length || currentSum > target) {
      if (stack.length === 0) {
        setFound(false);
        setStepDescription([
          `Step ${stepCount + 1}: No subset found summing to ${target}.`,
          `Backtracking complete with ${operationCount} operations.`,
          `Final Time Complexity: O(2^n)`,
          `Final Space Complexity: O(n)`,
        ]);
        setStepCount((prev) => prev + 1);
        setIsSolving(false);
        setIsPaused(false);
        setCurrentIndex(null);
        stateRef.current = null;
        return;
      }
      ({ index, currentSum, includedIndices, recursionDepth } = stack.pop());
    }

    setCurrentIndex(index);
    setCurrentSum(currentSum);
    setIncluded([...includedIndices]);
    setSpaceUsage(recursionDepth);
    setStepDescription([
      `Step ${stepCount + 1}: Considering ${arr[index]} at index ${index}, current sum ${currentSum}`,
      `Deciding to include or exclude this element.`,
      `Time Complexity: O(2^n) - ${operationCount + 1} operations`,
      `Space Complexity: O(n) - Recursion depth ${recursionDepth}`,
    ]);
    setStepCount((prev) => prev + 1);
    setOperationCount((prev) => prev + 1);

    // Push exclude path to stack
    stack.push({ arr, index: index + 1, currentSum, includedIndices, recursionDepth: recursionDepth + 1 });
    // Proceed with include path
    stateRef.current = { arr, index: index + 1, currentSum: currentSum + arr[index], includedIndices: [...includedIndices, index], recursionDepth: recursionDepth + 1, stack };
  };

  const handlePauseResume = () => {
    if (!isSolving) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming from step ${stepCount + 1}...`,
        `Continuing backtracking for sum ${target}.`,
        `Time Complexity: O(2^n) - ${operationCount} operations`,
        `Space Complexity: O(n) - Recursion depth ${spaceUsage}`,
      ]);
      intervalRef.current = setInterval(() => handleStep(), speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}.`,
        `Click 'Step' to advance manually or 'Resume' to continue.`,
        `Time Complexity: O(2^n) - ${operationCount} operations`,
        `Space Complexity: O(n) - Recursion depth ${spaceUsage}`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const { arr: newArray, target: newTarget } = generateArray(8, caseType);
    setArray(newArray);
    setTarget(newTarget);
    setIsSolving(false);
    setIsPaused(false);
    setIncluded([]);
    setCurrentIndex(null);
    setFound(null);
    setStepDescription([
      `Array and target reset (${caseType} case).`,
      `Ready to start a new Subset Sum animation.`,
      `Time Complexity: O(2^n) - Will track operations.`,
      `Space Complexity: O(n) - Will track recursion depth.`,
    ]);
    setStepCount(0);
    setOperationCount(0);
    setSpaceUsage(0);
    stateRef.current = null;
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    if (isSolving && !isPaused) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => handleStep(), newSpeed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const { arr: newArray, target: newTarget } = generateArray(8, newCase);
    setArray(newArray);
    setTarget(newTarget);
    setIsSolving(false);
    setIsPaused(false);
    setIncluded([]);
    setCurrentIndex(null);
    setFound(null);
    setStepDescription([
      `Array set to ${newCase} case.`,
      `Ready to start Subset Sum animation.`,
      `Time Complexity: O(2^n) - Will track operations.`,
      `Space Complexity: O(n) - Will track recursion depth.`,
    ]);
    setStepCount(0);
    setOperationCount(0);
    setSpaceUsage(0);
    stateRef.current = null;
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="animation-container" role="region" aria-label="Subset Sum Visualization">
      <h2 className="animation-title">Subset Sum</h2>
      <p className="target-text" aria-label={`Target sum: ${target}`}>Target Sum: {target}</p>
      <p className="current-sum" aria-label={`Current sum: ${currentSum}`}>Current Sum: {currentSum}</p>
      <div className="step-description" aria-live="polite">
        {stepDescription.map((line, idx) => (
          <p key={idx} className={idx === 0 ? "primary" : "secondary"}>{line}</p>
        ))}
      </div>
      <div className="array-wrapper">
        <div className="index-row">
          {array.map((_, idx) => (
            <div key={idx} className="index-cell">{idx}</div>
          ))}
        </div>
        <div className="array-container">
          {array.map((val, idx) => (
            <div
              key={idx}
              className={`array-bar 
                ${idx === currentIndex ? "current" : ""} 
                ${included.includes(idx) ? "included" : ""} 
                ${found && included.includes(idx) ? "found" : ""}`}
              style={{ height: `${val * 20}px` }}
              aria-label={`Value ${val} at index ${idx}`}
            >
              <span className="bar-value">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="complexity-visuals">
        <div className="time-complexity">
          <p>Time Complexity: O(2^n)</p>
          <div className="operation-bar" style={{ width: `${Math.min(operationCount * 2, 200)}px` }} />
          <p>{operationCount} operations</p>
        </div>
        <div className="space-complexity">
          <p>Space Complexity: O(n)</p>
          <div className="memory-bar" style={{ width: `${spaceUsage * 20}px` }} />
          <p>Recursion depth: {spaceUsage}</p>
        </div>
      </div>
      <div className="animation-controls">
        <button
          className="control-button"
          onClick={handleSolve}
          disabled={isSolving && !isPaused}
          aria-label="Start Subset Sum"
        >
          Start Solve
        </button>
        <button
          className="control-button"
          onClick={handlePauseResume}
          disabled={!isSolving}
          aria-label={isPaused ? "Resume Solve" : "Pause Solve"}
        >
          {isPaused ? "Resume" : "Pause"}
        </button>
        <button
          className="control-button"
          onClick={handleStep}
          disabled={isSolving && !isPaused}
          aria-label="Step Through Solve"
        >
          Step
        </button>
        <button
          className="control-button reset-button"
          onClick={handleReset}
          aria-label="Reset Array"
        >
          Reset Array
        </button>
        <div className="speed-control">
          <label htmlFor="speed-select-subset" className="speed-label">
            Speed:
          </label>
          <select
            id="speed-select-subset"
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
          <label htmlFor="case-select-subset" className="case-label">
            Case:
          </label>
          <select
            id="case-select-subset"
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
      {found === true && (
        <p className="result-text success" aria-label={`Subset found summing to ${target}`}>
          Subset found: [{included.map(i => array[i]).join(", ")}] = {target}!
        </p>
      )}
      {found === false && (
        <p className="result-text error" aria-label={`No subset found summing to ${target}`}>
          No subset found summing to {target}!
        </p>
      )}
    </div>
  );
};

export default SubsetSum;