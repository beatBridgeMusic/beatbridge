import { motion } from 'framer-motion';

const FloatingNotes = () => {
  const notes = ['🎵', '🎶', '🎼', '♫'];

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none'>
      {Array.from({ length: 15 }).map((_, i) => {
        const randomNote = notes[Math.floor(Math.random() * notes.length)];
        const delay = Math.random() * 6;
        const duration = 8 + Math.random() * 8;

        return (
          <motion.div
            key={i}
            className='absolute text-white text-2xl sm:text-3xl'
            initial={{ y: '100vh', x: `${Math.random() * 100}vw`, opacity: 0 }}
            animate={{ y: '-10vh', opacity: [0, 1, 0] }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: 'linear',
            }}
          >
            {randomNote}
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingNotes;
