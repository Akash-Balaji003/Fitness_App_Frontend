import React, { createContext, useContext, useState } from "react";

type StepCounterContextType = {
  stepCount: number;
  setStepCount: React.Dispatch<React.SetStateAction<number>>;
};

// Create the context
const StepCounterContext = createContext<StepCounterContextType | null>(null);

// Provider component
export const StepCounterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stepCount, setStepCount] = useState(0);

  return (
    <StepCounterContext.Provider value={{ stepCount, setStepCount }}>
      {children}
    </StepCounterContext.Provider>
  );
};

// Custom hook to use the StepCounterContext
export const useStepCounter = () => {
  const context = useContext(StepCounterContext);
  if (!context) {
    throw new Error("useStepCounter must be used within a StepCounterProvider");
  }
  return context;
};
