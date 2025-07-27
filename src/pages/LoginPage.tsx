import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Button } from '@nextui-org/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LogIn, User, Lock } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.username || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock authentication - accept any username/password
    if (form.username && form.password) {
      const user = {
        username: form.username,
        name: form.username.charAt(0).toUpperCase() + form.username.slice(1),
      };
      
      dispatch({ type: 'LOGIN', payload: user });
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="flex flex-col items-center gap-3 pb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <LogIn className="h-8 w-8 text-blue-600" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-1">Sign in to access your dashboard</p>
            </div>
          </CardHeader>
          
          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Input
                  label="Username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  startContent={<User className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Input
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  startContent={<Lock className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Demo credentials: Any username and password will work
                  </p>
                </div>
              </motion.div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}