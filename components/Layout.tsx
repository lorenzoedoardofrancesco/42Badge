import React, { PropsWithChildren } from "react";
import Nav from "./Nav";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <Nav />
      <div className="min-h-screen min-h-screen-ios pt-14 pb-24">
        <div className="flex flex-col gap-2 max-w-screen-sm mx-auto p-2 sm:p-0">
          {children}
        </div>
        <footer></footer>
      </div>
    </>
  );
};

export default Layout;
