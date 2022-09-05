
import Main from './Main';
import {Routes,Route} from 'react-router-dom'
import TradeChart from './components/TradeChart';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/chart" element={<TradeChart/>}/>
        <Route path="/" element={<Main/>}/>
      </Routes>

    </div>
  );
}

export default App;
