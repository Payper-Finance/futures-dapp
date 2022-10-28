import React, { useState, useEffect, useContext } from 'react'
import Main from './Main';
import UserContext from './ContextProvider'

function App() {
  const { setTheme,Theme} = useContext(UserContext)
  const lightstyle ={
    background:"aliceBlue",
    color:"black"
  }

  return (
    <div className="App" style={Theme=="Light"?lightstyle:{}} >
      <Main />
    </div>
  );
}

export default App;
