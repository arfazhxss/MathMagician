'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FallingWord {
    id: number
    word: string
    x: number
    y: number
    speed: number
    color: string
}

const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
]

export default function Component() {
    const [words, setWords] = useState<FallingWord[]>([])
    const [input, setInput] = useState('')
    const [matchedId, setMatchedId] = useState<number | null>(null)
    const [score, setScore] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setWords(prevWords => {
                return prevWords.map(word => {
                    const newY = (word.y + word.speed) % window.innerHeight;
                    // Check if the word has fallen off the screen
                    if (newY > window.innerHeight) {
                        setScore(prevScore => prevScore - 5); // Decrease score by 5
                        return { ...word, y: -50 }; // Reset position to the top
                    }
                    return { ...word, y: newY };
                });
            });
        }, 50);

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const addWordInterval = setInterval(() => {
            addWord()
        }, 5000)

        return () => clearInterval(addWordInterval)
    }, [])

    const addWord = () => {
        const newWord: FallingWord = {
            id: Date.now(),
            word: generateWord(),
            x: Math.random() * (window.innerWidth - 150),
            y: -50,
            speed: Math.random() * 2 + 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        }
        setWords(prevWords => [...prevWords, newWord])
    }

    const generateWord = () => {
        const words = ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Node', 'Express', 'MongoDB', 'SQL', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust']
        return words[Math.floor(Math.random() * words.length)]
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const matchedWord = words.find(word => word.word.toLowerCase() === input.toLowerCase());
        if (matchedWord) {
            setMatchedId(matchedWord.id);
            setScore(prevScore => prevScore + 10); // Increment score by 10
            setTimeout(() => {
                setWords(prevWords => prevWords.filter(word => word.id !== matchedWord.id));
                setMatchedId(null);
            }, 1000);
        }
        setInput('');
    }


    return (
        <div className="relative w-full h-screen bg-white overflow-hidden">
            <AnimatePresence>
                {words.map((word) => (
                    <motion.div
                        key={word.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.5 }}
                        className={`absolute px-4 py-2 rounded-md shadow-md ${word.color} ${matchedId === word.id ? 'bg-red-600' : ''}`}
                        style={{
                            left: `${word.x}px`,
                            top: `${word.y}px`,
                            minWidth: '100px',
                        }}
                    >
                        <span className="text-white font-bold">{word.word}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
            <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type a word..."
                        className="w-64"
                    />
                    <Button type="submit" className="text-lg px-8 py-4">Enter</Button>
                </form>
            </div>
            <div className="absolute top-4 left-4">
                <span className="text-xl font-bold">Score: {score}</span>
            </div>
        </div>
    )
}
