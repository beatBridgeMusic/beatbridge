import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import { TransitionLab } from './features/transitions/components/TransitionLab';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<TransitionLab />}></Route>
        <Route path='/register' element={<Register />}></Route>
        <Route path='/login' element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App