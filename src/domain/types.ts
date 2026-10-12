export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Weather = 'clear' | 'cloudy' | 'rain' | 'snow'
export type EnvironmentState = {season: Season; timeOfDay: number; weather: Weather; windStrength: number}
export type PoemSummary = {id: string; title: string; poet: string; dynasty: string; thumbnail: string;bookmark?:string;bookmarkMobile?:string}
export type Poem = PoemSummary & {stanzas: {id:string;lines:{id:string;text:string}[]}[];media:{artwork:string; video:{poster:string;width?:number;height?:number;sources:{src:string;type:string;quality:string}[]}};sceneHint:EnvironmentState & {reason:string}}
