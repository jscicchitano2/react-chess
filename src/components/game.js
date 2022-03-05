import React from 'react';
import '../index.css';
import Board from './board.js';
import King from '../pieces/king';
import Rook from '../pieces/rook';
import Pawn from '../pieces/pawn';
import initializeBoard from '../helper-functions/initializeBoard.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
import Piece from '../pieces/piece';
import Queen from '../pieces/queen';

export default class Game extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
        squares: initializeBoard(),
        player: 1,
        sourceSelection: -1,
        status: '',
        turn: 'white',
        whiteFallenSoldiers: [],
        blackFallenSoldiers: [],
        gameOver: false
      };
  }

  handleClick(i) {
    if (this.state.gameOver) return;

    const squares = [...this.state.squares];

    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      } else {
        squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          sourceSelection: i
        })
      }
      return
    } else {
      const isPossible = squares[this.state.sourceSelection] instanceof Pawn ? 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, Boolean[squares[i]]) : 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, squares);
      if (((squares[i] && squares[i].player === this.state.player) || !isPossible)) {
        squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };
        this.setState({
          sourceSelection: -1
        });
      }
    }

    squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

    if (squares[i] && squares[i].player === this.state.player) {
      // Handle castling
      if ((squares[this.state.sourceSelection] instanceof King && squares[i] instanceof Rook) && 
        this.canCastle(squares, this.state.sourceSelection, i, this.state.player)) {
        squares[i].hasMoved = true;
        squares[this.state.sourceSelection].hasMoved = true;
        if (this.state.sourceSelection < i) {
          squares[this.state.sourceSelection + 2] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection + 1] = squares[i];
        } else {
          squares[this.state.sourceSelection - 2] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection - 1] = squares[i];
        }
        squares[this.state.sourceSelection] = null;
        squares[i] = null;
        let player = this.state.player === 1 ? 2 : 1;
        let turn = this.state.turn === 'white' ? 'black' : 'white';
        this.setState({
          sourceSelection: -1,
          squares,
          player,
          status: '',
          turn
        });
      }
    } else {

      const whiteFallenSoldiers = [];
      const blackFallenSoldiers = [];
      const isDestEnemyOccupied = Boolean(squares[i]);
      const isMovePossible = squares[this.state.sourceSelection] instanceof Pawn ? 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied) : 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, squares);
      const testSquares = [...squares];
      testSquares[i] = testSquares[this.state.sourceSelection];
      testSquares[this.state.sourceSelection] = null;
      const leadsToCheck = this.isCheckForPlayer(testSquares, this.state.player);
      
      if (isMovePossible && !leadsToCheck) {
        if (squares[i] !== null) {
          if (squares[i].player === 1) {
            whiteFallenSoldiers.push(squares[i]);
          } else {
            blackFallenSoldiers.push(squares[i]);
          }
        }

        squares[i] = squares[this.state.sourceSelection];
        squares[this.state.sourceSelection] = null;
        squares[i].hasMoved = true;

        // Pawn promotions
        if (squares[i] instanceof Pawn && squares[i].canPromote(i)) {
          squares[i] = new Queen(this.state.player);
        }

        const isCheckMe = this.isCheckForPlayer(squares, this.state.player)
        
        const otherPlayer = this.state.player === 1 ? 2 : 1;
        if (!this.hasValidMove(squares, otherPlayer)) {
          if (this.isCheckForPlayer(squares, otherPlayer)) {
            this.setState(oldState => ({
              status: "Checkmate. Player " + this.state.player + " wins!",
              sourceSelection: -1,
              squares,
              gameOver: true
            }))
          } else {
            this.setState(oldState => ({
              status: "Draw by stalemate!",
              sourceSelection: -1,
              squares,
              gameOver: true
            }))
          }
          return
        }

        if (isCheckMe) {
          this.setState(oldState => ({
            sourceSelection: -1,
          }))
        } else {
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.state.turn === 'white' ? 'black' : 'white';

          this.setState(oldState => ({
            sourceSelection: -1,
            squares,
            whiteFallenSoldiers: [...oldState.whiteFallenSoldiers, ...whiteFallenSoldiers],
            blackFallenSoldiers: [...oldState.blackFallenSoldiers, ...blackFallenSoldiers],
            player,
            status: '',
            turn
          }));
        }
      } else {
        this.setState({
          sourceSelection: -1,
        });
      }
    }
  }

  getKingPosition(squares, player) {
    return squares.reduce((acc, curr, i) =>
      acc || //King may be only one, if we had found it, returned his position
      ((curr //current square mustn't be a null
        && (curr.getPlayer() === player)) //we are looking for aspecial king 
        && (curr instanceof King)
        && i), // returned position if all conditions are completed
      null)
  }

  isCheckForPlayer(squares, player) {
    const opponent = player === 1 ? 2 : 1
    const playersKingPosition = this.getKingPosition(squares, player)
    const canPieceKillPlayersKing = function(piece, i) {
      return piece instanceof Pawn ? 
        piece.isMovePossible(i, playersKingPosition, true) : 
        piece.isMovePossible(i, playersKingPosition, squares);
    }
    for (var i = 0; i < 64; i++) {
      if (squares[i] != null && squares[i].player === opponent && canPieceKillPlayersKing(squares[i], i)) {
        return true;
      }
    }
    return false;
  }

  hasValidMove(squares, player) {
    for (var i = 0; i < 64; i++) {
      if (squares[i] != null && squares[i].player === player) {
        for (var j = 0; j < 64; j++) {
          if (i !== j && !(squares[j] && squares[j].player === player) && squares[i].isMovePossible(i, j, squares)) {
            const newSquares = [...squares];
            newSquares[j] = newSquares[i];
            newSquares[i] = null;
            if (!this.isCheckForPlayer(newSquares, player)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  canCastle(squares, start, dest, player) {
    if (squares[start].hasMoved || squares[dest].hasMoved) return false;
    let min = Math.min(start, dest);
    let max = Math.max(start, dest);
    for (var i = min + 1; i < max; i++) {
      if (squares[i]) return false;
    }
    if (start > dest && (this.opponentCanAttackPosition(squares, player, start) || 
      this.opponentCanAttackPosition(squares, player, start - 1) || 
      this.opponentCanAttackPosition(squares, player, start - 2))) {
        return false;
    } else if (start < dest && (this.opponentCanAttackPosition(squares, player, start) || 
      this.opponentCanAttackPosition(squares, player, start + 1) || 
      this.opponentCanAttackPosition(squares, player, start + 2))) {
        return false;
    }
    return true;
  }

  opponentCanAttackPosition(squares, player, position) {
    const opponent = player === 1 ? 2 : 1
    const canPieceKillPlayersPiece = function(piece, i) {
      return piece instanceof Pawn ? 
        piece.isMovePossible(i, position, true) : 
        piece.isMovePossible(i, position, squares);
    }
    for (var i = 0; i < 64; i++) {
      if (squares[i] != null && squares[i].player === opponent && canPieceKillPlayersPiece(squares[i], i)) {
        return true;
      }
    }
    return false;
  }

  render() {

    return (
      <div>
        <div className="game">
          <div className="game-board">
            <Board
              squares={this.state.squares}
              onClick={(i) => this.handleClick(i)}
            />
          </div>
          <div className="game-info">
            <h3>Turn</h3>
            <div id="player-turn-box" style={{ backgroundColor: this.state.turn }}>

            </div>
            <div className="game-status">{this.state.status}</div>

            <div className="fallen-soldier-block">

              {<FallenSoldierBlock
                whiteFallenSoldiers={this.state.whiteFallenSoldiers}
                blackFallenSoldiers={this.state.blackFallenSoldiers}
              />
              }
            </div>

          </div>
        </div>
      </div>
    );
  }
}