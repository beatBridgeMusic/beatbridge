// src/App.tsx
import { TransitionLab } from './features/transitions/components/TransitionLab'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <TransitionLab />
      </header>
    </div>
  )
}

export default App