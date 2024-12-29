import React, { useState } from 'react';

const ChessGame = () => {
  const [board, setBoard] = useState(initializeBoard());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [turn, setTurn] = useState('white');
  const [gameStatus] = useState('playing');

  const getPieceSymbol = (piece) => {
    const symbols = {
      'pawn': '♟',
      'rook': '♜',
      'knight': '♞',
      'bishop': '♝',
      'queen': '♛',
      'king': '♚'
    };
    return symbols[piece] || '';
  };

  const renderSquare = (square) => {
    if (!square) return null;
    return (
      <div className={`text-3xl ${square.color === 'white' ? 'text-white' : 'text-black'}`}>
        {getPieceSymbol(square.piece)}
      </div>
    );
  };

  function initializeBoard() {
    const initialBoard = Array(8).fill().map(() => Array(8).fill(null));
    
    // Set up pawns
    for (let i = 0; i < 8; i++) {
      initialBoard[1][i] = { piece: 'pawn', color: 'black', hasMoved: false };
      initialBoard[6][i] = { piece: 'pawn', color: 'white', hasMoved: false };
    }
    
    // Set up other pieces
    const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
    for (let i = 0; i < 8; i++) {
      initialBoard[0][i] = { piece: backRow[i], color: 'black', hasMoved: false };
      initialBoard[7][i] = { piece: backRow[i], color: 'white', hasMoved: false };
    }
    
    return initialBoard;
  }

  const isValidMove = (start, end) => {
    const [startRow, startCol] = start;
    const [endRow, endCol] = end;
    const piece = board[startRow][startCol];
    
    if (!piece || piece.color !== turn) return false;
    if (board[endRow][endCol]?.color === piece.color) return false;
    
    switch (piece.piece) {
      case 'king':
        // Normal king moves
        if (Math.abs(endRow - startRow) <= 1 && Math.abs(endCol - startCol) <= 1) {
          return true;
        }
        // Castling
        if (startRow === endRow && Math.abs(endCol - startCol) === 2) {
          // Check if it's the king's initial position
          if (piece.color === 'white' && startRow !== 7) return false;
          if (piece.color === 'black' && startRow !== 0) return false;
          if (startCol !== 4) return false;

          // Check if king has moved
          if (piece.hasMoved) return false;

          // Kingside castling
          if (endCol === 6) {
            const rook = board[startRow][7];
            if (!rook || rook.piece !== 'rook' || rook.hasMoved) return false;
            return !hasObstacles(startRow, startCol, startRow, 7, [0, 1]);
          }
          // Queenside castling
          if (endCol === 2) {
            const rook = board[startRow][0];
            if (!rook || rook.piece !== 'rook' || rook.hasMoved) return false;
            return !hasObstacles(startRow, startCol, startRow, 0, [0, -1]);
          }
        }
        return false;
      case 'pawn':
        const direction = piece.color === 'white' ? -1 : 1;
        const startingRow = piece.color === 'white' ? 6 : 1;
        
        // Forward moves
        if (endCol === startCol) {
          if (endRow === startRow + direction && !board[endRow][endCol]) {
            return true;
          }
          if (startRow === startingRow && 
              endRow === startRow + 2 * direction && 
              !board[endRow][endCol] &&
              !board[startRow + direction][startCol]) {
            return true;
          }
        }
        
        // Diagonal captures
        if (Math.abs(endCol - startCol) === 1 && 
            endRow === startRow + direction && 
            board[endRow][endCol]?.color !== piece.color && 
            board[endRow][endCol]) {
          return true;
        }
        return false;

      case 'rook':
        if (startRow !== endRow && startCol !== endCol) return false;
        const rookDirection = startRow === endRow ? 
          [0, Math.sign(endCol - startCol)] : 
          [Math.sign(endRow - startRow), 0];
        return !hasObstacles(startRow, startCol, endRow, endCol, rookDirection);

      case 'knight':
        const dx = Math.abs(endCol - startCol);
        const dy = Math.abs(endRow - startRow);
        return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);

      case 'bishop':
        if (Math.abs(endRow - startRow) !== Math.abs(endCol - startCol)) return false;
        const bishopDirection = [
          Math.sign(endRow - startRow),
          Math.sign(endCol - startCol)
        ];
        return !hasObstacles(startRow, startCol, endRow, endCol, bishopDirection);

      case 'queen':
        const isDiagonal = Math.abs(endRow - startRow) === Math.abs(endCol - startCol);
        const isStraight = startRow === endRow || startCol === endCol;
        if (!isDiagonal && !isStraight) return false;
        const queenDirection = isDiagonal ? 
          [Math.sign(endRow - startRow), Math.sign(endCol - startCol)] :
          startRow === endRow ? [0, Math.sign(endCol - startCol)] : [Math.sign(endRow - startRow), 0];
        return !hasObstacles(startRow, startCol, endRow, endCol, queenDirection);

      case 'king':
        return Math.abs(endRow - startRow) <= 1 && Math.abs(endCol - startCol) <= 1;

      default:
        return false;
    }
  };

  const hasObstacles = (startRow, startCol, endRow, endCol, [dx, dy]) => {
    let row = startRow + dx;
    let col = startCol + dy;
    
    while (row !== endRow || col !== endCol) {
      if (board[row][col]) return true;
      row += dx;
      col += dy;
    }
    return false;
  };

  const handleMove = (startRow, startCol, endRow, endCol, newBoard) => {
    const piece = newBoard[startRow][startCol];
    
    // Handle castling
    if (piece.piece === 'king' && Math.abs(endCol - startCol) === 2) {
      const isKingside = endCol === 6;
      const rookStartCol = isKingside ? 7 : 0;
      const rookEndCol = isKingside ? 5 : 3;
      
      // Move rook
      newBoard[endRow][rookEndCol] = newBoard[endRow][rookStartCol];
      newBoard[endRow][rookStartCol] = null;
      newBoard[endRow][rookEndCol].hasMoved = true;
    }
    
    // Move piece
    newBoard[endRow][endCol] = {...piece, hasMoved: true};
    newBoard[startRow][startCol] = null;
    
    return newBoard;
  };

  const handleSquareClick = async (row, col) => {
    if (gameStatus !== 'playing' || turn !== 'white') return;
    
    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      if (selectedRow === row && selectedCol === col) {
        setSelectedSquare(null);
        return;
      }
      
      if (isValidMove([selectedRow, selectedCol], [row, col])) {
        const newBoard = board.map(row => [...row]);
        handleMove(selectedRow, selectedCol, row, col, newBoard);
        setBoard(newBoard);
        setTurn('black');
        setSelectedSquare(null);
        
        setTimeout(async () => {
          await makeAIMove(newBoard);
        }, 500);
      } else {
        setSelectedSquare(null);
      }
    } else if (board[row][col]?.color === 'white') {
      setSelectedSquare([row, col]);
    }
  };

  const makeAIMove = async (currentBoard) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          fen: boardToFEN(currentBoard || board),
          timeout: 2000 
        })
      });
      
      const data = await response.json();
      if (data.move) {
        const [from, to] = [data.move.slice(0, 2), data.move.slice(2, 4)];
        const startCoords = algebraicToCoords(from);
        const endCoords = algebraicToCoords(to);
        
        const newBoard = currentBoard.map(row => [...row]);
        newBoard[endCoords.row][endCoords.col] = currentBoard[startCoords.row][startCoords.col];
        newBoard[startCoords.row][startCoords.col] = null;
        setBoard(newBoard);
        setTurn('white');
      }
    } catch (error) {
      console.error('Error making AI move:', error);
    }
  };

  const boardToFEN = (board) => {
    let fen = '';
    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          const symbol = getFENSymbol(piece);
          fen += symbol;
        } else {
          emptyCount++;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (row < 7) fen += '/';
    }
    return `${fen} b KQkq - 0 1`;
  };

  const getFENSymbol = (piece) => {
    const symbols = {
      'pawn': 'p',
      'rook': 'r',
      'knight': 'n',
      'bishop': 'b',
      'queen': 'q',
      'king': 'k'
    };
    const symbol = symbols[piece.piece];
    return piece.color === 'white' ? symbol.toUpperCase() : symbol;
  };

  const algebraicToCoords = (square) => {
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1]);
    return { row, col };
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="mb-4 text-lg font-bold">
        {gameStatus === 'playing' ? `${turn}'s turn` : gameStatus}
      </div>
      <div className="grid grid-cols-8 gap-0 border border-gray-400">
        {board.map((row, rowIndex) => (
          row.map((square, colIndex) => {
            const isSelected = selectedSquare && 
              selectedSquare[0] === rowIndex && 
              selectedSquare[1] === colIndex;
            const squareColor = (rowIndex + colIndex) % 2 === 0 ? 'bg-amber-200' : 'bg-amber-600';
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  w-16 h-16 flex items-center justify-center cursor-pointer
                  ${squareColor}
                  ${isSelected ? 'ring-4 ring-blue-400' : ''}
                `}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {renderSquare(square)}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};

export default ChessGame;