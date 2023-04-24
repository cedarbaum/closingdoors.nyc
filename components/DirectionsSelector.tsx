import { ReactNode } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

export enum Direction {
  North = "N",
  South = "S",
}

export interface DirectionsSelectorProps {
  direction: Direction | null;
  directionChanged: (direction: Direction) => void;
  northBoundAlias?: string;
  southBoundAlias?: string;
}

export default function DirectionSelectors({
  direction,
  directionChanged,
  northBoundAlias,
  southBoundAlias,
}: DirectionsSelectorProps) {
  return (
    <div className="w-full bg-black flex text-2xl">
      <DirectionSelector
        onClick={() => directionChanged(Direction.North)}
        selected={direction === Direction.North}
      >
        {(selected) =>
          northBoundAlias ? (
            <span
              className={`text-white text-[40px] ${
                selected ? "font-bold" : "opacity-50"
              }`}
            >
              {northBoundAlias}
            </span>
          ) : (
            <ArrowUpIcon
              className={`h-full w-full ${
                selected ? "stroke-[3px]" : "opacity-50"
              }`}
            />
          )
        }
      </DirectionSelector>
      <DirectionSelector
        onClick={() => directionChanged(Direction.South)}
        selected={direction === Direction.South}
      >
        {(selected) =>
          southBoundAlias ? (
            <span
              className={`text-white text-[40px] ${
                selected ? "font-bold" : "opacity-50"
              }`}
            >
              {southBoundAlias}
            </span>
          ) : (
            <ArrowDownIcon
              className={`h-full w-full ${
                selected ? "stroke-[3px]" : "opacity-50"
              }`}
            />
          )
        }
      </DirectionSelector>
    </div>
  );
}

interface DirectionSelectorProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  children: (selected: boolean) => ReactNode;
  selected?: boolean;
}

function DirectionSelector({
  children,
  selected,
  ...rest
}: DirectionSelectorProps) {
  return (
    <div
      className="flex justify-center items-center w-1/2 h-20 p-4 cursor-pointer select-none"
      {...rest}
    >
      {children(selected ?? false)}
    </div>
  );
}
