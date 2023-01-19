import * as S from "./SubwayIcon.styles";

// IRT
import ImageFor1 from "./svg/1.svg";
import ImageFor2 from "./svg/2.svg";
import ImageFor3 from "./svg/3.svg";
import ImageFor4 from "./svg/4.svg";
import ImageFor5 from "./svg/5.svg";
import ImageFor6 from "./svg/6.svg";
import ImageFor6X from "./svg/6d.svg";
import ImageFor7 from "./svg/7.svg";
import ImageFor7X from "./svg/7d.svg";

// IND
import ImageForA from "./svg/a.svg";
import ImageForC from "./svg/c.svg";
import ImageForE from "./svg/e.svg";

import ImageForB from "./svg/b.svg";
import ImageForD from "./svg/d.svg";
import ImageForF from "./svg/f.svg";
import ImageForFX from "./svg/fd.svg";
import ImageForM from "./svg/m.svg";

import ImageForG from "./svg/g.svg";

// BMT
import ImageForN from "./svg/n.svg";
import ImageForR from "./svg/r.svg";
import ImageForW from "./svg/w.svg";
import ImageForQ from "./svg/q.svg";

import ImageForJ from "./svg/j.svg";
import ImageForZ from "./svg/z.svg";

import ImageForL from "./svg/l.svg";

// SIR
import ImageForSIR from "./svg/sir.svg";

// Shuttles
import ImageForH from "./svg/sr.svg";
import ImageForFS from "./svg/sf.svg";
import ImageForGS from "./svg/s.svg";
import ImageForS from "./svg/s.svg";

export const routeIdToImage = new Map<string, string>([
  ["1", ImageFor1],
  ["2", ImageFor2],
  ["3", ImageFor3],
  ["4", ImageFor4],
  ["5", ImageFor5],
  ["5X", ImageFor5],
  ["6", ImageFor6],
  ["6X", ImageFor6X],
  ["7", ImageFor7],
  ["7X", ImageFor7X],
  ["A", ImageForA],
  ["B", ImageForB],
  ["C", ImageForC],
  ["D", ImageForD],
  ["E", ImageForE],
  ["F", ImageForF],
  ["FX", ImageForFX],
  ["G", ImageForG],
  ["J", ImageForJ],
  ["L", ImageForL],
  ["M", ImageForM],
  ["N", ImageForN],
  ["Q", ImageForQ],
  ["R", ImageForR],
  ["SIR", ImageForSIR],
  ["SI", ImageForSIR],
  ["W", ImageForW],
  ["Z", ImageForZ],
  ["FS", ImageForFS],
  ["GS", ImageForGS],
  ["H", ImageForH],

  // These icons appear in alerts
  ["S", ImageForS],
]);

export interface SubwayIconProps {
  name: string;
  isDiamond?: boolean;
  sizeEm?: number;
  verticalAlign?: string
  opacity?: number;
  border?: string;
  onClick?(): void;
}

export const SubwayIcon: React.FC<SubwayIconProps> = (props) => {
  const imageKey = props.isDiamond ? props.name + "X" : props.name;

  if (!routeIdToImage.has(imageKey)) {
    return null;
  }

  return (
    <S.SubwayIconContainer
      clickable={props.onClick !== undefined}
      onClick={() => props.onClick && props.onClick()}
      sizeEm={props.sizeEm}
      verticalAlign={props.verticalAlign}
    >
      <S.FilteredImage
        src={routeIdToImage.get(imageKey)}
        opacity={props.opacity ? props.opacity : 1.0}
        border={props.border}
      />
    </S.SubwayIconContainer>
  );
};
