import { ReactNode } from "react";

interface IChidrenProps {
  children: ReactNode;
}
export default function Layout({ children }: IChidrenProps) {
  return (
    <>
      <div>{children}</div>
    </>
  );
}
