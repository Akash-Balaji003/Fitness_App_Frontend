import React, { createContext, useState, ReactNode } from 'react';

// Define the type of the context value
interface StepContextType {
  stepCount: number;
  setStepCount: React.Dispatch<React.SetStateAction<number>>;
}

// Create a context with a default value
const StepContext = createContext<StepContextType | null>(null);

// Define the type of the children prop
interface StepProviderProps {
  children: ReactNode; // ReactNode type is a general type for children in React components
}

export const StepProvider: React.FC<StepProviderProps> = ({ children }) => {
  const [stepCount, setStepCount] = useState(0);

  return (
    <StepContext.Provider value={{ stepCount, setStepCount }}>
      {children}
    </StepContext.Provider>
  );
};

export default StepContext;
