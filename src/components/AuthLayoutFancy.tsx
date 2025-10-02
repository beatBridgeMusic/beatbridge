import React from 'react';

import FloatingNotes from './FloatingNotes';
import '../auth-layout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayoutFancy = ({ children }: AuthLayoutProps) => {
  return (
    <div className='relative bg-animated min-h-screen flex flex-col overflow-hidden'>
      {/* Overlay */}
      <div className='absolute inset-0 bg-black/40 z-0'></div>

      {/* Floating notes */}
      <FloatingNotes />

      {/* Banner at the top */}
      <div className='relative z-50 text-center text-black pt-8 pb-0 flex-shrink-0'>
        <h1 className='text-4xl font-extrabold'>BeatBridge.</h1>
        <p className='text-lg font-light'>
          Order your customized playlist by any metric for the perfect flow
        </p>
      </div>

      {/* Center the form */}
      <div className='flex-1 flex justify-center items-center -mt-16'>
        <div className='relative z-50 w-full max-w-md px-4'>{children}</div>
      </div>
    </div>
  );
};

export default AuthLayoutFancy;
