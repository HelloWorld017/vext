import { createContext, ReactNode, useState } from 'react';

type VextContextType = {
  head: HeadType;
  suspenseMap: Record<string, SuspenseType>;
};

const VextContext = createContext<VextContextType | null>(null);
const VextApp = ({ children }: { children: ReactNode }) => {
  const [suspenseMap] = useState(() => new Map());
  return <VextContext.Provider>{children}</VextContext.Provider>;
};
