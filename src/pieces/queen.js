import Piece from './piece.js';

export default class Queen extends Piece {
  constructor(player) {
    super(player, (player === 1 ? 
        "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg" : 
        "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg")
    );
  }
}