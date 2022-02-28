import React from 'react';
import '../index.css';
import Board from './board.js';

export default class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          squares: Array(64).fill(null)
        };
    }

    render() {
        return(
          <div className="game">
            <div className="game-board">
              <Board />
            </div>
          </div>
        );
    }
}