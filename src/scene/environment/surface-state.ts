import type {EnvironmentState} from '../../domain/types'

export function surfaceState(env:EnvironmentState){
 const hour=((env.timeOfDay%24)+24)%24
 const night=hour<6||hour>=19
 const dusk=hour>=16&&hour<19?Math.sin((hour-16)/3*Math.PI):0
 const overcast=env.weather==='rain'||env.weather==='snow'||env.weather==='cloudy'
 return {night,dusk,wet:env.weather==='rain'?1:0,snow:env.season==='winter'?1:0,
  tint:night?'#506783':overcast?'#d2dcdd':dusk>0?'#ffe3bb':'#ffffff',
  ambient:night?.48:overcast?1.08:1.3,sun:night?.65:overcast?1.05:2.3,
  sunX:-6+(hour-8)*.8,leaf:env.season==='autumn'?'#ebc493':env.season==='summer'?'#d8e9c3':'#ffffff'}
}
