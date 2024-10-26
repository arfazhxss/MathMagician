'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Play, Star } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter, redirect } from 'next/navigation'

export default function FrontPage() {
    const [currentTutorial, setCurrentTutorial] = useState(0)
    const router = useRouter()

    const tutorials = [
        {
            title: "Solve Falling Equations",
            description: "Equations will fall from the top of the screen. Solve them quickly before they reach the bottom!",
            image: "/progressLevel.png"
        },
        {
            title: "Type Your Answers",
            description: "Use the input field at the bottom of the screen to type your answers. Press Enter or click 'Submit' to check your solution.",
            image: "/progressLevel.png?height=200&width=300"
        },
        {
            title: "Score Points",
            description: "Each correct answer earns you points. The faster you solve, the higher your score!",
            image: "/progressLevel.png?height=200&width=300"
        },
        {
            title: "Beat the Clock",
            description: "You have 30 seconds per level. Solve as many equations as you can before time runs out!",
            image: "/progressLevel.png?height=200&width=300"
        },
        {
            title: "Level Up",
            description: "As you progress, equations become more challenging. Can you reach the highest level?",
            image: "/progressLevel.png?height=200&width=300"
        }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white p-8">
            <header className="text-center mb-12">
                <motion.h1
                    className="text-6xl font-bold mb-4"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    Math Magician
                </motion.h1>
                <motion.p
                    className="text-xl"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    Challenge your math skills in this fast-paced equation-solving adventure!
                </motion.p>
            </header>

            <main className="max-w-4xl mx-auto">
                <section className="mb-12">
                    <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                        <CardHeader>
                            <CardTitle className="text-2xl">How to Play</CardTitle>
                            <CardDescription className="text-gray-200">Master these steps to become a Math Falling champion!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tutorials.map((tutorial, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-start space-x-4"
                                        initial={{ x: -50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-blue-800 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{tutorial.title}</h3>
                                            <p className="text-sm text-gray-300">{tutorial.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="w-full">
                                        View Detailed Tutorial
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white text-gray-800 max-w-3xl">
                                    <DialogHeader>
                                        <DialogTitle>Game Tutorial</DialogTitle>
                                        <DialogDescription>Learn how to play the Math Falling Game</DialogDescription>
                                    </DialogHeader>
                                    <div className="mt-4">
                                        <img
                                            src={tutorials[currentTutorial].image}
                                            alt={tutorials[currentTutorial].title}
                                            className="w-full h-48 object-cover rounded-lg mb-4"
                                        />
                                        <h3 className="text-xl font-semibold mb-2">{tutorials[currentTutorial].title}</h3>
                                        <p>{tutorials[currentTutorial].description}</p>
                                        <div className="flex justify-between mt-4">
                                            <Button
                                                onClick={() => setCurrentTutorial(prev => (prev - 1 + tutorials.length) % tutorials.length)}
                                                disabled={currentTutorial === 0}
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                onClick={() => setCurrentTutorial(prev => (prev + 1) % tutorials.length)}
                                                disabled={currentTutorial === tutorials.length - 1}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </CardFooter>
                    </Card>
                </section>

                <section className="text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Button
                            size="lg"
                            className="bg-yellow-400 text-blue-800 hover:bg-yellow-300 text-xl px-8 py-6"
                            onClick={() => {
                                try {
                                    // Using push with error handling
                                    router.push('/game')
                                    redirect('/game')
                                } catch (error) {
                                    console.error('Navigation error:', error)
                                }
                            }}
                        >
                            <Play className="mr-2 h-6 w-6" /> Start Game
                        </Button>
                    </motion.div>
                </section>
            </main>

            <footer className="mt-16 text-center">
                <p className="text-sm text-gray-300">
                    © 2024 Math Falling Game. All rights reserved.
                </p>
                <div className="mt-2 flex justify-center space-x-4">
                    <Star className="text-yellow-400" />
                    <Star className="text-yellow-400" />
                    <Star className="text-yellow-400" />
                    <Star className="text-yellow-400" />
                    <Star className="text-yellow-400" />
                </div>
            </footer>
        </div>
    )
}