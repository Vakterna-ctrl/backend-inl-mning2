import React from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'
import AddList from './Components/AddList'
import './App.css';

const URL = 'http://localhost:8080'
function App() {

  return (
    <div className="App">
    <header className="TrelloHeader">
    <h1 className="TrelloTitle">Trello</h1>
    </header>
    <AddList/>
    </div>
  );
}

export default App;
