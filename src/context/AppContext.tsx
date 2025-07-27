import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Patient, User, PatientStatus, PatientDetails, Medicine } from '../types';

interface AppState {
  user: User | null;
  patients: Patient[];
  patientDetails: Record<string, PatientDetails>;
  isAuthenticated: boolean;
}

type AppAction =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: { id: string; updates: Partial<Patient> } }
  | { type: 'DELETE_PATIENT'; payload: string }
  | { type: 'UPDATE_PATIENT_DETAILS'; payload: { id: string; details: Partial<PatientDetails> } }
  | { type: 'ADD_MEDICINE'; payload: { patientId: string; medicine: Medicine } }
  | { type: 'UPDATE_MEDICINE'; payload: { patientId: string; medicineId: string; updates: Partial<Medicine> } }
  | { type: 'DELETE_MEDICINE'; payload: { patientId: string; medicineId: string } }
  | { type: 'LOAD_DATA'; payload: { patients: Patient[]; patientDetails: Record<string, PatientDetails>; user: User | null } };

const initialState: AppState = {
  user: null,
  patients: [],
  patientDetails: {},
  isAuthenticated: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      };
    case 'ADD_PATIENT':
      return {
        ...state,
        patients: [...state.patients, action.payload],
        patientDetails: {
          ...state.patientDetails,
          [action.payload.id]: {
            ...action.payload,
            medicines: [],
            pendingAmount: 0,
          },
        },
      };
    case 'UPDATE_PATIENT':
      return {
        ...state,
        patients: state.patients.map(patient =>
          patient.id === action.payload.id
            ? { ...patient, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : patient
        ),
      };
    case 'DELETE_PATIENT':
      return {
        ...state,
        patients: state.patients.filter(patient => patient.id !== action.payload),
        patientDetails: Object.fromEntries(
          Object.entries(state.patientDetails).filter(([id]) => id !== action.payload)
        ),
      };
    case 'UPDATE_PATIENT_DETAILS':
      return {
        ...state,
        patientDetails: {
          ...state.patientDetails,
          [action.payload.id]: {
            ...state.patientDetails[action.payload.id],
            medicines: [],
            pendingAmount: 0,
            pendingAmounts: [],
            ...action.payload.details,
          },
        },
      };
    case 'ADD_MEDICINE':
      return {
        ...state,
        patientDetails: {
          ...state.patientDetails,
          [action.payload.patientId]: {
            ...state.patientDetails[action.payload.patientId],
            medicines: [
              ...(state.patientDetails[action.payload.patientId]?.medicines || []),
              action.payload.medicine,
            ],
          },
        },
      };
    case 'UPDATE_MEDICINE':
      return {
        ...state,
        patientDetails: {
          ...state.patientDetails,
          [action.payload.patientId]: {
            ...state.patientDetails[action.payload.patientId],
            medicines: state.patientDetails[action.payload.patientId]?.medicines.map(medicine =>
              medicine.id === action.payload.medicineId
                ? { ...medicine, ...action.payload.updates }
                : medicine
            ) || [],
          },
        },
      };
    case 'DELETE_MEDICINE':
      return {
        ...state,
        patientDetails: {
          ...state.patientDetails,
          [action.payload.patientId]: {
            ...state.patientDetails[action.payload.patientId],
            medicines: state.patientDetails[action.payload.patientId]?.medicines.filter(
              medicine => medicine.id !== action.payload.medicineId
            ) || [],
          },
        },
      };
    case 'LOAD_DATA':
      return {
        ...state,
        patients: action.payload.patients,
        patientDetails: action.payload.patientDetails,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data from localStorage on mount
  React.useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    const savedPatientDetails = localStorage.getItem('patientDetails');
    const savedUser = localStorage.getItem('user');
    
    const patients = savedPatients ? JSON.parse(savedPatients) : [];
    const patientDetails = savedPatientDetails ? JSON.parse(savedPatientDetails) : {};
    const user = savedUser ? JSON.parse(savedUser) : null;
    
    dispatch({ type: 'LOAD_DATA', payload: { patients, patientDetails, user } });
  }, []);

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(state.patients));
    localStorage.setItem('patientDetails', JSON.stringify(state.patientDetails));
    if (state.user) {
      localStorage.setItem('user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [state.patients, state.patientDetails, state.user]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}