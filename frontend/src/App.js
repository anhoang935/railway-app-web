import logo from './logo.svg';
import './App.css';
import Layout from './layout/Layout';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
    <Layout/>
    </ThemeProvider>
  );
}

export default App;
