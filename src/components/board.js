import React from 'react';
import '../index.css';
import Square from './square.js';

export default class Board extends React.Component {
    renderSquare(squareNumber, squareShade) {
        return (
          <Square
            key={squareNumber}
            style={this.props.squares[squareNumber] ? this.props.squares[squareNumber].style : null}
            shade={squareShade}
          />
        );
    }
    
    render() {
        const board = [];
        for (let row = 0; row < 8; row++) {
            const squares = [];
            for (let col = 0; col < 8; col++) {
                const squareShade = (isEven(row) && isEven(col)) || (!isEven(row) && !isEven(col)) ? "light-square" : "dark-square";
                squares.push(this.renderSquare((row * 8) + col, squareShade));
            }
            board.push(<div className="board-row" key={row}>{squares}</div>);
        }

        return (
            <div>{board}</div>
        );
    }
}

function isEven(num) {
    return num % 2 === 0
}