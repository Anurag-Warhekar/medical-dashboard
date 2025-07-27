import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Textarea,
} from '@nextui-org/react';
import { 
  ArrowLeft, 
  Upload, 
  Plus, 
  Trash2, 
  FileText,
  Camera,
  Save,
  MapPin,
  Minus
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Medicine, ShippingAddress, PendingAmount } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const statusConfig = {
  'onboarded': { color: 'success' as const, label: 'Onboarded' },
  'on-hold': { color: 'warning' as const, label: 'On Hold' },
  'future': { color: 'primary' as const, label: 'Future' },
  'delivered': { color: 'success' as const, label: 'Delivered' },
  'stock-out': { color: 'danger' as const, label: 'Stock Out' },
  'archived': { color: 'default' as const, label: 'Archived' },
};

interface MedicineRow {
  id: string;
  name: string;
  quantity: number;
  deliveredQuantity: number;
  dailyUsage: number;
  photo?: string;
}

export function PatientOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isPendingDeleteOpen, onOpen: onPendingDeleteOpen, onClose: onPendingDeleteClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [selectedMedicineId, setSelectedMedicineId] = useState<string | null>(null);
  const [medicineToDelete, setMedicineToDelete] = useState<string | null>(null);
  const [pendingToDelete, setPendingToDelete] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Medicine modal state
  const [medicineRows, setMedicineRows] = useState<MedicineRow[]>([
    {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      deliveredQuantity: 0,
      dailyUsage: 1,
    }
  ]);

  // Pending amount form state
  const [pendingForm, setPendingForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    note: '',
  });

  const patient = state.patients.find(p => p.id === id);
  const patientDetails = state.patientDetails[id || ''];

  if (!patient || !id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Not Found</h2>
          <Button color="primary" onPress={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handlePrescriptionUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        dispatch({
          type: 'UPDATE_PATIENT_DETAILS',
          payload: {
            id,
            details: { prescriptionFile: result },
          },
        });
        toast.success('Prescription uploaded 📎');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMedicinePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedMedicineId) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        dispatch({
          type: 'UPDATE_MEDICINE',
          payload: {
            patientId: id,
            medicineId: selectedMedicineId,
            updates: { photo: result },
          },
        });
        toast.success('Medicine updated successfully ✅');
        setSelectedMedicineId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedicineRow = () => {
    const newRow: MedicineRow = {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      deliveredQuantity: 0,
      dailyUsage: 1,
    };
    setMedicineRows([...medicineRows, newRow]);
  };

  const removeMedicineRow = (rowId: string) => {
    if (medicineRows.length > 1) {
      setMedicineRows(medicineRows.filter(row => row.id !== rowId));
      toast.success('Medicine row removed ❌');
    }
  };

  const updateMedicineRow = (rowId: string, updates: Partial<MedicineRow>) => {
    setMedicineRows(medicineRows.map(row => 
      row.id === rowId ? { ...row, ...updates } : row
    ));
  };

  const handleMedicineRowPhotoUpload = (rowId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateMedicineRow(rowId, { photo: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const submitMedicines = () => {
    const validRows = medicineRows.filter(row => row.name.trim());
    
    if (validRows.length === 0) {
      toast.error('Error: Please fill all required fields ⚠️');
      return;
    }

    validRows.forEach(row => {
      const medicine: Medicine = {
        id: Date.now().toString() + Math.random(),
        name: row.name,
        quantity: row.quantity,
        deliveredQuantity: row.deliveredQuantity,
        dailyUsage: row.dailyUsage,
        photo: row.photo,
      };

      dispatch({
        type: 'ADD_MEDICINE',
        payload: { patientId: id, medicine },
      });
    });

    // Reset form
    setMedicineRows([{
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      deliveredQuantity: 0,
      dailyUsage: 1,
    }]);
    
    onClose();
    toast.success('Medicines added ✅');
  };

  const updateMedicine = (medicineId: string, updates: Partial<Medicine>) => {
    dispatch({
      type: 'UPDATE_MEDICINE',
      payload: {
        patientId: id,
        medicineId,
        updates,
      },
    });
    toast.success('Medicine updated successfully ✅');
  };

  const confirmDeleteMedicine = (medicineId: string) => {
    setMedicineToDelete(medicineId);
    onDeleteOpen();
  };

  const deleteMedicine = () => {
    if (medicineToDelete) {
      dispatch({
        type: 'DELETE_MEDICINE',
        payload: { patientId: id, medicineId: medicineToDelete },
      });
      toast.success('Medicine deleted ❌');
      setMedicineToDelete(null);
      onDeleteClose();
    }
  };

  const addPendingAmount = () => {
    if (!pendingForm.amount || parseFloat(pendingForm.amount) <= 0 || !pendingForm.date) {
      toast.error('Error: Please enter a valid amount and date ⚠️');
      return;
    }

    const newPendingAmount: PendingAmount = {
      id: Date.now().toString(),
      amount: parseFloat(pendingForm.amount),
      date: pendingForm.date,
      note: pendingForm.note.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const currentPendingAmounts = patientDetails?.pendingAmounts || [];
    
    dispatch({
      type: 'UPDATE_PATIENT_DETAILS',
      payload: {
        id,
        details: { 
          pendingAmounts: [...currentPendingAmounts, newPendingAmount],
        },
      },
    });

    setPendingForm({ 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      note: '' 
    });
    toast.success('Pending amount added ✅');
  };

  const confirmDeletePendingAmount = (pendingId: string) => {
    setPendingToDelete(pendingId);
    onPendingDeleteOpen();
  };

  const deletePendingAmount = () => {
    if (pendingToDelete) {
      const currentPendingAmounts = patientDetails?.pendingAmounts || [];
      const updatedPendingAmounts = currentPendingAmounts.filter(p => p.id !== pendingToDelete);
      
      dispatch({
        type: 'UPDATE_PATIENT_DETAILS',
        payload: {
          id,
          details: { pendingAmounts: updatedPendingAmounts },
        },
      });

      toast.success('Pending entry deleted ❌');
      setPendingToDelete(null);
      onPendingDeleteClose();
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using OpenCage Geocoding API (free tier available)
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              
              const shippingAddress: ShippingAddress = {
                address,
                lat: latitude,
                lng: longitude,
              };

              dispatch({
                type: 'UPDATE_PATIENT_DETAILS',
                payload: {
                  id,
                  details: { shippingAddress },
                },
              });

              toast.success('Location updated successfully!');
            } else {
              // Fallback to coordinates if geocoding fails
              const shippingAddress: ShippingAddress = {
                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                lat: latitude,
                lng: longitude,
              };

              dispatch({
                type: 'UPDATE_PATIENT_DETAILS',
                payload: {
                  id,
                  details: { shippingAddress },
                },
              });

              toast.success('Location coordinates saved!');
            }
          }
        } catch (error) {
          // Fallback to coordinates if API fails
          const shippingAddress: ShippingAddress = {
            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
            lat: latitude,
            lng: longitude,
          };

          dispatch({
            type: 'UPDATE_PATIENT_DETAILS',
            payload: {
              id,
              details: { shippingAddress },
            },
          });

          toast.success('Location coordinates saved!');
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        toast.error('Unable to get location. Please check permissions.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const calculateDaysLeft = (medicine: Medicine) => {
    const remaining = medicine.quantity - medicine.deliveredQuantity;
    return Math.max(0, Math.floor(remaining / medicine.dailyUsage));
  };

  const medicines = patientDetails?.medicines || [];
  const pendingAmounts = patientDetails?.pendingAmounts || [];
  const totalPendingAmount = pendingAmounts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              isIconOnly
              variant="light"
              onPress={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-gray-600">
                <span>{patient.mobile}</span>
                <span>•</span>
                <span>{patient.city}</span>
              </div>
            </div>
            <Chip
              color={statusConfig[patient.status].color}
              variant="flat"
              size="lg"
            >
              {statusConfig[patient.status].label}
            </Chip>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Prescription Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Prescription
                </h3>
              </CardHeader>
              <CardBody>
                {patientDetails?.prescriptionFile ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium">Prescription uploaded</p>
                        <p className="text-sm text-gray-600">Click to view</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => fileInputRef.current?.click()}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    color="primary"
                    variant="bordered"
                    startContent={<Upload className="h-4 w-4" />}
                    onPress={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    Upload Prescription
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePrescriptionUpload}
                  className="hidden"
                />
              </CardBody>
            </Card>
          </motion.div>

          {/* Shipping Address */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {patientDetails?.shippingAddress ? (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{patientDetails.shippingAddress.address}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Coordinates: {patientDetails.shippingAddress.lat.toFixed(6)}, {patientDetails.shippingAddress.lng.toFixed(6)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-600">No shipping address set</p>
                  )}
                  
                  <Button
                    color="primary"
                    variant="bordered"
                    startContent={<MapPin className="h-4 w-4" />}
                    onPress={getCurrentLocation}
                    isLoading={isGettingLocation}
                    loadingText="Getting Location..."
                    className="w-full"
                  >
                    Use Current Location
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Medicines List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex justify-between">
                <h3 className="text-lg font-semibold">Medicines</h3>
                <Button
                  color="primary"
                  size="sm"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={onOpen}
                >
                  Add Medicines
                </Button>
              </CardHeader>
              <CardBody>
                {medicines.length > 0 ? (
                  <Table removeWrapper aria-label="Medicines table">
                    <TableHeader>
                      <TableColumn>MEDICINE</TableColumn>
                      <TableColumn>QUANTITY</TableColumn>
                      <TableColumn>DELIVERED</TableColumn>
                      <TableColumn>DAILY USAGE</TableColumn>
                      <TableColumn>DAYS LEFT</TableColumn>
                      <TableColumn>ACTIONS</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {medicines.map((medicine) => (
                        <TableRow key={medicine.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {medicine.photo && (
                                <img
                                  src={medicine.photo}
                                  alt={medicine.name}
                                  className="w-10 h-10 object-cover rounded-lg"
                                />
                              )}
                              <Input
                                value={medicine.name}
                                onChange={(e) => updateMedicine(medicine.id, { name: e.target.value })}
                                variant="flat"
                                size="sm"
                                className="min-w-[150px]"
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={medicine.quantity.toString()}
                              onChange={(e) => updateMedicine(medicine.id, { quantity: parseInt(e.target.value) || 0 })}
                              variant="flat"
                              size="sm"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={medicine.deliveredQuantity.toString()}
                              onChange={(e) => updateMedicine(medicine.id, { deliveredQuantity: parseInt(e.target.value) || 0 })}
                              variant="flat"
                              size="sm"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={medicine.dailyUsage.toString()}
                              onChange={(e) => updateMedicine(medicine.id, { dailyUsage: parseInt(e.target.value) || 1 })}
                              variant="flat"
                              size="sm"
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              color={calculateDaysLeft(medicine) > 7 ? 'success' : calculateDaysLeft(medicine) > 3 ? 'warning' : 'danger'}
                              size="sm"
                              variant="flat"
                            >
                              {calculateDaysLeft(medicine)} days
                            </Chip>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                onPress={() => {
                                  setSelectedMedicineId(medicine.id);
                                  photoInputRef.current?.click();
                                }}
                              >
                                <Camera className="h-4 w-4" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => confirmDeleteMedicine(medicine.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">💊</div>
                    <p>No medicines added yet</p>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Pending Payments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-lg font-semibold">Pending Payments</h3>
                  {totalPendingAmount > 0 && (
                    <Chip color="warning" variant="flat" size="lg">
                      Total: ₹{totalPendingAmount.toFixed(2)}
                    </Chip>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {/* Pending amounts list */}
                  {pendingAmounts.length > 0 && (
                    <Table removeWrapper aria-label="Pending amounts table">
                      <TableHeader>
                        <TableColumn>AMOUNT</TableColumn>
                        <TableColumn>DATE</TableColumn>
                        <TableColumn>NOTE</TableColumn>
                        <TableColumn>ACTIONS</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {pendingAmounts.map((pending) => (
                            <TableRow key={pending.id}>
                              <TableCell>
                                <span className="font-semibold text-lg">₹{pending.amount.toFixed(2)}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-700">
                                  {new Date(pending.date).toLocaleDateString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-gray-600">
                                  {pending.note || '-'}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  isIconOnly
                                  size="sm"
                                  variant="light"
                                  color="danger"
                                  onPress={() => confirmDeletePendingAmount(pending.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  )}

                  {/* Add new pending amount form */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Add Pending Amount</h4>
                    <div className="space-y-3">
                      <Input
                        label="Amount"
                        placeholder="0"
                        value={pendingForm.amount}
                        onChange={(e) => setPendingForm({ ...pendingForm, amount: e.target.value })}
                        startContent={<span className="text-gray-500">₹</span>}
                        type="number"
                        step="0.01"
                      />
                      <Input
                        label="Date"
                        type="date"
                        value={pendingForm.date}
                        onChange={(e) => setPendingForm({ ...pendingForm, date: e.target.value })}
                      />
                      <Textarea
                        label="Note (Optional)"
                        placeholder="Add a note about this pending amount..."
                        value={pendingForm.note}
                        onChange={(e) => setPendingForm({ ...pendingForm, note: e.target.value })}
                        maxRows={2}
                      />
                      <Button
                        color="primary"
                        onPress={addPendingAmount}
                        className="w-full"
                      >
                        Add Pending Amount
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Add Medicines Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="5xl" 
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90vh]",
          body: "py-6",
        }}
      >
        <ModalContent>
          <ModalHeader>Add Medicines</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <AnimatePresence>
                {medicineRows.map((row, index) => (
                  <motion.div
                    key={row.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 border border-gray-200 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Medicine {index + 1}</h4>
                      {medicineRows.length > 1 && (
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeMedicineRow(row.id)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Medicine Name"
                        placeholder="Enter medicine name"
                        value={row.name}
                        onChange={(e) => updateMedicineRow(row.id, { name: e.target.value })}
                        isRequired
                        variant="bordered"
                      />
                      <Input
                        label="Daily Usage"
                        type="number"
                        value={row.dailyUsage.toString()}
                        onChange={(e) => updateMedicineRow(row.id, { dailyUsage: parseInt(e.target.value) || 1 })}
                        description="Units per day"
                        variant="bordered"
                      />
                      <Input
                        label="Total Quantity"
                        type="number"
                        value={row.quantity.toString()}
                        onChange={(e) => updateMedicineRow(row.id, { quantity: parseInt(e.target.value) || 0 })}
                        variant="bordered"
                      />
                      <Input
                        label="Delivered Quantity"
                        type="number"
                        value={row.deliveredQuantity.toString()}
                        onChange={(e) => updateMedicineRow(row.id, { deliveredQuantity: parseInt(e.target.value) || 0 })}
                        variant="bordered"
                      />
                    </div>

                    {/* Photo upload */}
                    <div className="flex items-center gap-4">
                      {row.photo && (
                        <div className="relative">
                          <img
                            src={row.photo}
                            alt="Medicine"
                            className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                          />
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            className="absolute -top-2 -right-2 min-w-6 h-6"
                            onPress={() => updateMedicineRow(row.id, { photo: undefined })}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="bordered"
                        size="sm"
                        startContent={<Camera className="h-4 w-4" />}
                        onPress={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => handleMedicineRowPhotoUpload(row.id, e as any);
                          input.click();
                        }}
                      >
                        {row.photo ? 'Change Photo' : 'Add Photo'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  variant="bordered"
                  startContent={<Plus className="h-4 w-4" />}
                  onPress={addMedicineRow}
                  className="w-full"
                >
                  Add Another Medicine
                </Button>
              </motion.div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={submitMedicines}>
              {medicineRows.filter(row => row.name.trim()).length > 1 ? 'Add All Medicines' : 'Add Medicine'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Medicine Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this medicine?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={deleteMedicine}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Pending Amount Confirmation Modal */}
      <Modal isOpen={isPendingDeleteOpen} onClose={onPendingDeleteClose} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>
            <p>Are you sure you want to delete this pending amount entry?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="default" variant="light" onPress={onPendingDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={deletePendingAmount}>
              Yes, Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Hidden file input for medicine photos */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handleMedicinePhotoUpload}
        className="hidden"
      />
    </div>
  );
}