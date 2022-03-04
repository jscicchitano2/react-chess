import React from 'react';
import '../index.css';
import Board from './board.js';
import King from '../pieces/king';
import initializeBoard from '../helper-functions/initializeBoard.js';
import FallenSoldierBlock from './fallen-soldier-block.js';

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
        this.setState({ status: "Wrong selection. Choose one of player " + this.state.player + "'s pieces." });
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
        }
      } else {
        squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.setState({
          status: "Choose a destination for the selected piece",
          sourceSelection: i
        })
      }
      return
    }

    squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };

    if (squares[i] && squares[i].player === this.state.player) {
      this.setState({
        status: "Wrong selection. Choose valid source and destination again.",
        sourceSelection: -1,
      });
    } else {

      const whiteFallenSoldiers = [];
      const blackFallenSoldiers = [];
      const isDestEnemyOccupied = Boolean(squares[i]);
      const isMovePossible = squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied);

      if (isMovePossible) {
        if (squares[i] !== null) {
          if (squares[i].player === 1) {
            whiteFallenSoldiers.push(squares[i]);
          } else {
            blackFallenSoldiers.push(squares[i]);
          }
        }

        squares[i] = squares[this.state.sourceSelection];
        squares[this.state.sourceSelection] = null;

        const isCheckMe = this.isCheckForPlayer(squares, this.state.player)
        
        const otherPlayer = this.state.player === 1 ? 2 : 1;
        if (!this.hasValidMove(squares, otherPlayer)) {
          if (this.isCheckForPlayer(squares, otherPlayer)) {
            this.setState(oldState => ({
              status: "Checkmate. player " + this.state.player + " wins!",
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
            status: "Wrong selection. Choose valid source and destination again. Now you have a check!",
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
          status: "Wrong selection. Choose valid source and destination again.",
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
    const canPieceKillPlayersKing = (piece, i) => piece.isMovePossible(playersKingPosition, i, squares)
    return squares.reduce((acc, curr, idx) =>
      acc ||
      (curr &&
        (curr.getPlayer() === opponent) &&
        canPieceKillPlayersKing(curr, idx)
        && true),
      false)
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