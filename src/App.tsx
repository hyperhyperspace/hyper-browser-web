import './App.css';
import { CssBaseline, ThemeProvider } from '@mui/material';
import StartPage from './pages/StartPage';
import { lightTheme } from './themes';
import HomeSpace from './pages/HomeSpace';
import { Route, Routes } from 'react-router';


function App() {
  return (
    <div style={{height: "100%"}}> 
      <header>
        {/*<img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
      </a>*/}
        <CssBaseline />
      </header>
      <ThemeProvider theme={lightTheme}>
        <Routes>
          <Route path="start" element={<StartPage />} />
          <Route index element={<HomeSpace />} />
          <Route path="/" element={<HomeSpace />} />
        </Routes>
      </ThemeProvider>
    </div>
  );
}

export default App;
