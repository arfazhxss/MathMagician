'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface FallingEquation {
    id: number
    equation: string
    answer: number
    x: number
    y: number
    speed: number
    color: string
}

type Level = 1 | 2 | 3

const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
]

const evaluateExpression = (a: number, b: number, c: number, op1: string, op2: string): number => {
    const operations = {
        '+': (x: number, y: number) => x + y,
        '-': (x: number, y: number) => x - y,
        '×': (x: number, y: number) => x * y,
        '÷': (x: number, y: number) => Math.round(x / y)
    };

    let result = operations[op1 as keyof typeof operations](a, b);
    result = operations[op2 as keyof typeof operations](result, c);
    return Math.round(result);
};

export default function Component() {
    const [equations, setEquations] = useState<FallingEquation[]>([])
    const [input, setInput] = useState('')
    const [matchedId, setMatchedId] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState<Level>(1)
    const [timeLeft, setTimeLeft] = useState(30) // Updated initial timeLeft
    const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "ended">("waiting")
    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
    const soundEffectsRef = useRef<{ [key: string]: HTMLAudioElement }>({})

    useEffect(() => {
        try {
            backgroundAudioRef.current = new Audio('/sounds/background-music.mp3')
            backgroundAudioRef.current.onerror = () => {
                console.error('Failed to load background music')
            }
            backgroundAudioRef.current.loop = true

            soundEffectsRef.current = {
                correctAnswer: new Audio('/sounds/correct-answer.mp3'),
                levelUp: new Audio('/sounds/level-up.mp3'),
                gameOver: new Audio('/sounds/game-over.mp3')
            }

            Object.entries(soundEffectsRef.current).forEach(([key, audio]) => {
                audio.onerror = () => {
                    console.error(`Failed to load sound effect: ${key}`)
                }
            })
        } catch (error) {
            console.error('Error initializing audio:', error)
        }
    }, [])

    const playSound = (soundName: string) => {
        if (soundEffectsRef.current[soundName]) {
            soundEffectsRef.current[soundName].play().catch(error => {
                console.error(`Error playing ${soundName}:`, error)
            })
        } else {
            console.error(`Sound not found: ${soundName}`)
        }
    }

    const getLevelConfig = useCallback((level: Level) => {
        switch (level) {
            case 1: return { time: 60 };
            case 2: return { time: 120 };
            case 3: return { time: 60 };
        }
    }, []);

    const generateEquation = useCallback((currentLevel: Level): FallingEquation => {
        let a: number, b: number, c: number, result: number
        let equation: string

        const difficulty = Math.min(currentLevel * 3, 10)

        switch (currentLevel) {
            case 1: // Addition and Subtraction
                a = Math.floor(Math.random() * (10 * difficulty)) + 1
                b = Math.floor(Math.random() * (10 * difficulty)) + 1
                if (Math.random() < 0.5) {
                    equation = `${a} + ${b}`
                    result = a + b
                } else {
                    equation = `${Math.max(a, b)} - ${Math.min(a, b)}`
                    result = Math.max(a, b) - Math.min(a, b)
                }
                break
            case 2: // Multiplication and Division
                if (Math.random() < 0.5) {
                    a = Math.floor(Math.random() * difficulty) + 2
                    b = Math.floor(Math.random() * difficulty) + 2
                    equation = `${a} × ${b}`
                    result = a * b
                } else {
                    b = Math.floor(Math.random() * difficulty) + 2
                    result = Math.floor(Math.random() * difficulty) + 1
                    a = b * result
                    equation = `${a} ÷ ${b}`
                }
                break
            case 3: // Complex Expressions
                a = Math.floor(Math.random() * (5 * difficulty)) + 1
                b = Math.floor(Math.random() * (5 * difficulty)) + 1
                c = Math.floor(Math.random() * (5 * difficulty)) + 1
                const ops = ["+", "-", "×", "÷"]
                const op1 = ops[Math.floor(Math.random() * 4)]
                const op2 = ops[Math.floor(Math.random() * 4)]
                equation = `${a} ${op1} ${b} ${op2} ${c}`
                result = evaluateExpression(a, b, c, op1, op2)
                break
        }

        return {
            id: Date.now(),
            equation,
            answer: result,
            x: Math.random() * (window.innerWidth - 150),
            y: -50,
            speed: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        }
    }, [])

    const addEquation = useCallback(() => {
        if (equations.length < 10) {
            const newEquation = generateEquation(level)
            setEquations(prevEquations => [...prevEquations, newEquation])
        }
    }, [equations.length, generateEquation, level])

    const progressLevel = useCallback(() => {
        if (level === 3) {
            setGameStatus("ended")
            playSound('gameOver')
            if (backgroundAudioRef.current) {
                backgroundAudioRef.current.pause()
            }
        } else {
            setLevel(prevLevel => (prevLevel + 1) as Level)
            const nextLevelConfig = getLevelConfig((level + 1) as Level)
            setTimeLeft(nextLevelConfig.time)
            setEquations([])
            playSound('levelUp')
        }
    }, [level, getLevelConfig])

    useEffect(() => {
        if (gameStatus === "playing") {
            const interval = setInterval(() => {
                setEquations(prevEquations => {
                    return prevEquations.map(eq => {
                        const newY = eq.y + eq.speed
                        if (newY > window.innerHeight) {
                            return generateEquation(level) // Removed score decrement
                        }
                        return { ...eq, y: newY }
                    })
                })
            }, 50)

            return () => clearInterval(interval)
        }
    }, [gameStatus, generateEquation, level])

    useEffect(() => {
        if (gameStatus === "playing") {
            const addEquationInterval = setInterval(addEquation, 2000)
            return () => clearInterval(addEquationInterval)
        }
    }, [gameStatus, addEquation])

    useEffect(() => {
        if (gameStatus === "playing") {
            const timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        progressLevel()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [gameStatus, progressLevel])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const matchedEquation = equations.find(eq => eq.answer === parseInt(input))
        if (matchedEquation) {
            setMatchedId(matchedId)
            setScore(prevScore => prevScore + 10)
            playSound('correctAnswer')
            setTimeout(() => {
                setEquations(prevEquations => prevEquations.filter(eq => eq.id !== matchedEquation.id))
                setMatchedId(null)
            }, 1000)
        }
        setInput('')
    }

    const startGame = () => {
        setScore(0)
        setLevel(1)
        const levelOneConfig = getLevelConfig(1)
        setTimeLeft(levelOneConfig.time)
        setGameStatus("playing")
        setEquations([])
        if (backgroundAudioRef.current) {
            backgroundAudioRef.current.play()
        }
    }

    const levelConfig = getLevelConfig(level)

    return (
        <div className="flex h-screen overflow-hidden">
            <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Scoreboard</h2>
                <div className="space-y-4 flex-grow">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Score</h3>
                        <p className="text-3xl font-bold">{score}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Level</h3>
                        <p className="text-2xl">{level}</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Time Left</h3>
                        <p className="text-2xl">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
                        <Progress value={(timeLeft / levelConfig.time) * 100} className="mt-2" />
                    </div>
                </div>
                {gameStatus === "playing" && (
                    <Button onClick={() => setGameStatus("ended")} className="mt-auto">
                        End Game
                    </Button>
                )}
            </aside>
            <main className="flex-1 relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('/images/math-background.jpg')" }}>
                {gameStatus === "waiting" && (
                    <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Math Falling Game</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={startGame} className="w-full">Start Game</Button>
                        </CardContent>
                    </Card>
                )}
                {gameStatus === "playing" && (
                    <>
                        <AnimatePresence>
                            {equations.map((eq) => (
                                <motion.div
                                    key={eq.id}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className={`absolute px-4 py-2 rounded-md shadow-md ${eq.color} ${matchedId === eq.id ? 'bg-green-600' : ''}`}
                                    style={{
                                        left: `${eq.x}px`,
                                        top: `${eq.y}px`,
                                        minWidth: '100px',
                                    }}
                                >
                                    <span className="text-white font-bold">{eq.equation}</span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    type="number"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Enter answer..."
                                    className="w-64 bg-white/80 backdrop-blur-sm"
                                    aria-label="Enter your answer"
                                />
                                <Button type="submit" className="text-lg px-8 py-4">Enter</Button>
                            </form>
                        </div>
                    </>
                )}
                {gameStatus === "ended" && (
                    <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 bg-white/80 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-center">Game Over!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-lg mb-4">Your final score: {score}</p>
                            <Button onClick={startGame} className="w-full">Play Again</Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}