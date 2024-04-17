import React, { useEffect } from "react";
import { useState } from "react";
import { Switch } from "@headlessui/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Fragment } from "react";
import { Listbox, Tab, Transition } from "@headlessui/react";
import {
  ChevronUpDownIcon,
  ArrowTopRightOnSquareIcon,
  BarsArrowUpIcon,
} from "@heroicons/react/20/solid";
import { classNames } from "@/utils/cssUtils";
import { TripArrivalTime } from "@/components/TripArrivalTime";
import { Duration } from "luxon";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { getChatEnabled } from "@/utils/features";
import Link from "next/link";
import { getBuildInfo } from "@/utils/build";
import { Drawer } from "vaul";

// Markdown
import fs from "fs";
import matter from "gray-matter";
import md from "markdown-it";

// Email info
const EMAIL_SUBJECT = encodeURI("closingdoors.nyc - feedback");
const getDebugInfo = () => {
  const buildInfo = getBuildInfo();
  const userAgent = navigator.userAgent;
  return {
    buildInfo,
    userAgent,
  };
};
const buildEmailBody = () =>
  encodeURI(`Feedback:

Debug information:
${JSON.stringify(getDebugInfo(), null, 2)}`);

export enum ScheduleCountdownDisplayFormat {
  MinuteRounded = "MINUTE_ROUNDED",
  MinuteFloor = "MINUTE_FLOOR",
  MinuteCeiling = "MINUTE_CEILING",
  Exact = "EXACT",
}

export type DistanceUnits = "km" | "mi";

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

const distanceUnitOptions = [
  { value: "km", name: "KM" },
  { value: "mi", name: "MI" },
];

export interface Settings {
  chat: {
    useLocation: boolean;
  };
  schedule: {
    countdownDisplayFormat: ScheduleCountdownDisplayFormat;
  };
  distanceUnit: DistanceUnits;
  setChatUseLocation: (useLocation: boolean) => void;
  setScheduleCountdownDisplayFormat: (
    countdownDisplayFormat: ScheduleCountdownDisplayFormat,
  ) => void;
  setDistanceUnit: (distanceUnit: DistanceUnits) => void;
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
      setDistanceUnit: (distanceUnit) =>
        set((state) => ({ ...state, distanceUnit })),
      chat: {
        useLocation: false as boolean,
      },
      schedule: {
        countdownDisplayFormat:
          ScheduleCountdownDisplayFormat.MinuteRounded as ScheduleCountdownDisplayFormat,
      },
      distanceUnit: "mi" as DistanceUnits,
    }),
    {
      name: "settings",
    },
  ),
);

export function useSettings() {
  const [mounted, setMounted] = useState(false);
  const settings = useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  return { ...settings, settingsReady: mounted };
}

export async function getStaticProps() {
  const filePath = "./md/privacy-and-terms.md";
  const fileContents = fs.readFileSync(filePath, "utf8");

  // Use gray-matter to parse the post metadata section
  const { content, data } = matter(fileContents);

  // Combine the data with the id and contentHtml
  return {
    props: {
      content,
      data,
    },
  };
}

export default function Settings({ content }: any) {
  const {
    chat: { useLocation },
    schedule: { countdownDisplayFormat },
    distanceUnit,
    setChatUseLocation,
    setScheduleCountdownDisplayFormat,
    setDistanceUnit,
    settingsReady,
  } = useSettings();

  if (!settingsReady) {
    return null;
  }

  let durationToPreview: Duration;
  let displayFormatDescription: string;
  switch (countdownDisplayFormat) {
    case ScheduleCountdownDisplayFormat.MinuteRounded:
      durationToPreview = Duration.fromMillis(1000 * 60 * 3 + 1000 * 45);
      displayFormatDescription =
        "Time rounded up or down to the nearest minute.";
      break;
    case ScheduleCountdownDisplayFormat.MinuteFloor:
      durationToPreview = Duration.fromMillis(1000 * 60 * 3 + 1000 * 45);
      displayFormatDescription = "Time rounded down to the nearest minute.";
      break;
    case ScheduleCountdownDisplayFormat.MinuteCeiling:
      durationToPreview = Duration.fromMillis(1000 * 60 * 3 + 1000 * 15);
      displayFormatDescription = "Time rounded up to the nearest minute.";
      break;
    case ScheduleCountdownDisplayFormat.Exact:
      durationToPreview = Duration.fromMillis(1000 * 60 * 3 + 1000 * 30);
      displayFormatDescription = "Exact time. This may jump around a lot.";
      break;
  }

  const buildInfo = getBuildInfo();

  return (
    <div className="text-white px-2">
      <section>
        <h1 className="text-xl font-bold">General</h1>
        <div className="py-2">
          <LabelledTabSwitcher
            label="Distance unit"
            options={distanceUnitOptions}
            selected={distanceUnit}
            setSelected={setDistanceUnit as (option: string) => void}
            widthPercent={30}
          />
        </div>
      </section>
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
            widthPercent={45}
          />
        </div>
        <div className="flex flex-col my-2 border border-white p-2">
          <div className="flex text-white text-4xl justify-between">
            <div>{durationToPreview.toFormat("m:ss")}</div>
            <div>→</div>
            <div>
              <TripArrivalTime
                routeDisplay={null}
                timeUntilArrival={durationToPreview}
                interactive={false}
              />
            </div>
          </div>
          <div className="inline-flex items-center mt-1 text-sm">
            <InformationCircleIcon className="w-4 h-4 mr-1 shrink-0" />
            <span>{displayFormatDescription}</span>
          </div>
        </div>
      </section>
      {getChatEnabled() && (
        <section>
          <h1 className="text-xl font-bold mt-4">Chat</h1>
          <div className="py-2">
            <LabelledSwitch
              label="Use location by default"
              onChange={setChatUseLocation}
              enabled={useLocation}
            />
          </div>
        </section>
      )}
      <section>
        <h1 className="text-xl font-bold">About</h1>
        <div className="py-2">
          <div className="flex flex-row justify-between items-center">
            <label>Privacy &amp; Terms</label>
            <Drawer.Root>
              <Drawer.Trigger className="flex flex-row items-center">
                View
                <BarsArrowUpIcon
                  className="ml-2"
                  color="white"
                  width={20}
                  height={20}
                />
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/60" />
                <Drawer.Content className="bg-black flex flex-col fixed bottom-0 left-0 mx-auto right-0 max-h-[75%] max-w-md">
                  <div className="max-w-md prose text-white w-full mx-auto flex flex-col overflow-auto p-4">
                    <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-300 mb-8" />
                    <div
                      className="overflow-auto"
                      dangerouslySetInnerHTML={{
                        __html: md().render(content),
                      }}
                    />
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
          <div className="flex flex-row justify-between mt-4">
            <label>License</label>
            <Link
              className="flex flex-row items-center"
              target="_blank"
              href="https://en.wikipedia.org/wiki/MIT_License"
            >
              MIT
              <ArrowTopRightOnSquareIcon
                className="ml-2"
                color="white"
                width={20}
                height={20}
              />
            </Link>
          </div>
          {process.env.NEXT_PUBLIC_CONTACT_EMAIL && (
            <div className="flex flex-row justify-between mt-4">
              <label>Contact</label>
              <Link
                className="flex flex-row items-center"
                target="_blank"
                href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}?subject=${EMAIL_SUBJECT}&body=${buildEmailBody()}`}
              >
                Email
                <ArrowTopRightOnSquareIcon
                  className="ml-2"
                  color="white"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
          )}
          {buildInfo.GIT_BRANCH && buildInfo.GIT_COMMIT_HASH && (
            <div className="flex flex-row justify-between mt-4">
              <label>Build</label>
              <Link
                className="flex flex-row items-center"
                target="_blank"
                href={`https://github.com/cedarbaum/closingdoors.nyc/tree/${buildInfo.GIT_COMMIT_HASH}`}
              >
                {`${buildInfo.GIT_BRANCH} (${buildInfo.GIT_COMMIT_HASH.slice(
                  0,
                  7,
                )})`}
                <ArrowTopRightOnSquareIcon
                  className="ml-2"
                  color="white"
                  width={20}
                  height={20}
                />
              </Link>
            </div>
          )}
        </div>
      </section>
      <footer className="flex flex-col items-center mt-8">
        <div className="font-bold">Designed & Built in New York, NY 🗽</div>
      </footer>
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
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
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
  widthPercent = 50,
}: {
  label: React.ReactNode;
  options: { name: string; value: string }[];
  selected: string;
  setSelected: (value: string) => void;
  widthPercent?: number;
}) {
  return (
    <div className="flex w-full">
      <Listbox value={selected} onChange={setSelected}>
        <div className="flex w-full justify-between items-center">
          <Listbox.Label>{label}</Listbox.Label>
          <div className="relative" style={{ width: `${widthPercent}%` }}>
            <Listbox.Button className="relative w-full cursor-default bg-white py-2 pl-3 pr-10 text-left shadow-md sm:text-sm">
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

function LabelledTabSwitcher({
  label,
  options,
  selected,
  setSelected,
  widthPercent = 50,
}: {
  label: React.ReactNode;
  options: { name: string; value: string }[];
  selected: string;
  setSelected: (value: string) => void;
  widthPercent?: number;
}) {
  return (
    <Tab.Group
      selectedIndex={options.findIndex((o) => o.value === selected)}
      onChange={(idx) => setSelected(options[idx].value)}
    >
      <div className="flex justify-between items-center">
        <label>{label}</label>
        <Tab.List
          className="flex space-x-1 p-1"
          style={{ width: `${widthPercent}%` }}
        >
          {options.map(({ name, value }) => (
            <Tab
              key={value}
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm font-medium leading-5",
                  selected
                    ? "bg-mtaYellow text-black"
                    : "bg-gray-400 text-white hover:bg-gray-500",
                )
              }
            >
              {name}
            </Tab>
          ))}
        </Tab.List>
      </div>
    </Tab.Group>
  );
}
