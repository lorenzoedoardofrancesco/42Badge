import Link from "next/link";
import { signOut } from "next-auth/react";
import React, { useContext } from "react";
import _42BadgeLogo from "./42BadgeLogo";
import { AuthContext } from "../lib/auth/AuthProvider";

const Nav: React.FC = () => {
  const { data } = useContext(AuthContext);

  return (
    <header className="fixed z-10 top-0 border-b bg-clip-padding backdrop-filter backdrop-blur-xl bg-opacity-70 w-full shadow-sm">
      <div className="flex justify-between items-center mx-auto max-w-screen-sm w-full h-12 p-2">
        <Link href={"/"}>
          <_42BadgeLogo className="w-10 h-10 fill-black" />
        </Link>
        <div className="flex gap-2 font-bold text-neutral-700">
          {data && (
            <Link href={"/me"}>
              {data.name}
            </Link>
          )}
          {data ? (
            <button className="font-bold" onClick={() => signOut()}>
              SignOut
            </button>
          ) : (
            <Link href={"/auth/signin"}>
              SignIn
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Nav;
