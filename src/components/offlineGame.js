import React from 'react';
import '../index.css';
import Board from './board.js';
import Bishop from '../pieces/bishop';
import Knight from '../pieces/knight';
import King from '../pieces/king';
import Queen from '../pieces/queen';
import Rook from '../pieces/rook';
import Pawn from '../pieces/pawn';
import initializeBoard from '../helper-functions/initializeBoard.js';
import FallenSoldierBlock from './fallen-soldier-block.js';
import {boardToFen} from '../helper-functions/fen.js';

export default class OfflineGame extends React.Component {
  constructor(props) {
      var whitePlayer = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
      super(props);
      this.state = {
        whitePlayer: whitePlayer,
        moved: false,
        squares: initializeBoard(whitePlayer),
        player: whitePlayer,
        sourceSelection: -1,
        status: '',
        turn: 'white',
        whiteFallenSoldiers: [],
        blackFallenSoldiers: [],
        lastMove: [null, null],
        history: [initializeBoard(whitePlayer)],
        stepNumber: 0,
        timerPlayer1: null,
        timerPlayer2: null,
        player1Score: 0,
        player2Score: 0,
        aiLevel: 1,
        gameOver: false,
        numMoves: 0
      };
  }

  handleClick(i) {
    if (this.state.gameOver || this.state.stepNumber !== this.state.history.length - 1) return;
    if (this.state.player === 2) {
      if (this.state.stepNumber === 0 && !this.state.moved) {
        this.moveBot();
        this.setState({
          moved: true
        })
      }
      return;
    }
    const squares = [...this.state.squares];
    if (this.state.sourceSelection === -1) {
      if (!squares[i] || squares[i].player !== this.state.player) {
        if (squares[i]) {
          squares[i].style = { ...squares[i].style, backgroundColor: "" };
          this.clearMoves();
        }
      } else {
        squares[i].style = { ...squares[i].style, backgroundColor: "RGB(111,143,114)" }; // Emerald from http://omgchess.blogspot.com/2015/09/chess-board-color-schemes.html
        this.showMoves(i);
        this.setState({
          sourceSelection: i
        })
      }
      if (this.state.timerPlayer1 === null) {
        const timer1 = new Timer(1, 600, document.querySelector('#time-1'));
        timer1.startTimer();
        this.setState({
          timerPlayer1: timer1
        })
      }
      return
    } else {
      const isPossible = squares[this.state.sourceSelection] instanceof Pawn ? 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, Boolean(squares[i]), this.state.lastMove, squares) : 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, squares);
      if (((squares[i] && squares[i].player === this.state.player) || !isPossible)) {
        squares[this.state.sourceSelection].style = { ...squares[this.state.sourceSelection].style, backgroundColor: "" };
        this.clearMoves();
        this.setState({
          sourceSelection: -1
        });
      }
    }
    this.clearMoves();

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
          if (this.state.timerPlayer2 === null) {
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
          numMoves: this.state.numMoves + 1,
          lastMove: [this.state.sourceSelection, i],
          sourceSelection: -1,
          squares,
          history: this.state.history.concat([squares]),
          stepNumber: this.state.history.length,
          player,
          status: '',
          turn
        }, this.moveBot);
      }
    } else {

      const whiteFallenSoldiers = [];
      const blackFallenSoldiers = [];
      const isDestEnemyOccupied = Boolean(squares[i]);
      const isMovePossible = squares[this.state.sourceSelection] instanceof Pawn ? 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, isDestEnemyOccupied, this.state.lastMove, squares) : 
        squares[this.state.sourceSelection].isMovePossible(this.state.sourceSelection, i, squares);
      const testSquares = [...squares];
      testSquares[i] = testSquares[this.state.sourceSelection];
      testSquares[this.state.sourceSelection] = null;
      const leadsToCheck = this.isCheckForPlayer(testSquares, this.state.player);
      
      if (isMovePossible && !leadsToCheck) {
        if (squares[i] !== null) {
          if (squares[i].player === this.state.whitePlayer) {
            whiteFallenSoldiers.push(squares[i]);
          } else {
            blackFallenSoldiers.push(squares[i]);
          }
        }

        if (squares[this.state.sourceSelection] instanceof Pawn && 
          squares[this.state.sourceSelection].isEnPassat(this.state.sourceSelection, i, this.state.lastMove)) {
            squares[i] = squares[this.state.sourceSelection];
            squares[this.state.sourceSelection] = null;
            if (this.state.player === this.state.whitePlayer) {
              blackFallenSoldiers.push(squares[i + 8]);
              squares[i + 8] = null;
            } else {
              whiteFallenSoldiers.push(squares[i - 8]);
              squares[i - 8] = null;
            }
            this.setScore(new Pawn(), this.state.player);
        } else {
          if (isDestEnemyOccupied) this.setScore(squares[i], this.state.player);
          squares[i] = squares[this.state.sourceSelection];
          squares[this.state.sourceSelection] = null;
          squares[i].hasMoved = true;
        }

        // Pawn promotions
        if (squares[i] instanceof Pawn && squares[i].canPromote(i)) {
          squares[i] = new Queen(this.state.player, this.state.whitePlayer);
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
            if (this.state.timerPlayer2 === null) {
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
            numMoves: this.state.numMoves + 1,
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
          this.setState({}, this.moveBot)
        }
      } else {
        this.setState({
          sourceSelection: -1,
        });
      }
    }
  }

  moveBot() {
    var squares = [...this.state.squares];
    var enPassat = this.getEnPassat();
    let player = 1;
    let turn = this.state.whitePlayer === 1 ? 'white' : 'black';
    var fen = boardToFen(squares, enPassat, this.state.whitePlayer);
    var sf = eval('stockfish');
    sf.postMessage(`uci`);
    sf.postMessage(`setoption name Skill Level value ${this.state.aiLevel - 1}`);
    sf.postMessage(`setoption name Skill Level Maximum Error value 900`);
    sf.postMessage(`setoption name Skill Level Probability value 10`);
    sf.postMessage(`position fen ${fen}`);
    sf.postMessage(`go depth 10`);
    sf.onmessage = (event) => { 
      console.log(event);
      let message = event.data ? event.data : event;
      if (message.startsWith("bestmove")) {
        var move = message.split(" ")[1];
        var newSquares = this.move(move);
        
        const otherPlayer = 1;
        if (!this.hasValidMove(newSquares, otherPlayer)) {
          if (this.isCheckForPlayer(newSquares, otherPlayer)) {
            this.setState(oldState => ({
              status: "Checkmate. Player " + 2 + " wins!",
              sourceSelection: -1,
              squares: newSquares,
              history: this.state.history.concat([newSquares]),
              stepNumber: this.state.history.length,
              gameOver: true
            }))
          } else {
            this.setState(oldState => ({
              status: "Draw by stalemate!",
              sourceSelection: -1,
              squares: newSquares,
              history: this.state.history.concat([newSquares]),
              stepNumber: this.state.history.length,
              gameOver: true
            }))
          }
          this.state.timerPlayer1.pause();
          this.state.timerPlayer2.pause();
          return
        }

        if (this.state.timerPlayer2) this.state.timerPlayer2.pause();
        if (this.state.timerPlayer1) this.state.timerPlayer1.unPause();

        this.setState({
          numMoves: this.state.numMoves + 1,
          squares: newSquares,
          sourceSelection: -1,
          player,
          history: this.state.history.concat([newSquares]),
          stepNumber: this.state.history.length,
          status: '',
          turn
        })
      }
    }
  }

  getEnPassat() {
    var src = this.state.lastMove[0];
    var dest = this.state.lastMove[1];
    var squares = this.state.squares;
    if (squares[dest] instanceof Pawn && dest >= 32 && dest < 40 && src >= 48 && src < 56) {
      var enPassatTarget = dest + 8;
      var col = String.fromCharCode(97 + (enPassatTarget % 8));
      var row = Math.floor(8 - (enPassatTarget / 8));
      return col + row;
    }
    return "-";
  }

  move(move) {
    var newSquares = [...this.state.squares];
    var src = move.slice(0, 2);
    var dest = move.slice(2);
    src = ((8 - parseInt(src[1])) * 8) + (src[0].charCodeAt(0) - 97); 
    dest = ((8 - parseInt(dest[1])) * 8) + (dest[0].charCodeAt(0) - 97); 
    const whiteFallenSoldiers = [];
    const blackFallenSoldiers = [];
    const isDestEnemyOccupied = Boolean(newSquares[dest]);
    if (isDestEnemyOccupied) {
      if (this.state.whitePlayer === 1) {
        whiteFallenSoldiers.push(newSquares[dest]);
      } else {
        blackFallenSoldiers.push(newSquares[dest]);
      }
      this.setScore(newSquares[dest], 2);
    }
    newSquares[dest] = newSquares[src];
    newSquares[src] = null;
    // Pawn promotions
    if (newSquares[dest] instanceof Pawn && newSquares[dest].canPromote(dest)) {
      newSquares[dest] = new Queen(this.state.player, this.state.whitePlayer);
    }
    this.setState(oldState => ({
      whiteFallenSoldiers: [...oldState.whiteFallenSoldiers, ...whiteFallenSoldiers],
      blackFallenSoldiers: [...oldState.blackFallenSoldiers, ...blackFallenSoldiers],
    }));
    return newSquares;
  }

  isTimeOut() {
    var self = this;
    this.interval = setInterval(function() {
        if (self.state.timerPlayer1 && self.state.timerPlayer1.duration < 1) {
          self.state.timerPlayer1.pause();
          self.state.timerPlayer2.pause();
          self.setState(oldState => ({
            status: "Time expired. Player 2 wins!",
            sourceSelection: -1,
            gameOver: true
          }))
        } else if (self.state.timerPlayer2 && self.state.timerPlayer2.duration < 1) {
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

  setScore(piece, player) {
    var score = 0;
    if (piece instanceof Pawn) {
      score += 1;
    } else if (piece instanceof Knight || piece instanceof Bishop) {
      score += 3;
    } else if (piece instanceof Rook) {
      score += 5;
    } else {
      score += 9;
    }

    var player1Score = this.state.player1Score;
    var player2Score = this.state.player2Score;
    if (player === 1) {
      score += this.state.player1Score;
      if (score > this.state.player2Score) {
        player1Score = score - this.state.player2Score;
        player2Score = 0;
      } else {
        player2Score = player2Score - score;
        player1Score = 0;
      }
    } else {
      score += this.state.player2Score;
      if (score > this.state.player1Score) {
        player2Score = score - this.state.player1Score;
        player1Score = 0;
      } else {
        player1Score = player1Score - score;
        player2Score = 0;
      }
    }
    this.setState({
      player1Score: player1Score,
      player2Score: player2Score
    });
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
        piece.isMovePossible(i, playersKingPosition, true, [null, null], squares) : 
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
    const isMovePossible = function(i, j) {
      return squares[i] instanceof Pawn ? 
        squares[i].isMovePossible(i, j, Boolean(squares[j]), [null, null], squares) : 
        squares[i].isMovePossible(i, j, squares);
    }
    for (var i = 0; i < 64; i++) {
      if (squares[i] != null && squares[i].player === player) {
        for (var j = 0; j < 64; j++) {
          if (i !== j && !(squares[j] && squares[j].player === player) && isMovePossible(i, j)) {
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
        piece.isMovePossible(i, position, true, [null, null], squares) : 
        piece.isMovePossible(i, position, squares);
    }
    for (var i = 0; i < 64; i++) {
      if (squares[i] != null && squares[i].player === opponent && canPieceKillPlayersPiece(squares[i], i)) {
        return true;
      }
    }
    return false;
  }

  showMoves(position) {
    var squares = this.state.squares;
    var piece = this.state.squares[position];
    var rows = document.getElementsByClassName("board-row");
    var board = [];
    for (var x = 0; x < rows.length; x++) {
      var row = rows[x].children;
      for (var y = 0; y < row.length; y++) {
        board.push(row[y]);
      }
    }
    for (var i = 0; i < 64; i++) {
      var isMovePossible = piece instanceof Pawn ? piece.isMovePossible(position, i, Boolean(squares[i]), this.state.lastMove, squares) : 
          piece.isMovePossible(position, i, squares);
      if (isMovePossible) {
        if (!squares[i]) {
          var color = board[i].classList[1];
          color = color === "light-square" ? "#d0dff4" : "#4b648a";
          board[i].style.backgroundImage = "radial-gradient(rgba(20,85,30,0.5) 19%, " + color + " 20%)";
        } else if (squares[i] && squares[i].player !== squares[position].player) {
          board[i].style.backgroundColor = "RGB(111,143,114)";
        }
      }
    }
  }

  clearMoves() {
    var rows = document.getElementsByClassName("board-row");
    var board = [];
    for (var x = 0; x < rows.length; x++) {
      var row = rows[x].children;
      for (var y = 0; y < row.length; y++) {
        board.push(row[y]);
      }
    }
    for (var i = 0; i < 64; i++) {
      var image = board[i].style.backgroundImage;
      if (image.indexOf("url") < 0 ) {
        board[i].style.background = "";
      } else {
        board[i].style.backgroundColor = "";
      }
    }
  }

  newGame() {
    var whitePlayer = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
    var timerPlayer1 = this.state.timerPlayer1;
    timerPlayer1.setDuration(600);
    var timerPlayer2 = this.state.timerPlayer2;
    timerPlayer2.setDuration(600);
    this.setState({
      whitePlayer: whitePlayer,
      moved: false,
      squares: initializeBoard(whitePlayer),
      player: whitePlayer,
      sourceSelection: -1,
      status: '',
      turn: 'white',
      whiteFallenSoldiers: [],
      blackFallenSoldiers: [],
      lastMove: [null, null],
      history: [initializeBoard(whitePlayer)],
      stepNumber: 0,
      player1Score: 0,
      player2Score: 0,
      timerPlayer1: timerPlayer1,
      timerPlayer2: timerPlayer2,
      aiLevel: 1,
      gameOver: false,
      numMoves: 0
    })
  }

  resign() {
    if (this.state.timerPlayer1) this.state.timerPlayer1.pause();
    if (this.state.timerPlayer2) this.state.timerPlayer2.pause();
    this.setState({
      status: "Player 1 resigned. Player 2 wins!",
      sourceSelection: -1,
      gameOver: true
    })
  }

  setStockfishLevel = (e) => {
    this.setState({ aiLevel: e.target.value });
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
            <p>
              <button onClick={() => this.newGame()}>{"New Game"}</button>
              <button onClick={() => this.resign()}>{"Resign"}</button>
            </p>
            <div style={this.state.stepNumber === 0 ? {display: 'block'} : {display: 'none'}}> 
              <label>Stockfish level:</label>
              <select name="ai-level" id="ai-level" value={this.state.aiLevel} onChange={this.setStockfishLevel}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
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
                player1Score={this.state.player1Score === 0 ? "" : "+ " + this.state.player1Score}
                player2Score={this.state.player2Score === 0 ? "" : "+ " + this.state.player2Score}
                whitePlayer={this.state.whitePlayer}
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

  setDuration(newDuration) {
    this.duration = newDuration;
    var timer = this.duration
    var minutes = parseInt(timer / 60, 10);
    var seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    this.display.textContent = minutes + ":" + seconds;
    this.pause();
  }
} 