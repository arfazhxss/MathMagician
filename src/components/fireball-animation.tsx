'use client'

import React, { useRef, useEffect, useState } from 'react'

interface FireballProps {
    x: number
    y: number
    equation: string
    onBlast: () => void
}

const PI_2 = 2 * Math.PI
const FPS = 30

const rand = (a: number, b: number) => (b - a) * Math.random() + a

class Smoke {
    opacity: number
    x: number
    y: number
    r: number
    destroyed: boolean

    constructor(x: number, y: number) {
        this.opacity = 0.8
        this.x = x
        this.y = y
        this.r = 0.6
        this.destroyed = false
    }

    step() {
        this.y -= rand(0, 3)
        this.x += rand(-2, 2)
        this.opacity -= 0.015
        if (this.opacity <= 0) {
            this.destroyed = true
        }
    }

    draw(context: CanvasRenderingContext2D) {
        if (this.opacity <= 0) return
        context.beginPath()
        context.arc(this.x, this.y, this.r, 0, PI_2, false)
        context.fillStyle = `rgba(60,60,60,${this.opacity})`
        context.fill()
    }
}

class Trail {
    opacity: number
    x: number
    y: number
    r: number
    destroyed: boolean

    constructor(x: number, y: number) {
        this.opacity = 1
        this.x = x
        this.y = y
        this.r = 5
        this.destroyed = false
    }

    step() {
        this.y -= rand(0, 8)
        this.x -= rand(-3, 3)
        this.opacity -= 0.05
        if (this.opacity <= 0) {
            this.destroyed = true
        }
    }

    draw(context: CanvasRenderingContext2D) {
        if (this.opacity <= 0) return
        const color = `rgba(255,${~~(240 * this.opacity)},0,${this.opacity})`
        const color2 = `rgba(255,${~~(240 * this.opacity)},0,0)`

        const rg = this.r * 1.5 + rand(0, 2)

        const g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, rg)
        g.addColorStop(0, color)
        g.addColorStop(1, color2)

        context.beginPath()
        context.arc(this.x, this.y, rg, 0, PI_2, false)
        context.fillStyle = g
        context.fill()

        context.beginPath()
        context.arc(this.x, this.y, this.r * this.opacity, 0, PI_2, false)
        context.fillStyle = color
        context.fill()
    }
}

class Flame {
    x: number
    y: number
    r: number
    rg: number
    g: CanvasGradient

    constructor(x: number, y: number, context: CanvasRenderingContext2D) {
        this.x = x
        this.y = y
        this.r = 5
        this.rg = 12
        this.g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 1.5)
        this.g.addColorStop(0, "rgba(255,255,255,1)")
        this.g.addColorStop(1, "rgba(255,220,0,0)")
    }

    draw(context: CanvasRenderingContext2D, addEntity: (entity: Trail | Smoke) => void) {
        for (let i = 1; i <= 9; i++) {
            addEntity(new Trail(this.x, this.y - this.r / 3))
        }

        const g = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rg)
        g.addColorStop(0, `rgba(255,180,0,${rand(0.2, 0.9)})`)
        g.addColorStop(1, "rgba(255,180,0,0)")

        context.beginPath()
        context.arc(this.x, this.y, this.rg, 0, PI_2, false)
        context.fillStyle = g
        context.fill()

        context.beginPath()
        context.arc(this.x + rand(-1.5, 1.5), this.y + rand(-1.5, 1.5), this.r, 0, PI_2, false)
        context.fillStyle = this.g
        context.fill()
    }
}

class Blast {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = 50
        this.opacity = 1
    }

    step() {
        this.radius += 2
        this.opacity -= 0.05
    }

    draw(context: CanvasRenderingContext2D) {
        context.beginPath()
        context.arc(this.x, this.y, this.radius, 0, PI_2, false)
        context.fillStyle = `rgba(255, 100, 0, ${this.opacity})`
        context.fill()
    }

    isFinished() {
        return this.opacity <= 0 || this.radius >= this.maxRadius
    }
}

export const Fireball: React.FC<FireballProps> = ({ x, y, equation, onBlast }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [blast, setBlast] = useState<Blast | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const entities: (Trail | Smoke)[] = []
        const flame = new Flame(canvas.width / 2, canvas.height / 2 - 20, context)

        const addEntity = (entity: Trail | Smoke) => {
            entities.push(entity)
        }

        const loop = () => {
            context.clearRect(0, 0, canvas.width, canvas.height)

            if (blast) {
                blast.step()
                blast.draw(context)
                if (blast.isFinished()) {
                    setBlast(null)
                    onBlast()
                }
            } else {
                flame.draw(context, addEntity)

                for (let i = entities.length - 1; i >= 0; i--) {
                    const entity = entities[i]
                    entity.step()
                    entity.draw(context)
                    if (entity.destroyed) {
                        entities.splice(i, 1)
                        if (entity instanceof Trail && Math.random() < 0.5) {
                            addEntity(new Smoke(entity.x, entity.y - 3 * entity.r))
                        }
                    }
                }

                context.font = '16px Arial'
                context.fillStyle = 'white'
                context.textAlign = 'center'
                context.fillText(equation, canvas.width / 2, canvas.height - 100)
            }
        }

        const intervalId = setInterval(loop, 1000 / FPS)

        return () => clearInterval(intervalId)
    }, [equation, blast, onBlast])

    useEffect(() => {
        if (y >= window.innerHeight - 200) {
            setBlast(new Blast(75, 150))
        }
    }, [y])

    return (
        <div style={{ position: 'absolute', left: x, top: y }}>
            < canvas ref={canvasRef} width={150} height={200} />
        </div>
    )
}