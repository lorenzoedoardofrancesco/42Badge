import { useState, useCallback } from "react";
import axios from "axios";
import { ToggleSwitch } from "../common/ToggleSwitch";

export type StatsOptionsProps = {
  isDisplayName: boolean;
  isDisplayEmail: boolean;
  isDisplayPhoto: boolean;
  isDisplayProjectCount: boolean;
  setIsDisplayName: (value: boolean) => void;
  setIsDisplayEmail: (value: boolean) => void;
  setIsDisplayPhoto: (value: boolean) => void;
  setIsDisplayProjectCount: (value: boolean) => void;
  patchMe: (updates: Record<string, any>) => Promise<void>;
  onError: (msg: string) => void;
};

export function StatsOptions({
  isDisplayEmail,
  isDisplayName,
  isDisplayPhoto,
  isDisplayProjectCount,
  setIsDisplayEmail,
  setIsDisplayName,
  setIsDisplayPhoto,
  setIsDisplayProjectCount,
  patchMe,
  onError,
}: StatsOptionsProps) {
  const [isFetching, setIsFetching] = useState(false);
  const updateOption = useCallback(async () => {
    setIsFetching(true);
    try {
      await patchMe({
        isDisplayPhoto: isDisplayPhoto ? "true" : "false",
        isDisplayProjectCount: isDisplayProjectCount ? "true" : "false",
      });
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response) {
        onError(error.response.data.message);
      } else if (error instanceof Error) {
        onError(error.message);
      }
    }
    setIsFetching(false);
  }, [isDisplayPhoto, isDisplayProjectCount, patchMe, onError]);

  return (
    <div>
      <div className="flex flex-col gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
        <p className="border border-amber-800/50 bg-amber-950/30 text-amber-200/80 rounded-lg p-3 text-sm">
          Changes may take up to 12 hours due to browser and CDN cache.
        </p>
        {([
          { label: "Display Name", value: isDisplayName, set: setIsDisplayName },
          { label: "Display Email", value: isDisplayEmail, set: setIsDisplayEmail },
          { label: "Display Photo", value: isDisplayPhoto, set: setIsDisplayPhoto },
          { label: "Projects", value: isDisplayProjectCount, set: setIsDisplayProjectCount },
        ] as const).map(({ label, value, set }) => (
          <label key={label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-neutral-400">{label}</span>
            <ToggleSwitch checked={value} onChange={set} />
          </label>
        ))}
        <button
          className="text-sm px-4 py-1.5 border border-neutral-700 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isFetching}
          onClick={updateOption}
        >
          {isFetching ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
