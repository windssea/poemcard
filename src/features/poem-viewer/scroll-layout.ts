export function scrollLayout(width:number,height:number,ratio:number){
 const mobile=width<700,margin=mobile?12:32,rail=mobile?12:18,top=mobile?62:46,bottom=24
 const sheet={left:margin+rail/2,top,width:width-2*(margin+rail/2),height:Math.max(80,height-top-bottom)}
 const side=mobile?16:30,head=mobile?52:48,foot=mobile?26:38
 const availableWidth=Math.max(1,sheet.width-side*2-12),availableHeight=Math.max(1,sheet.height-head-foot-12)
 const desktop=width>=900,gap=desktop?Math.min(48,availableWidth*.04):0,animationWidth=desktop?(availableWidth-gap)*.52:availableWidth
 const mediaHeight=Math.min(availableHeight,animationWidth/ratio),mediaWidth=mediaHeight*ratio
 const contentLeft=sheet.left+side+6,contentTop=sheet.top+head+6
 const media={left:contentLeft+(animationWidth-mediaWidth)/2,top:contentTop+(availableHeight-mediaHeight)/2,width:mediaWidth,height:mediaHeight}
 const reading=desktop?{left:contentLeft+animationWidth+gap,top:contentTop,width:availableWidth-animationWidth-gap,height:availableHeight}:null
 return {sheet,media,reading,desktop,rail,side,head,foot}
}
