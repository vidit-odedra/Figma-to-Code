export interface color{
    r : number,
    g : number,
    b : number,
    a?: number
}
export interface nodeStyle{
    fontSize        :string,
    fontStyle       :"normal" | "italic", 
    fontWeight      : string,
    fontFamily      : string,
    letterSpacing?  : string,
    textAlign?      :'LEFT' | 'RIGHT',
    textTransform?  :"uppercase" | "capitalize",
}

export interface simpleNodeInterface {
    id : string,
    type    :string,
    name    :string | undefined, 
    text?   :string,
    style?  : nodeStyle,
    position?:"absolute" | "relative",
    left?    :string,
    top?     :string,
    width?   :string,
    height?  :string,
    color?   :string,
    backgroundcolor? : string,
    children? : simpleNodeInterface[],
    blur?           :string,
    opacity?        :string,
    border?         :string,
    borderColor?    :string,
    imageUrl?       :string,
    visible?        :boolean,
    componentProperties? : {
        [key: string]: string,
    },
    layout? : {
        type: "flex" | "grid" | "absolute" | "unknown",
        flexDirection?: "row" | "column",
        justifyContent?: "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly",
        alignItems?: "flex-start" | "center" | "flex-end" | "stretch",
        gridColumns?: number,
        gridRows?: number,
        gap?: string,
        paddingX?: string,
        paddingY?: string
    }
}

export interface node {
    id : string,
    type : string,
    name : string | undefined,
    characters? : string,
    style? : {
        fontSize : number,
        fontWeight : number,
        fontFamily : string,
        letterSpacing : number,
        textAlignHorizontal? : 'LEFT' | 'RIGHT',
        textCase? : string,
    }
    absoluteBoundingBox? :{
        x : number,
        y : number,
        width : number,
        height : number,
    },
    fills? :[{
            color: color,
            opacity: number,
            type?: "SOLID" | "IMAGE",
        }],
    effects :[{
        type : string,
        visible: Boolean,
        radius: number
    }],
    strokes:{
        blendMode: string,
        type: string,
        color: color,
    }[],
    strokeWeight: number,
    children : node[]
    visible: boolean,
    componentProperties? : {
        [key: string]: {
            value: any,
            type: string,
            boundVariables?: any
        }
    }
}