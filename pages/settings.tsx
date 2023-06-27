import React, { useEffect } from "react";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/20/solid";

export enum ScheduleCountdownDisplayFormat {
  MinuteRounded = "MINUTE_ROUNDED",
  MinuteFloor = "MINUTE_FLOOR",
  MinuteCeiling = "MINUTE_CEILING",
  Exact = "EXACT",
}

const scheduleCountdownDisplayOptions = [
  {
    value: ScheduleCountdownDisplayFormat.MinuteRounded,
    name: "Minute Rounded",
  },
  {
    value: ScheduleCountdownDisplayFormat.MinuteFloor,
    name: "Minute Floor",
  },
  {
    value: ScheduleCountdownDisplayFormat.MinuteCeiling,
    name: "Minute Ceiling",
  },
  { value: ScheduleCountdownDisplayFormat.Exact, name: "Exact" },
];

export interface Settings {
  chat: {
    useLocation: boolean;
  };
  schedule: {
    countdownDisplayFormat: ScheduleCountdownDisplayFormat;
  };
  setChatUseLocation: (useLocation: boolean) => void;
  setScheduleCountdownDisplayFormat: (
    countdownDisplayFormat: ScheduleCountdownDisplayFormat
  ) => void;
}

const useSettingsStore = create<Settings>()(
  persist(
    (set) => ({
      setChatUseLocation: (useLocation) =>
        set((state) => ({ chat: { ...state.chat, useLocation } })),
      setScheduleCountdownDisplayFormat: (countdownDisplayFormat) =>
        set((state) => ({
          schedule: {
            ...state.schedule,
            countdownDisplayFormat,
          },
        })),
      chat: {
        useLocation: false as boolean,
      },
      schedule: {
        countdownDisplayFormat:
          ScheduleCountdownDisplayFormat.MinuteRounded as ScheduleCountdownDisplayFormat,
      },
    }),
    {
      name: "settings",
    }
  )
);

export function useSettings() {
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return { ...settings, settingsReady: mounted };
}

export default function Settings() {
  const {
    chat: { useLocation },
    schedule: { countdownDisplayFormat },
    setChatUseLocation,
    setScheduleCountdownDisplayFormat,
    settingsReady,
  } = useSettings();

  if (!settingsReady) {
    return null;
  }

  return (
    <div className="text-white px-2">
      <section>
        <h1 className="text-xl font-bold">Schedule</h1>
        <div className="py-2">
          <LabelledListbox
            label="Countdown format"
            options={scheduleCountdownDisplayOptions}
            selected={countdownDisplayFormat}
            setSelected={
              setScheduleCountdownDisplayFormat as (option: string) => void
            }
          />
        </div>
      </section>
      <section>
        <h1 className="text-xl font-bold">Chat</h1>
        <div className="py-2">
          <LabelledSwitch
            label="Use location by default"
            onChange={setChatUseLocation}
            enabled={useLocation}
          />
        </div>
      </section>
    </div>
  );
}

function LabelledSwitch({
  label,
  onChange,
  enabled,
}: {
  label: React.ReactNode;
  onChange: (enabled: boolean) => void;
  enabled: boolean;
}) {
  return (
    <Switch.Group>
      <div className="flex items-center justify-between">
        <Switch.Label className="mr-4">{label}</Switch.Label>
        <Switch
          checked={enabled}
          onChange={onChange}
          className={`${
            enabled ? "bg-mtaYellow" : "bg-gray-400"
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
          <span
            className={`${
              enabled ? "translate-x-6" : "translate-x-1"
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}

function LabelledListbox({
  label,
  options,
  selected,
  setSelected,
}: {
  label: React.ReactNode;
  options: { name: string; value: string }[];
  selected: string;
  setSelected: (value: string) => void;
}) {
  return (
    <div className="flex w-full">
      <Listbox value={selected} onChange={setSelected}>
        <div className="flex w-full justify-between items-center">
          <Listbox.Label>{label}</Listbox.Label>
          <div className="relative w-[45%]">
            <Listbox.Button className="relative w-full cursor-default bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
              <span className="block truncate text-black">
                {options.find((o) => o.value === selected)!.name}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-[100] mt-1 max-h-60 w-full overflow-auto bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((option, optionIdx) => (
                  <Listbox.Option
                    key={optionIdx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 px-4 ${
                        active ? "text-black bg-mtaYellow" : "text-black"
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {option.name}
                        </span>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </div>
      </Listbox>
    </div>
  );
}
