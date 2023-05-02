import { createContext } from 'react';

type VextServerContextType = {
  head: HeadType;
  suspenseMap: Record<string, SuspenseType>;
};

const VextContext = createContext<VextContextType | null>(null);
