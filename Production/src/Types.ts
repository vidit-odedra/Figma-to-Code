
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
}

export interface node {
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
            color: color
        }],
    children : node[]
}