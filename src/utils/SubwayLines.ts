// http://web.mta.info/developers/resources/line_colors.htm
export const enum LINE_COLORS {
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
    BLACK = "#000"
}

export const enum DIRECTION {
    UPTOWN = 'N',
    DOWNTOWN = 'S',
}

export interface Service {
    name: string
    isExpress?: boolean
}

export interface Line {
    name: string
    services: Service[]
    color: LINE_COLORS
    unselectedColor?: string
    textColor?: string
}

export const allLines: Line[] = [
  {
    name: "IND Eighth Avenue Line",
    color: LINE_COLORS.blue,
    unselectedColor: '#497895',
    services: [{ name: "A" }, { name: "C" }, { name: "E" }],
  },
  {
    name: "IND Sixth Avenue Line",
    color: LINE_COLORS.orange,
    unselectedColor: '#ee8b5b',
    services: [
      { name: "B" },
      { name: "D" },
      { name: "F" },
      { name: "F", isExpress: true },
      { name: "M" },
    ],
  },
  {
    name: "IND Crosstown Line",
    color: LINE_COLORS.green2,
    unselectedColor: '#93b562',
    services: [{ name: "G" }],
  },
  {
    name: "BMT Canarsie Line",
    color: LINE_COLORS.gray,
    unselectedColor: '#cecece',
    services: [{ name: "L" }],
  },
  {
    name: "BMT Nassau Street Line",
    color: LINE_COLORS.brown,
    unselectedColor: '#bf8a4f',
    services: [{ name: "J" }, { name: "Z" }],
  },
  {
    name: "BMT Broadway Line",
    color: LINE_COLORS.yellow,
    unselectedColor: '#D5BC5B',
    textColor: TEXT_COLORS.BLACK,
    services: [{ name: "N" }, { name: "Q" }, { name: "R" }, { name: "W" }],
  },
  {
    name: "IRT Broadway-Seventh Avenue Line",
    color: LINE_COLORS.red,
    unselectedColor: '#bd4a4a',
    services: [{ name: "1" }, { name: "2" }, { name: "3" }],
  },
  {
    name: "IRT Lexington Avenue Line",
    color: LINE_COLORS.green,
    unselectedColor: '#a1e6a18a',
    services: [
      { name: "4" },
      { name: "5" },
      { name: "6" },
      { name: "6", isExpress: true },
    ],
  },
  {
    name: "IRT Flushing Line",
    color: LINE_COLORS.purple,
    unselectedColor: '#ae56ae',
    services: [{ name: "7" }, { name: "7", isExpress: true }],
  },
];

export const allServices = allLines.flatMap(line => line.services)
export const serviceToLineMetadataMap = new Map(allLines.flatMap(line => line.services.map(service => [service.name, line])))