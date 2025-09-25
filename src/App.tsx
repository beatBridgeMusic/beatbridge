// src/App.tsx
import { MoodType } from './features/moods/components/MoodType'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎵 BeatBridge</h1>
        <p>Create musical journeys that flow with your mood</p>
      </header>
      <main>
        <MoodType />
      </main>
    </div>
  )
}

export default App