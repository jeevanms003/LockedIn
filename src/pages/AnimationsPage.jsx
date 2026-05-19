import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, ChartBarIcon, CommandLineIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import BubbleSort from '@/features/animations/components/BubbleSort';
import QuickSort from '@/features/animations/components/QuickSort';
import BinarySearch from '@/features/animations/components/BinarySearch';
import MergeSort from '@/features/animations/components/MergeSort';
import SubsetSum from '@/features/animations/components/SubsetSum';
import Dijkstra from '@/features/animations/components/Dijkstra';
import KruskalsAlgorithm from '@/features/animations/components/KruskalsAlgorithm';
import PrimsAlgorithm from '@/features/animations/components/PrimsAlgorithm';
import TopologicalSort from '@/features/animations/components/TopologicalSort';
import Knapsack01 from '@/features/animations/components/Knapsack01';
import FloydWarshall from '@/features/animations/components/FloydWarshall';
import BellmanFord from '@/features/animations/components/BellmanFord';
import DFS from '@/features/animations/components/DFS';
import BFS from '@/features/animations/components/BFS'; // Added import
import './AnimationsPage.css';

const AnimationsPage = () => {
  const [selectedAnimation, setSelectedAnimation] = useState('bubble');

  const animations = {
    bubble: { component: BubbleSort, title: 'Bubble Sort' },
    quick: { component: QuickSort, title: 'Quick Sort' },
    binary: { component: BinarySearch, title: 'Binary Search' },
    merge: { component: MergeSort, title: 'Merge Sort' },
    subset: { component: SubsetSum, title: 'Subset Sum' },
    dijkstra: { component: Dijkstra, title: "Dijkstra's Algorithm" },
    kruskal: { component: KruskalsAlgorithm, title: "Kruskal's Algorithm" },
    prim: { component: PrimsAlgorithm, title: "Prim's Algorithm" },
    topological: { component: TopologicalSort, title: 'Topological Sort' },
    knapsack: { component: Knapsack01, title: '0/1 Knapsack' },
    floydwarshall: { component: FloydWarshall, title: 'Floyd-Warshall Algorithm' },
    bellmanford: { component: BellmanFord, title: 'Bellman-Ford Algorithm' },
    dfs: { component: DFS, title: 'Depth-First Search (DFS)' },
    bfs: { component: BFS, title: 'Breadth-First Search (BFS)' }, // Added BFS
  };

  const SelectedAnimation = animations[selectedAnimation]?.component || (() => <div>Animation not found</div>);

  return (
    <motion.div
      className="animations-page"
      data-theme={document.documentElement.getAttribute("data-theme") || "dark"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      aria-labelledby="animations-title"
    >
      <div className="floating-icons" aria-hidden="true">
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="3" />
            <path d="M12 7 L9 10 M12 7 L15 10" />
            <circle cx="9" cy="13" r="3" />
            <circle cx="15" cy="13" r="3" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="6" width="4" height="12" />
            <rect x="10" y="6" width="4" height="12" />
            <rect x="16" y="6" width="4" height="12" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <path d="M7 8 L3 12 L7 16 M17 8 L21 12 L17 16" />
          </svg>
        </div>
        <div className="floating-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="6" cy="12" r="3" />
            <circle cx="12" cy="12" r="3" />
            <circle cx="18" cy="12" r="3" />
            <path d="M9 12 H11 M15 12 H17" />
          </svg>
        </div>
      </div>
      <header className="animations-header" aria-label="Animations header">
        <motion.div
          className="header-left"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="animations-title-wrapper">
            <CommandLineIcon className="title-icon" aria-hidden="true" />
            <h1 id="animations-title" className="animations-title">Algorithm Animations</h1>
          </div>
          <Link
            to="/"
            className="back-button"
            aria-label="Back to Home"
          >
            <ArrowLeftIcon className="back-icon" />
            Back
          </Link>
        </motion.div>
      </header>
      <section className="animations-content" aria-label="Animations Content">
        <motion.div
          className="animation-selector"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          role="group"
          aria-label="Animation Selection"
        >
          <select
            id="animation-select"
            value={selectedAnimation}
            onChange={(e) => setSelectedAnimation(e.target.value)}
            className="category-dropdown"
            aria-label="Select Algorithm Animation"
          >
            {Object.entries(animations).map(([key, { title }]) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </select>
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAnimation}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="animation-wrapper"
          >
            <SelectedAnimation />
          </motion.div>
        </AnimatePresence>
      </section>
    </motion.div>
  );
};

export default AnimationsPage;