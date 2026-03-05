import React from "react";
import BlackHole from "./BlackHole";
import Container from "./Container";
import Header from "./Header";
import Infomation from "./Infomation";
import Level from "./Level";

export type StatsProps = {
  data: {
    login: string;
    campus: string;
    cursus: string;
    grade: string;
    begin_at: string;
    blackholed_at?: string | null;
    end_at?: string | null;
    name?: string | null;
    email?: string | null;
    color: string;
    level: number;
    profileImage?: string | null;
  };
};

const Stats = ({ data }: StatsProps) => {
  const infoRows = [
    data.name && ["Name", data.name],
    data.email && ["Email", data.email],
    ["Grade", data.grade],
  ].filter(Boolean) as [string, string][];

  // ~75% of credit card ratio
  const height = 227;

  const contentTop = 75;
  const contentBottom = height - 48; // 179
  const infoCenterY = (contentTop + contentBottom) / 2; // 127
  const infoStartY = infoCenterY - ((infoRows.length - 1) * 24) / 2;

  const avatarR = 35;
  const avatarCx = 55;
  const avatarCy = infoCenterY - 3;

  return (
    <Container height={height} color={data.color}>
      <Header
        color={data.color}
        campus={data.campus}
        cursus={data.cursus}
        login={data.login}
      />
      {data.profileImage && (
        <g className="fadeIn" style={{ animationDelay: "0.5s" }}>
          <defs>
            <clipPath id="avatar_clip">
              <circle cx={avatarCx} cy={avatarCy} r={avatarR} />
            </clipPath>
          </defs>
          <circle
            cx={avatarCx}
            cy={avatarCy}
            r={avatarR + 1.5}
            stroke={data.color}
            strokeWidth="1.5"
            fill="none"
          />
          <image
            x={avatarCx - avatarR}
            y={avatarCy - avatarR}
            width={avatarR * 2}
            height={avatarR * 2}
            href={data.profileImage}
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#avatar_clip)"
          />
        </g>
      )}
      <Infomation
        color={data.color}
        hasProfileImage={!!data.profileImage}
        startY={infoStartY}
        distance={24}
        data={infoRows}
      />
      <BlackHole
        data={{
          begin_at: data.begin_at,
          blackholed_at: data.blackholed_at,
          end_at: data.end_at,
          grade: data.grade,
        }}
        color={data.color}
      />
      <Level height={height} color={data.color} level={data.level} />
    </Container>
  );
};

export default Stats;
