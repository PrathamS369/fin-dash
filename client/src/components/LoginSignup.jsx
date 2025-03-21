import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      setMessage(response.data.message);
      navigate('/'); // Redirect to home after signup
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error signing up');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('token', response.data.token);  // Store JWT token
      navigate('/dashboard');  // Redirect to Dashboard after login
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error logging in');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <motion.div
        className="bg-white p-8 rounded-xl shadow-2xl w-96"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>

        <button className="w-full bg-red-600 text-white py-2 rounded-lg mb-4 hover:bg-red-700 transition duration-300">
          Login with Google
        </button>

        <div className="text-gray-500 text-sm mb-4">or use your email</div>

        {isSignup && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full p-2 mb-4 border rounded"
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleInputChange}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-300"
          onClick={isSignup ? handleSignup : handleLogin}
        >
          {isSignup ? 'Signup' : 'Login'}
        </button>
        {message && <p className="mt-4 text-red-600">{message}</p>}

        <div className="text-sm text-gray-500 mt-4">
          {isSignup ? 'Already have an account?' : 'Don’t have an account?'}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? ' Login' : ' Signup'}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginSignup;
