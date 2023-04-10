import Image from "next/image";

export interface SubwayIconProps extends React.HTMLAttributes<HTMLDivElement> {
  route: string;
  isDiamond?: boolean;
  border?: string;
  opacity?: number;
  width: string | number;
  height: string | number;
}

export const NycSubwayIcon: React.FC<SubwayIconProps> = ({
  route,
  isDiamond,
  border,
  opacity,
  width,
  height,
  ...rest
}) => {
  const imageKey = isDiamond ? route + "X" : route;
  return (
    <span
      {...rest}
      className="inline-block relative"
      style={{ width, height, opacity }}
    >
      <Image
        style={{ border }}
        className={`${border ? "rounded-[100%]" : ""}`}
        src={`/nyc-subway-icons/${imageKey.toLowerCase()}.svg`}
        alt={imageKey}
        fill
      />
    </span>
  );
};
