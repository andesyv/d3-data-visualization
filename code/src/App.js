import React from 'react';
// import logo from './logo.svg';
import './App.css';
const d3 = require('d3');

function App() {
  
  const jsx = (
    <p>
      Hello my world!
    </p>
  );

  d3.select("p").style("color", "green");
  return jsx;
}

export default App;
