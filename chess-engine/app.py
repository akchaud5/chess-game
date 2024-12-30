from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import chess.engine
import time
from stockfish import Stockfish

app = Flask(__name__)
CORS(app, origins=['your-frontend-url.vercel.app'])
stockfish = Stockfish(path="/usr/bin/stockfish")
stockfish.set_depth(8)  # Reduced depth for faster moves
stockfish.set_skill_level(10)
stockfish.get_parameters()["Threads"] = 4  # Use multiple CPU threads

@app.route('/get-move', methods=['POST', 'OPTIONS'])
def get_move():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.json
        fen = data.get('fen', chess.STARTING_FEN)
        
        start_time = time.time()
        stockfish.set_fen_position(fen)
        best_move = stockfish.get_best_move_time(18000)
        
        end_time = time.time()
        calculation_time = end_time - start_time
        
        return jsonify({
            'move': best_move,
            'calculation_time': calculation_time
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)