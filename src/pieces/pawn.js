import Piece from './piece.js';
import { isSameDiagonal } from '../helper-functions';

export default class Pawn extends Piece {
    constructor(player, whitePlayer) {
        var color = (player === 1 && whitePlayer === 1) || (player === 2 && whitePlayer === 2) ? 1 : 2;
        super(player, (color === 1 ? 
            "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg" : 
            "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg")
        );
        this.initialPositions = {
            1: [48, 49, 50, 51, 52, 53, 54, 55],
            2: [8, 9, 10, 11, 12, 13, 14, 15]
        }
        this.enPassatPositions = {
            1: [24, 25, 26, 27, 28, 29, 30, 31],
            2: [32, 33, 34, 35, 36, 37, 38, 39]
        }
    }

    isMovePossible(src, dest, isDestEnemyOccupied, lastOppMove) {
        if (this.player === 1) {
            if ((dest === src - 8 && !isDestEnemyOccupied) || (dest === src - 16 && !isDestEnemyOccupied && this.initialPositions[1].indexOf(src) !== -1)) {
                return true;
            } else if (isDestEnemyOccupied && isSameDiagonal(src, dest) && (dest === src - 9 || dest === src - 7)) {
                return true;
            } else if (this.enPassatPositions[1].indexOf(src) !== -1 && ((dest === src - 9 && lastOppMove[0] === dest - 8 && lastOppMove[1] === dest + 8) || 
                (dest === src - 7 && lastOppMove[0] === dest - 8 && lastOppMove[1] === dest + 8))) {
                return true;
            }
        } else if (this.player === 2) {
            if ((dest === src + 8 && !isDestEnemyOccupied) || (dest === src + 16 && !isDestEnemyOccupied && this.initialPositions[2].indexOf(src) !== -1)) {
                return true;
            } else if (isDestEnemyOccupied && isSameDiagonal(src, dest) && (dest === src + 9 || dest === src + 7)) {
                return true;
            } else if (this.enPassatPositions[2].indexOf(src) !== -1 && ((dest === src + 9 && lastOppMove[0] === dest + 8 && lastOppMove[1] === dest - 8) || 
                (dest === src + 7 && lastOppMove[0] === dest + 8 && lastOppMove[1] === dest - 8))) {
                return true;
            }
        }
        return false;
    }

    canPromote(position) {
        return (this.player === 1 && position < 8) || (this.player === 2 && position > 55); 
    }

    isEnPassat(src, dest, lastOppMove) {
        if (this.player === 1) {
            if (this.enPassatPositions[1].indexOf(src) !== -1 && ((dest === src - 9 && lastOppMove[0] === dest - 8 && lastOppMove[1] === dest + 8) || 
                (dest === src - 7 && lastOppMove[0] === dest - 8 && lastOppMove[1] === dest + 8))) {
                return true;
            }
        } else if (this.player === 2) {
            if (this.enPassatPositions[2].indexOf(src) !== -1 && ((dest === src + 9 && lastOppMove[0] === dest + 8 && lastOppMove[1] === dest - 8) || 
                (dest === src + 7 && lastOppMove[0] === dest + 8 && lastOppMove[1] === dest - 8))) {
                return true;
            }
        }
        return false;
    }

    /**
     * returns array of one if pawn moves two steps, else returns empty array  
     * @param  {[type]} src  [description]
     * @param  {[type]} dest [description]
     * @return {[type]}      [description]
     */
    getSrcToDestPath(src, dest) {
        if (dest === src - 16) {
            return [src - 8];
        } else if (dest === src + 16) {
            return [src + 8];
        }
        return [];
    }
}