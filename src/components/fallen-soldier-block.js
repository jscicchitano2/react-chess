import React from 'react';
import '../index.css';
import Square from './square.js';

export default class FallenSoldierBlock extends React.Component {

  renderSquare(square, i, value, shade) {
    return <Square
      key={i}
      keyVal={i}
      piece={square}
      style={square.style}
      value={value}
      shade={shade}
    />
  }

  render() {
    return (
      <div>
        <div className="board-row">{this.props.whiteFallenSoldiers.map((ws, index) =>
          this.renderSquare(ws, index)
        )}{this.renderSquare("", this.props.blackFallenSoldiers.length, this.props.whitePlayer === 1 ? 
            this.props.player2Score : this.props.player1Score, "points")}
        </div>
        <div className="board-row">{this.props.blackFallenSoldiers.map((bs, index) =>
          this.renderSquare(bs, index)
        )}{this.renderSquare("", this.props.whiteFallenSoldiers.length, this.props.whitePlayer === 1 ? 
            this.props.player1Score : this.props.player2Score, "points")}
        </div>
      </div>
    );
  }
}