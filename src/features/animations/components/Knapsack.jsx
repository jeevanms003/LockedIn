import { useState, useEffect, useRef } from "react";
import "./GCDAlgorithm.css";

const generateNumbers = (caseType = "average") => {
  if (caseType === "best") {
    // Best: Equal numbers
    const num = Math.floor(Math.random() * 90) + 10;
    return [num, num];
  } else if (caseType === "worst") {
    // Worst: Fibonacci-like (max steps)
    return [89, 55]; // Fibonacci numbers
  } else {
    // Average: Random
    return [Math.floor(Math.random() * 90) + 10, Math.floor(Math.random() * 90) + 10];
  }
};

const GCDAlgorithm = () => {
  const [numbers, setNumbers] = useState(generateNumbers());
  const [isSolving, setIsSolving] = useState(false);
  const [currentNumbers, setCurrentNumbers] = useState(numbers);
  const [gcd, setGcd] = useState(null);
  const [stepDescription, setStepDescription] = useState([]);
  const [stepCount, setStepCount] = useState(0);
  const [operationCount, setOperationCount] = useState(0);
  const [spaceUsage, setSpaceUsage] = useState(0); // Constant space
  const [speed, setSpeed] = useState(2000);
  const [isPaused, setIsPaused] = useState(false);
  const [caseType, setCaseType] = useState("average");
  const intervalRef = useRef(null);
  const stateRef = useRef(null);

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const gcdStep = async () => {
    if (!stateRef.current) {
      stateRef.current = { a: numbers[0], b: numbers[1] };
    }
    let { a, b } = stateRef.current;

    if (b === 0) {
      setIsSolving(false);
      setGcd(a);
      setStepDescription([
        `Step ${stepCount + 1}: GCD found: ${a}`,
        `Euclidean Algorithm complete.`,
        `Time Complexity: O(log min(a,b)) - ${operationCount} operations`,
        `Space Complexity: O(1)`,
      ]);
      setStepCount((prev) => prev + 1);
      setCurrentNumbers([a, b]);
      stateRef.current = null;
      return;
    }

    setCurrentNumbers([a, b]);
    setSpaceUsage(1);
    setStepDescription([
      `Step ${stepCount + 1}: Computing ${a} mod ${b}`,
      `Dividing ${a} by ${b}, remainder becomes new b.`,
      `Time Complexity: O(log min(a,b)) - ${operationCount + 1} operations`,
      `Space Complexity: O(1)`,
    ]);
    setStepCount((prev) => prev + 1);
    setOperationCount((prev) => prev + 1);
    await delay(speed);

    const remainder = a % b;
    stateRef.current = { a: b, b: remainder };
  };

  const handleSolve = async () => {
    if (isSolving) return;
    setIsSolving(true);
    setIsPaused(false);
    setStepDescription([
      `Starting GCD Algorithm (${caseType} case)...`,
      `Computing GCD of ${numbers[0]} and ${numbers[1]}.`,
      `Time Complexity: O(log min(a,b)) - Will track operations.`,
      `Space Complexity: O(1)`,
    ]);
    setStepCount(0);
    setOperationCount(0);
    setSpaceUsage(0);
    setGcd(null);
    setCurrentNumbers(numbers);
    stateRef.current = null;
    intervalRef.current = setInterval(() => gcdStep(), speed);
  };

  const handleStep = async () => {
    if (isSolving && !isPaused) return;
    setIsSolving(true);
    setIsPaused(true);
    await gcdStep();
  };

  const handlePauseResume = () => {
    if (!isSolving) return;
    if (isPaused) {
      setIsPaused(false);
      setStepDescription([
        `Resuming from step ${stepCount + 1}...`,
        `Continuing GCD computation.`,
        `Time Complexity: O(log min(a,b)) - ${operationCount} operations`,
        `Space Complexity: O(1)`,
      ]);
      intervalRef.current = setInterval(() => gcdStep(), speed);
    } else {
      clearInterval(intervalRef.current);
      setIsPaused(true);
      setStepDescription([
        `Paused at step ${stepCount}.`,
        `Click 'Step' to advance manually or 'Resume' to continue.`,
        `Time Complexity: O(log min(a,b)) - ${operationCount} operations`,
        `Space Complexity: O(1)`,
      ]);
    }
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    const newNumbers = generateNumbers(caseType);
    setNumbers(newNumbers);
    setIsSolving(false);
    setIsPaused(false);
    setGcd(null);
    setCurrentNumbers(newNumbers);
    setStepDescription([
      `Numbers reset (${caseType} case).`,
      `Ready to start a new GCD animation.`,
      `Time Complexity: O(log min(a,b)) - Will track operations.`,
      `Space Complexity: O(1)`,
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
      intervalRef.current = setInterval(() => gcdStep(), speed);
    }
  };

  const handleCaseChange = (e) => {
    const newCase = e.target.value;
    setCaseType(newCase);
    clearInterval(intervalRef.current);
    const newNumbers = generateNumbers(newCase);
    setNumbers(newNumbers);
    setIsSolving(false);
    setIsPaused(false);
    setGcd(null);
    setCurrentNumbers(newNumbers);
    setStepDescription([
      `Numbers set to ${newCase} case.`,
      `Ready to start GCD animation.`,
      `Time Complexity: O(log min(a,b)) - Will track operations.`,
      `Space Complexity: O(1)`,
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
    <div className="animation-container" role="region" aria-label="GCD Algorithm Visualization">
      <h2 className="animation-title">GCD Algorithm</h2>
      <div className="step-description" aria-live="polite">
        {stepDescription.map((line, idx) => (
          <p key={idx} className={idx === 0 ? "primary" : "secondary"}>{line}</p>
        ))}
      </div>
      <div className="array-wrapper">
        <div className="array-container">
          {currentNumbers.map((val, idx) => (
            <div
              key={idx}
              className={`array-bar ${gcd && idx === 0 ? "gcd" : ""}`}
              style={{ height: `${val * 3}px`, width: "100px" }}
              aria-label={`Number ${val}`}
            >
              <span className="bar-value">{val}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="complexity-visuals">
        <div className="time-complexity">
          <p>Time Complexity: O(log min(a,b))</p>
          <div className="operation-bar" style={{ width: `${Math.min(operationCount * 10, 200)}px` }} />
          <p>{operationCount} operations</p>
        </div>
        <div className="space-complexity">
          <p>Space Complexity: O(1)</p>
          <div className="memory-bar" style={{ width: `${spaceUsage * 20}px` }} />
          <p>Space usage: {spaceUsage}</p>
        </div>
      </div>
      <div className="animation-controls">
        <button
          className="control-button"
          onClick={handleSolve}
          disabled={isSolving && !isPaused}
          aria-label="Start GCD"
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
          aria-label="Reset Numbers"
        >
          Reset Numbers
        </button>
        <div className="speed-control">
          <label htmlFor="speed-select-gcd" className="speed-label">
            Speed:
          </label>
          <select
            id="speed-select-gcd"
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
          <label htmlFor="case-select-gcd" className="case-label">
            Case:
          </label>
          <select
            id="case-select-gcd"
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
      {gcd && (
        <p className="result-text success" aria-label={`GCD: ${gcd}`}>
          GCD: {gcd}
        </p>
      )}
    </div>
  );
};

export default GCDAlgorithm;