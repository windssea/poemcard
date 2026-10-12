// A shared, continuous breeze with slow gusts; each object can keep its own phase.
export function breeze(time:number,strength:number){return strength*(.72+.2*Math.sin(time*.21)+.08*Math.sin(time*.57+1.4))}
