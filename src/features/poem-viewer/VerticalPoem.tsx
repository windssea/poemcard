import type {Poem} from '../../domain/types'
import {PoetSeal} from './PoetSeal'

export function VerticalPoem({poem}:{poem:Poem}){
 return <div className="vertical-poem" dir="ltr">
  <h2>{poem.title}</h2>
  <div className="vertical-attribution"><p>{poem.dynasty} · {poem.poet}</p><PoetSeal name={poem.poet}/></div>
  <div className="vertical-stanzas">{poem.stanzas.map(stanza=><div className="vertical-lines" key={stanza.id}>{stanza.lines.map(line=><p key={line.id}>{line.text}</p>)}</div>)}</div>
 </div>
}
