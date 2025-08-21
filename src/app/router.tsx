'use client';

import { BrowserRouter } from 'react-router-dom';

export default function Router({ children }: { children: React.ReactNode }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}
