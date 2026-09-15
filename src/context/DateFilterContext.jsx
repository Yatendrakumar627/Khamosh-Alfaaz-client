import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const DateFilterContext = createContext(null);

export const DateFilterProvider = ({ children }) => {
  const [date, setDateValue] = useState('');

  const setDate = useCallback((next) => {
    setDateValue(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      return value === prev ? prev : value;
    });
  }, []);

  const value = useMemo(() => ({ date, setDate }), [date, setDate]);

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};