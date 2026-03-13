import { useState, useEffect } from "react";
import Stats, { StatsProps } from "../badge/Stats";

export function StatsWrapper({ data }: StatsProps) {
  const [isShow, setIsShow] = useState(false);

  useEffect(() => {
    setIsShow(false);
    const timer = setTimeout(() => {
      setIsShow(true);
    });
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...Object.values(data)]);

  return (
    <div style={{ width: "500px" }}>
      {isShow && <Stats data={data} />}
    </div>
  );
}
