import {Component} from 'react'
import type {ReactNode} from 'react'
import {useTexture} from '@react-three/drei'

/** A failed image must not tear down the Canvas or the surrounding search UI. */
type Props={urls:string[];children:ReactNode;onFailure?:()=>void}
export class TextureBoundary extends Component<Props,{failed:boolean}>{
 state={failed:false}
 private failures=0
 private retry:ReturnType<typeof setTimeout>|undefined
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){
  this.props.onFailure?.()
  if(this.failures++>=1)return
  useTexture.clear(this.props.urls)
  for(const url of this.props.urls)useTexture.clear(url)
  this.retry=setTimeout(()=>this.setState({failed:false}),1200)
 }
 componentDidUpdate(previous:Readonly<Props>){
  if(previous.urls.join('|')!==this.props.urls.join('|')){
   clearTimeout(this.retry);this.failures=0
   if(this.state.failed)this.setState({failed:false})
  }
 }
 componentWillUnmount(){clearTimeout(this.retry)}
 render(){return this.state.failed?null:this.props.children}
}
