import React, { useState, useEffect, useRef } from "react";

const KnightTourVisualizer = () => {
    const [boardSize, setBoardSize] = useState(8);
    const [path, setPath] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [running, setRunning] = useState(false);
    const [cellSize, setCellSize] = useState(48);

    const boardContainerRef = useRef(null);

    useEffect(() => {
        function updateCellSize() {

            let containerWidth = window.innerWidth - 40;
            if (boardContainerRef.current) {
                containerWidth = boardContainerRef.current.clientWidth || containerWidth;
            }

            const verticalPadding = 200; 
            const availableHeight = window.innerHeight - verticalPadding;

            const maxCellSize = 48;

            const maxCellSizeHorizontal = Math.floor(containerWidth / boardSize);
            const maxCellSizeVertical = Math.floor(availableHeight / boardSize);

            const newCellSize = Math.min(maxCellSize, maxCellSizeHorizontal, maxCellSizeVertical);

            setCellSize(newCellSize);
        }

        updateCellSize();

        let resizeObserver;
        if (boardContainerRef.current && window.ResizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                updateCellSize();
            });
            resizeObserver.observe(boardContainerRef.current);
        }

        window.addEventListener("resize", updateCellSize);

        return () => {
            window.removeEventListener("resize", updateCellSize);
            if (resizeObserver && boardContainerRef.current) {
                resizeObserver.unobserve(boardContainerRef.current);
            }
        };
    }, [boardSize]);

    const moves = [
        [2, 1], [1, 2], [-1, 2], [-2, 1],
        [-2, -1], [-1, -2], [1, -2], [2, -1],
    ];

    const isValid = (x, y, visited) => (
        x >= 0 && y >= 0 && x < boardSize && y < boardSize && !visited[x][y]
    );

    const countOnwardMoves = (x, y, visited) => {
        let count = 0;
        for (const [dx, dy] of moves) {
            if (isValid(x + dx, y + dy, visited)) count++;
        }
        return count;
    };

    const solve = (x, y, moveCount, visited, pathSoFar) => {
        visited[x][y] = true;
        pathSoFar.push([x, y]);

        if (moveCount === boardSize * boardSize - 1) {
            return true;
        }

        const nextMoves = [];
        for (const [dx, dy] of moves) {
            const nx = x + dx;
            const ny = y + dy;
            if (isValid(nx, ny, visited)) {
                nextMoves.push({ pos: [nx, ny], onward: countOnwardMoves(nx, ny, visited) });
            }
        }
        nextMoves.sort((a, b) => a.onward - b.onward);

        for (const next of nextMoves) {
            if (solve(next.pos[0], next.pos[1], moveCount + 1, visited, pathSoFar)) {
                return true;
            }
        }

        visited[x][y] = false;
        pathSoFar.pop();
        return false;
    };

    const startTour = () => {
        const visited = Array(boardSize).fill(null).map(() => Array(boardSize).fill(false));
        const newPath = [];
        const success = solve(0, 0, 0, visited, newPath);
        if (success) {
            setPath(newPath);
            setCurrentStep(0);
            setRunning(true);
        } else {
            alert("No knight's tour found.");
        }
    };

    useEffect(() => {
        if (!running) return;
        if (currentStep >= path.length) {
            setRunning(false);
            return;
        }
        const timer = setTimeout(() => {
            setCurrentStep(step => step + 1);
        }, 400);
        return () => clearTimeout(timer);
    }, [running, currentStep, path]);


    const renderBoard = () => {
        const knightPos = path[currentStep - 1] || path[0];
        return Array.from({ length: boardSize }).flatMap((_, row) =>
            Array.from({ length: boardSize }).map((_, col) => {
                const isKnightHere = knightPos && knightPos[0] === row && knightPos[1] === col;
                const moveNumberIndex = path.findIndex(([x, y]) => x === row && y === col);
                const visited = moveNumberIndex >= 0 && moveNumberIndex < currentStep;

                return (
                    <div
                        key={`${row}-${col}`}
                        className={`border border-black flex items-center justify-center font-bold 
              ${visited ? "bg-green-500 text-white" : "bg-white text-transparent"}
              ${isKnightHere ? "text-black" : ""}
            `}
                        style={{ width: cellSize, height: cellSize, fontSize: isKnightHere ? cellSize * 0.6 : cellSize * 0.3 }}
                    >
                        {isKnightHere ? "♞" : visited ? moveNumberIndex : ""}
                    </div>
                );
            })
        );
    };

    return (
        <div className="flex flex-col font-sans p-4 max-w-full">
            <h1 className="text-3xl font-bold mb-5">Knight's Tour Visualizer</h1>
            <div className="mb-4 flex items-center space-x-4">
                <label className="text-lg font-medium">
                    Board Size (5–20):{" "}
                    <input
                        type="number"
                        min={5}
                        max={20}
                        value={boardSize}
                        onChange={(e) => setBoardSize(Number(e.target.value))}
                        disabled={running}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                </label>
                <button
                    onClick={startTour}
                    disabled={running}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    Start Tour
                </button>
            </div>
            <div
                ref={boardContainerRef}
                className="grid border-black w-full max-w-full"
                style={{ gridTemplateColumns: `repeat(${boardSize}, ${cellSize}px)` }}
            >
                {renderBoard()}
            </div>
        </div>
    );
};

export default KnightTourVisualizer;