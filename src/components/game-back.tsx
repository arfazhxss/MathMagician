'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Fireball } from '@/components/fireball-animation'
import Image from 'next/image'

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

const townSprites = [
    '/images/town-1.png',
    '/images/town-9.png',
    '/images/town-3.png',
    '/images/town-4.png',
    '/images/town-9.png',
    '/images/town-4.png',
    '/images/town-7.png',
    '/images/town-4.png',
    '/images/town-2.png',
    '/images/town-3.png',
    '/images/town-9.png',
    '/images/town-4.png',
    '/images/town-7.png',
    '/images/town-5.png',
    '/images/town-6.png',
    '/images/town-7.png',
    '/images/town-8.png',
    '/images/town-9.png',
]

const backgroundImages = {
    start: '/images/math-game-start.jpg',
    level1: '/images/bg-level-1.jpg',
    level2: '/images/bg-level-1.jpg',
    level3: '/images/bg-level-3.jpg',
}

export default function Component() {
    const [equations, setEquations] = useState<FallingEquation[]>([])
    const [input, setInput] = useState('')
    const [score, setScore] = useState(0)
    const [level, setLevel] = useState<Level>(1)
    const [timeLeft, setTimeLeft] = useState(30)
    const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "ended">("waiting")
    const [gameAreaDimensions, setGameAreaDimensions] = useState({ width: 0, height: 0 })
    const [townHealth, setTownHealth] = useState(100)
    const gameAreaRef = useRef<HTMLDivElement>(null)
    const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
    const soundEffectsRef = useRef<{ [key: string]: HTMLAudioElement }>({})

    useEffect(() => {
        const updateDimensions = () => {
            if (gameAreaRef.current) {
                setGameAreaDimensions({
                    width: gameAreaRef.current.clientWidth,
                    height: gameAreaRef.current.clientHeight
                })
            }
        }

        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])

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
                gameOver: new Audio('/sounds/game-over.mp3'),
                blast: new Audio('/sounds/blast.mp3')
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
            case 1: return { time: 30, background: backgroundImages.level1 };
            case 2: return { time: 25, background: backgroundImages.level2 };
            case 3: return { time: 20, background: backgroundImages.level3 };
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
                {
                    const ops = ["+", "-", "×", "÷"]
                    const op1 = ops[Math.floor(Math.random() * 4)]
                    const op2 = ops[Math.floor(Math.random() * 4)]
                    equation = `${a} ${op1} ${b} ${op2} ${c}`
                    result = evaluateExpression(a, b, c, op1, op2)
                }
                break
        }

        const padding = 75
        const x = Math.random() * (gameAreaDimensions.width - padding * 2) + padding

        return {
            id: Date.now(),
            equation,
            answer: result,
            x,
            y: -50,
            speed: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        }
    }, [gameAreaDimensions.width])

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

    const handleBlast = useCallback(() => {
        setTownHealth(prev => Math.max(0, prev - 10))
        playSound('blast')
        if (townHealth <= 10) {
            setGameStatus("ended")
            playSound('gameOver')
            if (backgroundAudioRef.current) {
                backgroundAudioRef.current.pause()
            }
        }
    }, [townHealth])

    useEffect(() => {
        if (gameStatus === "playing") {
            const interval = setInterval(() => {
                setEquations(prevEquations => {
                    return prevEquations.map(eq => {
                        const newY = eq.y + eq.speed
                        if (newY > gameAreaDimensions.height - 200) {
                            handleBlast()
                            return generateEquation(level)
                        }
                        return { ...eq, y: newY }
                    })
                })
            }, 50)

            return () => clearInterval(interval)
        }
    }, [gameStatus, generateEquation, level, gameAreaDimensions.height, handleBlast])

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
            setScore(prevScore => prevScore + 10)
            playSound('correctAnswer')
            removeEquationAfterDelay(matchedEquation.id, setEquations)
        }
        setInput('')
    }

    const removeEquationAfterDelay = (id: number, setEquations: React.Dispatch<React.SetStateAction<FallingEquation[]>>) => {
        setTimeout(() => removeEquation(id, setEquations), 1000)
    }

    const removeEquation = (id: number, setEquations: React.Dispatch<React.SetStateAction<FallingEquation[]>>) => {
        setEquations(prevEquations => prevEquations.filter(eq => eq.id !== id))
    }

    const startGame = () => {
        setScore(0)
        setLevel(1)
        setTownHealth(100)
        const levelOneConfig = getLevelConfig(1)
        setTimeLeft(levelOneConfig.time)
        setGameStatus("playing")
        setEquations([])
        if (backgroundAudioRef.current) {
            backgroundAudioRef.current.play().catch(error => {
                console.error('Error playing background music:', error)
            })
        }
    }

    const levelConfig = getLevelConfig(level)

    const getBackgroundImage = () => {
        if (gameStatus === "waiting" || gameStatus === "ended") {
            return backgroundImages.start
        }
        return levelConfig.background
    }

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
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Town Health</h3>
                        <Progress value={townHealth} className="mt-2" />
                    </div>
                </div>
                {gameStatus === "playing" && (
                    <Button onClick={() => setGameStatus("ended")} className="mt-auto">
                        End Game
                    </Button>
                )}
            </aside>
            <main
                ref={gameAreaRef}
                className="flex-1 relative overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url('${getBackgroundImage()}')` }}
            >
                {/* Town sprites */}
                <div className="absolute bottom-0 left-0 right-0 h-24 flex justify-between">
                    {townSprites.map((sprite, index) => (
                        <Image
                            key={index}
                            src={sprite}
                            alt={`Town ${index + 1}`}
                            className="h-full w-auto object-contain"
                            width={100}
                            height={100}
                        />
                    ))}
                </div>

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
                                >
                                    <Fireball x={eq.x} y={eq.y} equation={eq.equation} onBlast={handleBlast} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        <div className="absolute bottom-28 left-4 right-4 flex justify-center">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input
                                    type="number"
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Enter answer..."
                                    className="w-64 bg-white/80 backdrop-blur-sm text-xl h-12"
                                    aria-label="Enter your answer"
                                />
                                <Button type="submit" className="text-xl px-8 py-6">Enter</Button>
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