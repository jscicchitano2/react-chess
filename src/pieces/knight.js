import Piece from './piece.js';
import { isSameRow } from '../helper-functions';

export default class Knight extends Piece {
  constructor(player, whitePlayer) {
    var color = (player === 1 && whitePlayer === 1) || (player === 2 && whitePlayer === 2) ? 1 : 2;
    super(player, (color === 1 ? 
        "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg" : 
        "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg")
    );
  }

  isMovePossible(src, dest) {
    return ((src - 17 === dest && !isSameRow(src, dest)) ||
      (src - 10 === dest && !isSameRow(src, dest)) ||
      (src + 6 === dest && !isSameRow(src, dest)) ||
      (src + 15 === dest && !isSameRow(src, dest)) ||
      (src - 15 === dest && !isSameRow(src, dest)) ||
      (src - 6 === dest && !isSameRow(src, dest)) ||
      (src + 10 === dest && !isSameRow(src, dest)) ||
      (src + 17 === dest && !isSameRow(src, dest)))
  }

  /**
   * always returns empty array because of jumping
   * @return {[]}
   */
   getSrcToDestPath() {
    return [];
  }
}