import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Input, Button } from '@nextui-org/react';
import { useApp } from '../context/AppContext';
import { Patient } from '../types';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UserPlus, Phone, MapPin, User } from 'lucide-react';

export function OnboardingPage() {
  const { dispatch } = useApp();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    city: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name || !form.mobile || !form.city) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newPatient: Patient = {
      id: Date.now().toString(),
      name: form.name,
      mobile: form.mobile,
      city: form.city,
      status: 'onboarded',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_PATIENT', payload: newPatient });
    toast.success('Patient onboarded successfully!');
    
    setForm({ name: '', mobile: '', city: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0">
          <CardHeader className="flex flex-col items-center gap-3 pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center"
            >
              <UserPlus className="h-8 w-8 text-blue-600" />
            </motion.div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">Patient Onboarding</h1>
              <p className="text-gray-600 mt-1">Enter patient details to get started</p>
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
                  label="Full Name"
                  placeholder="Enter patient's full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                  label="Mobile Number"
                  placeholder="Enter mobile number"
                  type="tel"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  startContent={<Phone className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Input
                  label="City"
                  placeholder="Enter city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  startContent={<MapPin className="h-4 w-4 text-gray-400" />}
                  variant="bordered"
                  size="lg"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  className="w-full font-semibold"
                  isLoading={isSubmitting}
                  loadingText="Adding Patient..."
                >
                  Add Patient
                </Button>
              </motion.div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}