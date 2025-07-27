import React from 'react';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } from '@nextui-org/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Activity, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, dispatch } = useApp();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const isOnboarding = location.pathname === '/';
  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname === '/dashboard';

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar 
        className="bg-white/80 backdrop-blur-md border-b border-gray-200"
        maxWidth="full"
        height="4rem"
      >
        <NavbarBrand>
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">MedAdmin</span>
          </motion.div>
        </NavbarBrand>

        <NavbarContent justify="end">
          <NavbarItem>
            {isOnboarding && (
              <Button
                color="primary"
                variant="ghost"
                onPress={() => navigate('/login')}
                className="font-medium"
              >
                Login
              </Button>
            )}
            
            {isLogin && (
              <Button
                color="default"
                variant="light"
                onPress={() => navigate('/')}
                className="font-medium"
              >
                Back
              </Button>
            )}
            
            {isDashboard && state.user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden sm:block">
                  Welcome, {state.user.name}
                </span>
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleLogout}
                  startContent={<LogOut className="h-4 w-4" />}
                  size="sm"
                >
                  Logout
                </Button>
              </div>
            )}
          </NavbarItem>
        </NavbarContent>
      </Navbar>
    </motion.div>
  );
}