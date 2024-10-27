# Math Falling Game Documentation
The Math Falling Game is an interactive game where users solve math equations that fall from the top of the screen. The game progresses through different levels, increasing in difficulty. Each correct answer earns the user points and progresses them through levels, while each level has a time limit that counts down. The player can choose to end the game manually or play until the timer runs out.

## UVEC Win 🏆
![wec24](https://github.com/user-attachments/assets/7576a455-3c70-4521-aa04-72eac693bf0f)

We’re thrilled to share that our team won first place at the UVEC (University of Victory Engineering Competition) Hackathon! Special thanks to the UVEC judges and mentors for their invaluable feedback and support throughout the competition.

## Features
- **Falling Equations:** Equations fall from the top of the screen at different speeds.
- **Game Levels:** Each level has different difficulty levels:
  - Level 1: Addition and Subtraction
  - Level 2: Multiplication and Division
  - Level 3: Mixed and Complex Expressions
- **Score Tracking:** Player’s score is updated with each correct answer.
- **Timer Countdown:** Each level has a specific time limit. Completing the time either progresses the player to the next level or ends the game.
- **Audio Feedback:** Sound effects provide feedback on correct answers, leveling up, and game over.
- **Responsive Design:** The game layout adapts to different screen sizes.

## Components

### `FallingEquation` Interface
Defines the structure of each falling equation object:
- `id`: Unique identifier for each equation.
- `equation`: The equation string shown to the player.
- `answer`: Correct answer to the equation.
- `x`, `y`: Position of the equation on the screen.
- `speed`: The speed at which the equation falls.
- `color`: Color associated with the equation.

### `Level` Type
Defines the available levels:
- Level `1`: Basic (Addition and Subtraction)
- Level `2`: Intermediate (Multiplication and Division)
- Level `3`: Advanced (Mixed Operations)

## Game Functions

### `evaluateExpression()`
```typescript
const evaluateExpression = (a: number, b: number, c: number, op1: string, op2: string): number;
```
Evaluates a complex expression for Level 3. It takes three numbers and two operators and applies the operators sequentially.

### `Component()`
Main component that renders the game interface and manages all the states and logic of the game.

### `playSound()`
```typescript
const playSound = (soundName: string): void;
```
Plays the corresponding audio file based on the event (`correctAnswer`, `levelUp`, `gameOver`).

### `getLevelConfig()`
```typescript
const getLevelConfig = (level: Level): { time: number };
```
Returns configuration for each level. Level 1 and 3 have 60 seconds; Level 2 has 120 seconds.

### `generateEquation()`
```typescript
const generateEquation = (currentLevel: Level): FallingEquation;
```
Generates a new equation based on the current level and returns a `FallingEquation` object.

### `addEquation()`
Adds a new equation if the current number of falling equations is below the limit (10).

### `progressLevel()`
```typescript
const progressLevel = (): void;
```
Advances the player to the next level or ends the game if Level 3 is complete.

### `handleInputChange()`
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void;
```
Handles input change for the answer input field, updating the state.

### `handleSubmit()`
```typescript
const handleSubmit = (e: React.FormEvent): void;
```
Handles form submission for answers. Checks if the entered answer matches any falling equation’s answer.

### `startGame()`
Initializes the game by resetting scores, levels, time, and starting background audio.

## Game States
The game has three states:
1. `waiting`: Initial state where the player can start the game.
2. `playing`: Active game state with falling equations and timer.
3. `ended`: Game-over state displaying the final score and a "Play Again" button.

## UI Elements

### Scoreboard
Displays the player’s current score, level, and remaining time.

### Falling Equations
Rendered as falling colored boxes with math equations. When an answer matches, the box changes color briefly before being removed.

### Answer Input
Input field for player to enter answers to the falling equations.

### Start and End Buttons
- **Start Game Button:** Initiates the game.
- **End Game Button:** Ends the game manually during gameplay.

## CSS Classes and Styling
Various classes are used for styling elements, including colors, animations, and layout positioning. For example:
- Colors for equations (`bg-red-500`, `bg-blue-500`, etc.)
- Shadow, padding, and positioning classes for cards and buttons.
  
## Example Game Flow

1. **Start Game:** Player presses the "Start Game" button.
2. **Level 1 Begins:** Equations for basic addition and subtraction start falling.
3. **Answering Equations:** Player enters answers, gaining points for correct answers.
4. **Time Runs Out:** Level ends when time runs out. If the game is on Level 3, the game ends; otherwise, it progresses to the next level.
5. **Game Over:** When the game ends, the player’s final score is displayed with an option to play again.

## Audio and Visual Effects
Audio effects provide feedback on key actions:
- **Correct Answer:** Positive sound plays when an answer is matched.
- **Level Up:** Sound effect plays when progressing to the next level.
- **Game Over:** Sound effect plays when the game ends.

### Background Image
The main game background (`/images/math-background.jpg`) provides visual appeal and context for the math-based game.

## Future Improvements
- **Difficulty Scaling:** Dynamically adjust speed and equation frequency based on player performance.
- **High Scores:** Save and display high scores across sessions.
- **Additional Levels:** Add more levels with new operators and equation formats.

## Requirements
- **React**: Frontend library.
- **Framer Motion**: Animation library.
- **Sound Files**: Three sound files (`correct-answer.mp3`, `level-up.mp3`, `game-over.mp3`) for game feedback.
- **Image Assets**: Background image for the main game screen (`math-background.jpg`).
