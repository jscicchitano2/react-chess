import React from 'react';
import { NavLink, Routes, Route } from 'react-router-dom';
import Game from './game';
import Home from './home';
import Login from './login';
import Profile from './profile';
import OfflineGame from './offlineGame';
import Lobby from './lobby';

const Main = () => (
    <Routes>
        <Route path='/' element={<Home/>}></Route>
        <Route path='/playComputer' element={<Game/>}></Route>
        <Route path='/playOnline' element={<Lobby/>}></Route>
        <Route path='/playOffline' element={<OfflineGame/>}></Route>
        <Route path='/login' element={<Login/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
    </Routes>
);

export default Main;