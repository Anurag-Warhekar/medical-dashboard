import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  useDisclosure,
} from '@nextui-org/react';
import { MoreVertical, Edit3, Archive } from 'lucide-react';
import { Patient, PatientStatus } from '../types';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface PatientTableProps {
  patients: Patient[];
  status: PatientStatus;
}

const statusConfig = {
  'onboarded': { color: 'success' as const, label: 'Onboarded' },
  'on-hold': { color: 'warning' as const, label: 'On Hold' },
  'future': { color: 'primary' as const, label: 'Future' },
  'delivered': { color: 'success' as const, label: 'Delivered' },
  'stock-out': { color: 'danger' as const, label: 'Stock Out' },
  'archived': { color: 'default' as const, label: 'Archived' },
};

const statusOptions = [
  { key: 'onboarded', label: 'Onboarded' },
  { key: 'on-hold', label: 'On Hold' },
  { key: 'future', label: 'Future' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'stock-out', label: 'Stock Out' },
  { key: 'archived', label: 'Archived' },
];

export function PatientTable({ patients, status }: PatientTableProps) {
  const navigate = useNavigate();
  const { dispatch } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);
  const [editForm, setEditForm] = React.useState({
    name: '',
    mobile: '',
    city: '',
    status: '' as PatientStatus,
  });

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setEditForm({
      name: patient.name,
      mobile: patient.mobile,
      city: patient.city,
      status: patient.status,
    });
    onOpen();
  };

  const handleSave = () => {
    if (selectedPatient) {
      dispatch({
        type: 'UPDATE_PATIENT',
        payload: {
          id: selectedPatient.id,
          updates: editForm,
        },
      });
      toast.success('Patient updated successfully!');
      onClose();
    }
  };

  const handleStatusChange = (patient: Patient, newStatus: PatientStatus) => {
    dispatch({
      type: 'UPDATE_PATIENT',
      payload: {
        id: patient.id,
        updates: { status: newStatus },
      },
    });
    toast.success(`Patient moved to ${statusConfig[newStatus].label}`);
  };

  const handleArchive = (patient: Patient) => {
    dispatch({
      type: 'UPDATE_PATIENT',
      payload: {
        id: patient.id,
        updates: { status: 'archived' },
      },
    });
    toast.success('Patient archived');
  };

  const handleRowClick = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  if (patients.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-12 text-gray-500"
      >
        <div className="text-6xl mb-4">📋</div>
        <p className="text-lg font-medium">No patients found</p>
        <p className="text-sm">Patients will appear here once added</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <Table 
          aria-label={`${statusConfig[status].label} patients`}
          className="min-h-[400px]"
          removeWrapper
        >
          <TableHeader>
            <TableColumn>NAME</TableColumn>
            <TableColumn>MOBILE</TableColumn>
            <TableColumn className="hidden sm:table-cell">CITY</TableColumn>
            <TableColumn>STATUS</TableColumn>
            <TableColumn>ACTIONS</TableColumn>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => (
              <TableRow 
                key={patient.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleRowClick(patient)}
              >
                <TableCell>
                  <div className="font-medium text-gray-900">{patient.name}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-600">{patient.mobile}</div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="text-gray-600">{patient.city}</div>
                </TableCell>
                <TableCell>
                  <Chip
                    color={statusConfig[patient.status].color}
                    size="sm"
                    variant="flat"
                  >
                    {statusConfig[patient.status].label}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu>
                      <DropdownItem
                        key="edit"
                        startContent={<Edit3 className="h-4 w-4" />}
                        onPress={() => handleEdit(patient)}
                      >
                        Edit
                      </DropdownItem>
                      {statusOptions
                        .filter(option => option.key !== patient.status)
                        .map(option => (
                          <DropdownItem
                            key={`move-${option.key}`}
                            onPress={() => handleStatusChange(patient, option.key as PatientStatus)}
                          >
                            Move to {option.label}
                          </DropdownItem>
                        ))}
                      {patient.status !== 'archived' && (
                        <DropdownItem
                          key="archive"
                          className="text-danger"
                          color="danger"
                          startContent={<Archive className="h-4 w-4" />}
                          onPress={() => handleArchive(patient)}
                        >
                          Archive
                        </DropdownItem>
                      )}
                    </DropdownMenu>
                  </Dropdown>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader>Edit Patient</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <Input
                label="Mobile Number"
                type="tel"
                value={editForm.mobile}
                onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
              />
              <Input
                label="City"
                value={editForm.city}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
              />
              <Select
                label="Status"
                selectedKeys={[editForm.status]}
                onSelectionChange={(keys) => {
                  const status = Array.from(keys)[0] as PatientStatus;
                  setEditForm({ ...editForm, status });
                }}
              >
                {statusOptions.map((option) => (
                  <SelectItem key={option.key} value={option.key}>
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave}>
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}