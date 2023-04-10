// http://web.mta.info/developers/resources/line_colors.htm
export const enum MtaColors {
  Red = "#EE352E",
  Green = "#6CBE45",
  Blue = "#0039A6",
  Orange = "#FF6319",
  Purple = "#B933AD",
  Green2 = "#00933C",
  Yellow = "#FCCC0A",
  Gray = "#A7A9AC",
  Brown = "#996633",
}

export const enum TextColors {
  White = "#fff",
  Black = "#000",
}

// NYC subway only uses North/South for trip directions.
export const enum SubwayDirection {
  North = "N",
  South = "S",
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
  color: MtaColors;
  textColor?: string;
}

export const allLines: Line[] = [
  {
    name: "IND Eighth Avenue Line",
    color: MtaColors.Blue,
    routes: [{ name: "A" }, { name: "C" }, { name: "E" }],
  },
  {
    name: "IND Sixth Avenue Line",
    color: MtaColors.Orange,
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
    color: MtaColors.Green2,
    routes: [{ name: "G" }],
  },
  {
    name: "BMT Canarsie Line",
    color: MtaColors.Gray,
    routes: [
      { name: "L", isShuttle: true, northAlias: "MH", southAlias: "BK" },
    ],
  },
  {
    name: "BMT Nassau Street Line",
    color: MtaColors.Brown,
    routes: [{ name: "J" }, { name: "Z" }],
  },
  {
    name: "BMT Broadway Line",
    color: MtaColors.Yellow,
    textColor: TextColors.Black,
    routes: [{ name: "N" }, { name: "Q" }, { name: "R" }, { name: "W" }],
  },
  {
    name: "IRT Broadway-Seventh Avenue Line",
    color: MtaColors.Red,
    routes: [{ name: "1" }, { name: "2" }, { name: "3" }],
  },
  {
    name: "IRT Lexington Avenue Line",
    color: MtaColors.Green,
    routes: [
      { name: "4" },
      { name: "5" },
      { name: "6" },
      { name: "6", isDiamond: true },
    ],
  },
  {
    name: "IRT Flushing Line",
    color: MtaColors.Purple,
    routes: [{ name: "7" }, { name: "7", isDiamond: true }],
  },
  {
    name: "Shuttles",
    color: MtaColors.Gray,
    routes: [
      { name: "H", isShuttle: true, northAlias: "🏢", southAlias: "🏖️" },
      { name: "FS", isShuttle: true, northAlias: "🏢", southAlias: "🌳" },
      { name: "GS", isShuttle: true, northAlias: "TS", southAlias: "GC" },
    ],
  },
];

export const allRoutes = allLines.flatMap((line) => line.routes);
export const allRoutesIds = new Set(
  allRoutes.map(({ name, isDiamond }) =>
    `${name}${isDiamond ? "X" : ""}`.toLowerCase()
  )
);
