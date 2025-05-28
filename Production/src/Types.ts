export interface color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface nodeStyle {
  fontSize: string;
  fontStyle: "normal" | "italic";
  fontWeight: string;
  fontFamily: string;
  letterSpacing?: string;
  textAlign?: "LEFT" | "RIGHT";
  textTransform?: "uppercase" | "capitalize";
}

export interface simpleNodeInterface {
  type: string;
  id: string;
  name: string | undefined;
  text?: string;
  style?: nodeStyle;
  position?: "absolute" | "relative";
  left?: string;
  top?: string;
  width?: string;
  height?: string;
  color?: string;
  backgroundcolor?: string;
  children?: simpleNodeInterface[];
  blur?: string;
  opacity?: string;
  border?: string;
  borderColor?: string;
  imageUrl?: string;
}

// ✅ NEW: Fill interface with `type`
export interface fill {
  type: string; // "SOLID" or "IMAGE"
  color?: color;
  opacity?: number;
}

export interface node {
  id: string;
  type: string;
  name: string | undefined;
  characters?: string;
  style?: {
    fontSize: number;
    fontWeight: number;
    fontFamily: string;
    letterSpacing: number;
    textAlignHorizontal?: "LEFT" | "RIGHT";
    textCase?: string;
  };
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: fill[]; // ✅ use the updated fill interface
  effects: {
    type: string;
    visible: boolean;
    radius: number;
  }[];
  strokes: {
    blendMode: string;
    type: string;
    color: color;
  }[];
  strokeWeight: number;
  children: node[];
}
