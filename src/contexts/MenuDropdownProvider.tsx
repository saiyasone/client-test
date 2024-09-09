// MenuStateProvider.js
import { createContext, ReactNode, useContext, useState } from "react";
interface MenuDropdownProvider {
  children: ReactNode;
}
const MenuStateContext = createContext<any>(null);

export const MenuDropdownProvider = ({ children }: MenuDropdownProvider) => {
  const [isAutoClose, setIsAutoClose] = useState(false);
  return (
    <MenuStateContext.Provider value={{ isAutoClose, setIsAutoClose }}>
      {children}
    </MenuStateContext.Provider>
  );
};

export const useMenuDropdownState = () => {
  const context = useContext(MenuStateContext);
  if (!context) {
    throw new Error("useMenuState must be used within a MenuStateProvider");
  }
  return context;
};
