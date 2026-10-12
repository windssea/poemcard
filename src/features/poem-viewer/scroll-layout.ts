export function scrollLayout(width:number,height:number,ratio:number){
 const mobile=width<700,margin=mobile?10:32,rail=mobile?12:18,top=mobile?30:46,bottom=mobile?16:24
 const sheet={left:margin+rail/2,top,width:width-2*(margin+rail/2),height:Math.max(80,height-top-bottom)}
 const side=mobile?12:30,head=mobile?44:48,foot=mobile?20:38
 const availableWidth=Math.max(1,sheet.width-side*2-12),availableHeight=Math.max(1,sheet.height-head-foot-12)
 const desktop=width>=900,gap=desktop?Math.min(48,availableWidth*.04):0,animationWidth=desktop?(availableWidth-gap)*.52:availableWidth
 const mediaHeight=Math.min(availableHeight,animationWidth/ratio),mediaWidth=mediaHeight*ratio
 const contentLeft=sheet.left+side+6,contentTop=sheet.top+head+6
 const media={left:contentLeft+(animationWidth-mediaWidth)/2,top:contentTop+(availableHeight-mediaHeight)/2,width:mediaWidth,height:mediaHeight}
 const reading=desktop?{left:contentLeft+animationWidth+gap,top:contentTop,width:availableWidth-animationWidth-gap,height:availableHeight}:null
 return {sheet,media,reading,desktop,rail,side,head,foot}
}
