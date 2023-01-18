// http://web.mta.info/developers/resources/line_colors.htm
export const enum MTA_COLORS {
  red = "#EE352E",
  green = "#6CBE45",
  blue = "#0039A6",
  orange = "#FF6319",
  purple = "#B933AD",
  green2 = "#00933C",
  yellow = "#FCCC0A",
  gray = "#A7A9AC",
  brown = "#996633",
}

export const enum TEXT_COLORS {
  WHITE = "#fff",
  BLACK = "#000",
}

export const enum DIRECTION {
  UPTOWN = "N",
  DOWNTOWN = "S",
}

export interface Route {
  name: string;
  isDiamond?: boolean;
  isShuttle?: boolean;
  northAlias?: string;
  southAlias?: string;
}

export interface Line {
  name: string;
  routes: Route[];
  color: MTA_COLORS;
  textColor?: string;
}

export const allLines: Line[] = [
  {
    name: "IND Eighth Avenue Line",
    color: MTA_COLORS.blue,
    routes: [{ name: "A" }, { name: "C" }, { name: "E" }],
  },
  {
    name: "IND Sixth Avenue Line",
    color: MTA_COLORS.orange,
    routes: [
      { name: "B" },
      { name: "D" },
      { name: "F" },
      { name: "F", isDiamond: true },
      { name: "M" },
    ],
  },
  {
    name: "IND Crosstown Line",
    color: MTA_COLORS.green2,
    routes: [{ name: "G" }],
  },
  {
    name: "BMT Canarsie Line",
    color: MTA_COLORS.gray,
    routes: [
      { name: "L", isShuttle: true, northAlias: "MH", southAlias: "BK" },
    ],
  },
  {
    name: "BMT Nassau Street Line",
    color: MTA_COLORS.brown,
    routes: [{ name: "J" }, { name: "Z" }],
  },
  {
    name: "BMT Broadway Line",
    color: MTA_COLORS.yellow,
    textColor: TEXT_COLORS.BLACK,
    routes: [{ name: "N" }, { name: "Q" }, { name: "R" }, { name: "W" }],
  },
  {
    name: "IRT Broadway-Seventh Avenue Line",
    color: MTA_COLORS.red,
    routes: [{ name: "1" }, { name: "2" }, { name: "3" }],
  },
  {
    name: "IRT Lexington Avenue Line",
    color: MTA_COLORS.green,
    routes: [
      { name: "4" },
      { name: "5" },
      { name: "6" },
      { name: "6", isDiamond: true },
    ],
  },
  {
    name: "IRT Flushing Line",
    color: MTA_COLORS.purple,
    routes: [{ name: "7" }, { name: "7", isDiamond: true }],
  },
  {
    name: "Shuttles",
    color: MTA_COLORS.gray,
    routes: [
      { name: "H", isShuttle: true, northAlias: "🏢", southAlias: "🏖️" },
      { name: "FS", isShuttle: true, northAlias: "🏢", southAlias: "🌳" },
      { name: "GS", isShuttle: true, northAlias: "TS", southAlias: "GC" },
    ],
  },
];

export const allRoutes = allLines.flatMap((line) => line.routes);
