import React, { useState } from 'react';
import { Card, CardBody, Tabs, Tab, Chip, Input } from '@nextui-org/react';
import { useApp } from '../context/AppContext';
import { PatientTable } from '../components/PatientTable';
import { PatientStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Archive,
  Search
} from 'lucide-react';

const tabConfig = {
  'onboarded': {
    label: 'Onboarded',
    icon: Users,
    color: 'success' as const,
  },
  'on-hold': {
    label: 'On Hold',
    icon: Clock,
    color: 'warning' as const,
  },
  'future': {
    label: 'Future',
    icon: Calendar,
    color: 'primary' as const,
  },
  'delivered': {
    label: 'Delivered',
    icon: CheckCircle,
    color: 'success' as const,
  },
  'stock-out': {
    label: 'Stock Out',
    icon: AlertTriangle,
    color: 'danger' as const,
  },
  'archived': {
    label: 'Archived',
    icon: Archive,
    color: 'default' as const,
  },
};

export function DashboardPage() {
  const { state } = useApp();
  const [selectedTab, setSelectedTab] = useState<PatientStatus>('onboarded');
  const [searchQuery, setSearchQuery] = useState('');

  const getPatientsByStatus = (status: PatientStatus) => {
    let patients = state.patients.filter(patient => patient.status === status);
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      patients = patients.filter(patient => 
        patient.name.toLowerCase().includes(query) ||
        patient.mobile.includes(query) ||
        patient.city.toLowerCase().includes(query)
      );
    }
    
    return patients;
  };

  const getStatusCount = (status: PatientStatus) => {
    return state.patients.filter(patient => patient.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient Dashboard
          </h1>
          <p className="text-gray-600">
            Manage and track all your patients in one place
          </p>
        </motion.div>

        {/* Global Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Input
            placeholder="Search patients by name, mobile number, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="h-4 w-4 text-gray-400" />}
            variant="bordered"
            size="lg"
            className="max-w-md"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-lg border-0">
            <CardBody className="p-0">
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as PatientStatus)}
                variant="underlined"
                classNames={{
                  tabList: "gap-2 w-full relative rounded-none p-4 border-b border-divider bg-white",
                  cursor: "w-full bg-primary",
                  tab: "max-w-fit px-4 h-12",
                  tabContent: "group-data-[selected=true]:text-primary"
                }}
              >
                {Object.entries(tabConfig).map(([status, config]) => {
                  const Icon = config.icon;
                  const count = getStatusCount(status as PatientStatus);
                  
                  return (
                    <Tab
                      key={status}
                      title={
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{config.label}</span>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={config.color}
                            className="ml-1"
                          >
                            {count}
                          </Chip>
                        </div>
                      }
                    />
                  );
                })}
              </Tabs>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PatientTable
                      patients={getPatientsByStatus(selectedTab)}
                      status={selectedTab}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}