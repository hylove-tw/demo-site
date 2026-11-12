import React from 'react';

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Routes = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const Route = ({ element, path }: { element: React.ReactElement; path: string }) => path === '/' ? element : null;
export const Link = ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>;
export const useLocation = () => ({ pathname: '/' });

export default { BrowserRouter, Routes, Route };
