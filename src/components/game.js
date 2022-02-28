import React from 'react';
import '../index.css';
import Board from './board.js';
import initializeBoard from '../helper-functions/initializeBoard.js';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          squares: initializeBoard()
        };
    }

    render() {
        return(
          <div className="game">
            <div className="game-board">
              <Board 
                squares={this.state.squares}
              />
            </div>
          </div>
        );
    }
}