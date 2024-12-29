# Chess Game with AI

A web-based chess game featuring:
- React frontend with interactive board
- Python/Flask backend with Stockfish engine
- Legal move validation for all pieces
- AI opponent playing black pieces

## Setup

### Frontend
```bash
cd chess-game
npm install
npm start
Backend
bashCopycd chess-engine
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install flask chess python-chess stockfish flask-cors
python chess-engine.py
Requirements

Node.js
Python 3.x
Stockfish chess engine

Features

Complete move validation for all pieces
Castling support
AI makes moves within 2 seconds
Responsive web interface
Real-time move highlighting

Tech Stack

React
Tailwind CSS
Python/Flask
Stockfish
