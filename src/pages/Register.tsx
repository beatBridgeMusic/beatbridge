import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthLayoutFancy from '../components/AuthLayoutFancy';
import { useAuth } from '../AuthContext';
interface RegisterValues {
  username: string;
  email: string;
  password: string;
}
const Register = () => {
  const [values, setValues] = useState<RegisterValues>({
    username: '',
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
      const response = await axios.post(
        'http://localhost:3001/auth/register',
        values
      );
      console.log(response);
      if (response.status === 200) {
        const { user } = response.data;
        if (response.data.session) {
          login(user, response.data.session.access_token);
          navigate('/');
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      console.log('Registration failed:', err);
    }
  };
  return (
    <AuthLayoutFancy>
      <div className='flex justify-center items-center h-screen'>
        <div className='shadow-lg px-8 py-5 border w-96 rounded-lg bg-white/20 text-black backdrop-blur-lg'>
          <h2 className='text-lg font-bold mb-4'>Register</h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label htmlFor='username' className='block text-gray-700'>
                Username
              </label>
              <input
                type='text'
                placeholder='Enter Username'
                className='w-full px-3 py-2 border rounded-lg'
                name='username'
                value={values.username}
                onChange={handleChange}
              />
            </div>
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
                type='text'
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
          </form>
          <div className='my-2 text-center text-white-500 text-sm'>OR</div>
          <button
            type='button'
            className='w-full flex items-center justify-center gap-2 
             bg-white text-gray-700 border border-gray-300 rounded-lg 
             shadow-sm hover:shadow-md py-2 
             transform transition duration-200 
             hover:scale-105 active:scale-95'
            onClick={() =>
              (window.location.href = 'http://localhost:3001/auth/login/google')
            }
          >
            <img
              src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
              alt='Google'
              className='w-5 h-5'
            />
            <span className='text-base font-medium '>Sign Up With Google</span>
          </button>
          <div className='text-center my-3'>
            <span>Already have account?</span>
            <Link
              to='/login'
              className='text-blue-900 mx-3 hover:text-green-600 transition-colors duration-200'
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </AuthLayoutFancy>
  );
};

export default Register;
