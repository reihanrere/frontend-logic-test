'use client';

import {useState, useEffect, useCallback, JSX} from 'react';
import {ArrowDown, ArrowLeft, ArrowRight, ArrowUp} from "lucide-react";

const GRID_SIZE = 6;
const GAME_DURATION = 60;

interface Position {
    x: number;
    y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

const OBSTACLES: Position[] = [
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
    { x: 1, y: 2 },
    { x: 4, y: 3 },
    { x: 1, y: 4 }, { x: 4, y: 4 },
];

export default function Home(): JSX.Element {
    const [bluePos, setBluePos] = useState<Position>({ x: 0, y: 5 });
    const [yellowPos, setYellowPos] = useState<Position>({ x: 0, y: 3 });
    const [score, setScore] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(GAME_DURATION);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);

    const isObstacle = (x: number, y: number): boolean => {
        return OBSTACLES.some(obs => obs.x === x && obs.y === y);
    };

    const isValidPosition = (x: number, y: number): boolean => {
        return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && !isObstacle(x, y);
    };

    const generateRandomYellowPos = useCallback((currentBluePos: Position): Position => {
        let newPos: Position;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            newPos = {
                x: Math.floor(Math.random() * GRID_SIZE),
                y: Math.floor(Math.random() * GRID_SIZE)
            };
            attempts++;
        } while (
            ((newPos.x === currentBluePos.x && newPos.y === currentBluePos.y) ||
                isObstacle(newPos.x, newPos.y)) &&
            attempts < maxAttempts
            );

        return newPos;
    }, []);

    useEffect(() => {
        if (gameStarted && !gameOver && bluePos.x === yellowPos.x && bluePos.y === yellowPos.y) {
            setScore(prev => prev + 1);
            setYellowPos(generateRandomYellowPos(bluePos));
        }
    }, [bluePos, yellowPos, gameStarted, gameOver, generateRandomYellowPos]);

    useEffect(() => {
        if (gameStarted && !gameOver && timeLeft > 0) {
            const timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && gameStarted) {
            setGameOver(true);
        }
    }, [timeLeft, gameStarted, gameOver]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent): void => {
            if (!gameStarted || gameOver) return;

            let newPos: Position = { ...bluePos };

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    newPos.y -= 1;
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    newPos.y += 1;
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    newPos.x -= 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    newPos.x += 1;
                    break;
                default:
                    return;
            }

            if (isValidPosition(newPos.x, newPos.y)) {
                setBluePos(newPos);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [bluePos, gameStarted, gameOver]);

    const moveBlue = (direction: Direction): void => {
        if (!gameStarted || gameOver) return;

        let newPos: Position = { ...bluePos };

        switch(direction) {
            case 'up':
                newPos.y -= 1;
                break;
            case 'down':
                newPos.y += 1;
                break;
            case 'left':
                newPos.x -= 1;
                break;
            case 'right':
                newPos.x += 1;
                break;
        }

        if (isValidPosition(newPos.x, newPos.y)) {
            setBluePos(newPos);
        }
    };

    const startGame = (): void => {
        setGameStarted(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(GAME_DURATION);
        const initialBluePos: Position = { x: 0, y: 5 };
        setBluePos(initialBluePos);
        setYellowPos(generateRandomYellowPos(initialBluePos));
    };

    const restartGame = (): void => {
        startGame();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-red-800 rounded-3xl p-6 shadow-2xl">
                    <div className="bg-white rounded-lg mb-4">
                        <div className="grid grid-cols-6">
                            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                                const x = index % GRID_SIZE;
                                const y = Math.floor(index / GRID_SIZE);
                                const isBlue = bluePos.x === x && bluePos.y === y && gameStarted && !gameOver;
                                const isYellow = yellowPos.x === x && yellowPos.y === y && gameStarted && !gameOver;
                                const isWall = isObstacle(x, y);

                                return (
                                    <div
                                        key={index}
                                        className={`aspect-square ${
                                            isWall ? 'bg-red-900' :
                                                isBlue ? 'bg-blue-500 border-[1px] border-black' :
                                                    isYellow ? 'bg-yellow-400 border-[1px] border-black' :
                                                        'bg-white border-[1px] border-black'
                                        } transition-colors duration-150`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-white font-bold text-xl mb-6">
                        <div>{formatTime(timeLeft)}</div>
                        <div>Total: {score}</div>
                    </div>

                    {(!gameStarted || gameOver) && (
                        <div className="mb-6 text-center">
                            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6 mb-4">
                                {gameOver ? (
                                    <>
                                        <h2 className="text-red-800 text-2xl font-bold mb-2">Game Over!</h2>
                                        <p className="text-red-800 text-xl mb-4">Final Score: {score}</p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-red-800 text-2xl font-bold mb-2">Tile Chase Game</h2>
                                        <p className="text-red-800 text-sm mb-2">Collect yellow tiles while avoiding walls!</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={gameOver ? restartGame : startGame}
                                className="bg-white text-red-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                {gameOver ? 'Play Again' : 'Start Game'}
                            </button>
                        </div>
                    )}

                    {gameStarted && !gameOver && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                onClick={() => moveBlue('up')}
                                className="w-10 h-10 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg active:scale-95 transition-transform"
                            >
                                <ArrowUp/>
                            </button>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => moveBlue('left')}
                                    className="w-10 h-10 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg active:scale-95 transition-transform"
                                >
                                    <ArrowLeft/>
                                </button>
                                <div></div>
                                <button
                                    onClick={() => moveBlue('right')}
                                    className="w-10 h-10 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg active:scale-95 transition-transform"
                                >
                                    <ArrowRight/>
                                </button>
                            </div>
                            <button
                                onClick={() => moveBlue('down')}
                                className="w-10 h-10 bg-gray-600 hover:bg-gray-500 text-white rounded-lg flex items-center justify-center font-bold text-2xl shadow-lg active:scale-95 transition-transform"
                            >
                                <ArrowDown/>
                            </button>
                        </div>
                    )}

                    {gameStarted && !gameOver && (
                        <div className="mt-6 text-center text-white text-sm opacity-75">
                            Use arrow keys or buttons to move the blue tile
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}