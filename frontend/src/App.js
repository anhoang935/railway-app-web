import logo from './logo.svg';
import './App.css';
import Layout from './layout/Layout';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/authContext'; 

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
