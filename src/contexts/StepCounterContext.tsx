import React, { createContext, useContext, useState, useEffect } from "react";

interface StepCountContextType {
  dailyStepCount: number;
  setDailyStepCount: (count: number) => void;
}

const StepCountContext = createContext<StepCountContextType | undefined>(undefined);

export const StepCountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dailyStepCount, setDailyStepCount] = useState(0);

  return (
    <StepCountContext.Provider value={{ dailyStepCount, setDailyStepCount }}>
      {children}
    </StepCountContext.Provider>
  );
};

export const useStepCount = () => {
  const context = useContext(StepCountContext);
  if (!context) {
    throw new Error("useStepCount must be used within a StepCountProvider");
  }
  return context;
};
