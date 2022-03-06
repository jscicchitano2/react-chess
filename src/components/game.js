import React from 'react';
import '../index.css';
import Board from './board.js';
import King from '../pieces/king';
import Rook from '../pieces/rook';
import Pawn from '../pieces/pawn';
import initializeBoard from '../helper-functions/initializeBoard.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
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
        lastMove: [null, null],
        history: [initializeBoard()],
        stepNumber: 0,
        timerPlayer1: null,
        timerPlayer2: null,
        gameOver: false
      };
  }

  handleClick(i) {
    if (this.state.gameOver || this.state.stepNumber !== this.state.history.length - 1) return;

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
      if (this.state.stepNumber === 0) {
        const timer1 = new Timer(1, 600, document.querySelector('#time-1'));
        timer1.startTimer();
        this.setState({
          timerPlayer1: timer1
        })
      }
      return
    } else {
      const isPossible = squares[this.state.sourceSelection] instanceof Pawn ? 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, Boolean(squares[i]), this.state.lastMove) : 
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
        if (this.state.player === 1) {
          this.state.timerPlayer1.pause();
          if (this.state.stepNumber === 0) {
            let timer2 = new Timer(2, 600, document.querySelector('#time-2'));
            timer2.startTimer();
            this.setState({
              timerPlayer2: timer2
            })
            this.isTimeOut();
          } else {
            this.state.timerPlayer2.unPause();
          }
        } else {
          this.state.timerPlayer2.pause();
          this.state.timerPlayer1.unPause();
        }
        this.setState({
          lastMove: [this.state.sourceSelection, i],
          sourceSelection: -1,
          squares,
          history: this.state.history.concat([squares]),
          stepNumber: this.state.history.length,
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
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied, this.state.lastMove) : 
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

        if (squares[this.state.sourceSelection] instanceof Pawn && 
          squares[this.state.sourceSelection].isEnPassat(this.state.sourceSelection, i, this.state.lastMove)) {
            squares[i] = squares[this.state.sourceSelection];
            squares[this.state.sourceSelection] = null;
            if (this.state.player === 1) {
              blackFallenSoldiers.push(squares[i + 8]);
              squares[i + 8] = null;
            } else {
              whiteFallenSoldiers.push(squares[i - 8]);
              squares[i - 8] = null;
            }
        } else {
          squares[i] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection] = null;
          squares[i].hasMoved = true;
        }

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
              history: this.state.history.concat([squares]),
              stepNumber: this.state.history.length,
              gameOver: true
            }))
          } else {
            this.setState(oldState => ({
              status: "Draw by stalemate!",
              sourceSelection: -1,
              squares,
              history: this.state.history.concat([squares]),
              stepNumber: this.state.history.length,
              gameOver: true
            }))
          }
          this.state.timerPlayer1.pause();
          this.state.timerPlayer2.pause();
          return
        }

        if (isCheckMe) {
          this.setState(oldState => ({
            sourceSelection: -1,
          }))
        } else {
          let player = this.state.player === 1 ? 2 : 1;
          let turn = this.state.turn === 'white' ? 'black' : 'white';

          if (this.state.player === 1) {
            this.state.timerPlayer1.pause();
            if (this.state.stepNumber === 0) {
              let timer2 = new Timer(2, 600, document.querySelector('#time-2'));
              timer2.startTimer();
              this.setState({
                timerPlayer2: timer2
              })
              this.isTimeOut();
            } else {
              this.state.timerPlayer2.unPause();
            }
          } else {
            this.state.timerPlayer2.pause();
            this.state.timerPlayer1.unPause();
          }

          this.setState(oldState => ({
            lastMove: [this.state.sourceSelection, i],
            sourceSelection: -1,
            squares,
            whiteFallenSoldiers: [...oldState.whiteFallenSoldiers, ...whiteFallenSoldiers],
            blackFallenSoldiers: [...oldState.blackFallenSoldiers, ...blackFallenSoldiers],
            player,
            history: this.state.history.concat([squares]),
            stepNumber: this.state.history.length,
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

  isTimeOut() {
    var self = this;
    this.interval = setInterval(function() {
        if (self.state.timerPlayer1.duration < 1) {
          self.state.timerPlayer1.pause();
          self.state.timerPlayer2.pause();
          self.setState(oldState => ({
            status: "Time expired. Player 2 wins!",
            sourceSelection: -1,
            gameOver: true
          }))
        } else if (self.state.timerPlayer2.duration < 1) {
          self.state.timerPlayer1.pause();
          self.state.timerPlayer2.pause();
          self.setState(oldState => ({
            status: "Time expired. Player 1 wins!",
            sourceSelection: -1,
            gameOver: true
          }))
        }
    }, 1000);
  }

  jumpNext(prev) {
    const newStepNumber = prev ? Math.max(0, this.state.stepNumber - 1) : Math.min(this.state.history.length - 1, this.state.stepNumber + 1);
    this.setState({
      stepNumber: newStepNumber,
      squares: this.state.history[newStepNumber]
    });
  }

  jumpTo(first) {
    const newStepNumber = first ? 0 : this.state.history.length - 1;
    this.setState({
      stepNumber: newStepNumber,
      squares: this.state.history[newStepNumber]
    });
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
        piece.isMovePossible(i, playersKingPosition, true, [null, null]) : 
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
          if (i !== j && !(squares[j] && squares[j].player === player) && squares[i].isMovePossible(i, j, squares, [null, null])) {
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
        piece.isMovePossible(i, position, true, [null, null]) : 
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
            <div>
              <button onClick={() => this.jumpTo(true)}>{"<<"}</button>
              <button onClick={() => this.jumpNext(true)}>{"<"}</button>
              <button onClick={() => this.jumpNext(false)}>{">"}</button>
              <button onClick={() => this.jumpTo(false)}>{">>"}</button>
            </div>
            <div>Player 1: <span id="time-1">10:00</span></div>
            <div>Player 2: <span id="time-2">10:00</span></div>
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

class Timer {
  constructor(player, duration, display) {
    this.player = player;
    this.duration = duration;
    this.display = display
    this.interval = null;
  }

  startTimer() {
    var timer = this.duration, minutes, seconds, display = this.display, self = this;
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = minutes + ":" + seconds;
    self.duration = timer--;

    if (timer < 0) {
        timer = this.duration;
    }
    this.interval = setInterval(function() {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      display.textContent = minutes + ":" + seconds;
      self.duration = timer--;

      if (timer < 0) {
          timer = this.duration;
      }
    }, 1000);
  }

  pause() {
    clearInterval(this.interval);
  }

  unPause() {
    this.startTimer();
  }
} 