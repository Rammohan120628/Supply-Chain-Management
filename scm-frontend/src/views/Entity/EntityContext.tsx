// EntityContext.tsx
import { createContext, useState, ReactNode } from 'react';

interface EntityData {
  pk: number;
  cwhPk: number;
  cwh: string | null;
  tenderPeriod: string | null;
  purchasePeriod: string | null;
  stockPeriod: string | null;
  tenderPeriodStr: string;
  purchasePeriodStr: string;
  stockPeriodStr: string;
  stockClosing: number;
  entity: string;
  currencyId: string;
  intrestRate: number;
  decimalToValue: number;
  decimalToQty: number;
  process: number;
  cashOpBalance: number;
  manager: string;
  entityName: string;
  country: string;
  dateFormat: string;
  dateTimeFormat: string;
  language: string;
  timeZone: string;
  numberFormat: string;
}

const defaultEntity: EntityData = {
  pk: 1,
  cwhPk: 0,
  cwh: null,
  tenderPeriod: null,
  purchasePeriod: null,
  stockPeriod: null,
  tenderPeriodStr: '',
  purchasePeriodStr: '',
  stockPeriodStr: '',
  stockClosing: 0,
  entity: '',
  currencyId: '',
  intrestRate: 0,
  decimalToValue: 0,
  decimalToQty: 0,
  process: 2,
  cashOpBalance: 0,
  manager: '',
  entityName: '',
  country: '',
  dateFormat: '',
  dateTimeFormat: '',
  language: '',
  timeZone: '',
  numberFormat: '',
};

interface EntityContextType {
  entity: EntityData;
  setEntity: (data: EntityData) => void;
}

export const EntityContext = createContext<EntityContextType>({
  entity: defaultEntity,
  setEntity: () => {},
});

export const EntityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [entity, setEntity] = useState<EntityData>(defaultEntity);

  return (
    <EntityContext.Provider value={{ entity, setEntity }}>
      {children}
    </EntityContext.Provider>
  );
};