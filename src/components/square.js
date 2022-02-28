import React from 'react';
import '../index.css';

export default function Square(props) {
    return (
        <button 
            class={"square " + props.shade}
            style={props.style}
        >
        </button>
    );
}