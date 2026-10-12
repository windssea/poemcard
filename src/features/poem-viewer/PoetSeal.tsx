export function PoetSeal({name}:{name:string}){
 return <div className="poet-seal" role="img" aria-label={`${name}印章`}>{[...name].map((char,index)=><span aria-hidden="true" key={index}>{char}</span>)}</div>
}
