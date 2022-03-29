import Bishop from '../pieces/bishop.js';
import King from '../pieces/king.js';
import Knight from '../pieces/knight.js';
import Pawn from '../pieces/pawn.js';
import Queen from '../pieces/queen.js';
import Rook from '../pieces/rook.js';

export default function intializeBoard(whitePlayer) {
    const squares = new Array(64).fill(null);

    if (whitePlayer === 1) {
        for (let i = 0; i < 8; i++) {
            squares[i + 8] = new Pawn(2, 1);
            squares[i + 48] = new Pawn(1, 1);
        }
    
        squares[0] = new Rook(2, 1);
        squares[7] = new Rook(2, 1);
        squares[56] = new Rook(1, 1);
        squares[63] = new Rook(1, 1);
    
        squares[1] = new Knight(2, 1);
        squares[6] = new Knight(2, 1);
        squares[57] = new Knight(1, 1);
        squares[62] = new Knight(1, 1);
    
        squares[2] = new Bishop(2, 1);
        squares[5] = new Bishop(2, 1);
        squares[58] = new Bishop(1, 1);
        squares[61] = new Bishop(1, 1);
    
        squares[3] = new Queen(2, 1);
        squares[4] = new King(2, 1);
    
        squares[59] = new Queen(1, 1);
        squares[60] = new King(1, 1);
    } else {
        for (let i = 0; i < 8; i++) {
            squares[i + 8] = new Pawn(2, 2);
            squares[i + 48] = new Pawn(1, 2);
        }
    
        squares[0] = new Rook(2, 2);
        squares[7] = new Rook(2, 2);
        squares[56] = new Rook(1, 2);
        squares[63] = new Rook(1, 2);
    
        squares[1] = new Knight(2, 2);
        squares[6] = new Knight(2, 2);
        squares[57] = new Knight(1, 2);
        squares[62] = new Knight(1, 2);
    
        squares[2] = new Bishop(2, 2);
        squares[5] = new Bishop(2, 2);
        squares[58] = new Bishop(1, 2);
        squares[61] = new Bishop(1, 2);
    
        squares[4] = new Queen(2, 2);
        squares[3] = new King(2, 2);
    
        squares[60] = new Queen(1, 2);
        squares[59] = new King(1, 2);
    }
    
    return squares;
}