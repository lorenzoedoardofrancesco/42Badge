import { Si42 } from "@icons-pack/react-simple-icons";
import LoginButton from "./LoginButton";

export type LoginButton42SchoolProps = { onClick: () => void; disable?: boolean };

const LoginButton42School = ({
  onClick,
  disable,
}: LoginButton42SchoolProps) => (
  <LoginButton
    provider={{
      name: "42",
      background: "#00babc",
      color: "#ffffff",
      logo: Si42,
    }}
    disable={disable}
    onClick={onClick}
  />
);

export default LoginButton42School;
