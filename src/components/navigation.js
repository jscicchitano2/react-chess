import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => (
    <nav>
      <ul>
        <li><NavLink to='/'>Home</NavLink></li>
        <li><NavLink to='/playOnline'>Play Online</NavLink></li>
        <li><NavLink to='/playComputer'>Play Computer</NavLink></li>
        <li><NavLink to='/playOffline'>Play Offline</NavLink></li>
        <li><NavLink to='/login'>Log In</NavLink></li>
        <li><NavLink to='/profile'>Profile</NavLink></li>
      </ul>
    </nav>
);

export default Navigation;