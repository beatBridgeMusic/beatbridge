import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayoutFancy from '../components/AuthLayoutFancy';
import { useAuth } from '../AuthContext';
interface LoginValues {
  email: string;
  password: string;
}
const Login = () => {
  const [values, setValues] = useState<LoginValues>({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/login', values);
      const { user, session } = response.data;
      const uuid = session.user.id;
      login(user, session.access_token);

      console.log('userData:', response.data);
      console.log('logged in:', user);
      navigate('/', { state: { uuid } });
    } catch (err) {
      console.log('Login failed:', err);
    }
  };
  return (
    <AuthLayoutFancy>
      <div className='flex justify-center items-center h-screen'>
        <div className='shadow-lg px-8 py-5 border w-96 rounded-lg bg-white/20 text-black backdrop-blur-lg'>
          <h2 className='text-lg font-bold mb-4'>Login</h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label htmlFor='email' className='block text-gray-700'>
                Email
              </label>
              <input
                type='text'
                placeholder='Enter Email'
                className='w-full px-3 py-2 border rounded-lg'
                name='email'
                value={values.email}
                onChange={handleChange}
              />
            </div>
            <div className='mb-4'>
              <label htmlFor='password' className='block text-gray-700'>
                Password
              </label>
              <input
                type='password'
                placeholder='Enter Password'
                className='w-full px-3 py-2 border rounded-lg'
                name='password'
                value={values.password}
                onChange={handleChange}
              />
            </div>
            <button
              type='submit'
              className='w-full bg-green-600 text-white py-2 rounded-lg transform transition duration-200 hover:scale-105 hover:bg-green-700 active:scale-95 shadow-md hover:shadow-lg"'
            >
              Submit
            </button>
            <div className='my-2 text-center text-white-500 text-sm'>OR</div>
            <button
              type='button'
              className='w-full flex items-center justify-center gap-2 
             bg-white text-gray-700 border border-gray-300 rounded-lg 
             shadow-sm hover:shadow-md py-2 
             transform transition duration-200 
             hover:scale-105 active:scale-95'
              onClick={() => (window.location.href = 'http://localhost:3001/auth/login/google')}
            >
              <img
                src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
                alt='Google'
                className='w-5 h-5'
              />
              <span className='text-base font-medium '>Sign in with Google</span>
            </button>
          </form>
          <div className='text-center my-3'>
            <span>Don't have an account?</span>
            <Link to='/register' className='text-blue-900 mx-3 hover:text-green-600 transition-colors duration-200'>
              Register
            </Link>
          </div>
        </div>
      </div>
    </AuthLayoutFancy>
  );
};

export default Login;
