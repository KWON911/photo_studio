import type{LayoutId,LayoutPreset,LayoutSlot}from'../types/photo';
export const layouts:LayoutPreset[]=[
{id:'classic',name:'클래식',outputWidth:1200,outputHeight:3600,footerY:.91,footerHeight:.09,previewAspectRatio:1200/3600,slots:[{x:.08,y:.04,width:.84,height:.21},{x:.08,y:.26,width:.84,height:.21},{x:.08,y:.48,width:.84,height:.21},{x:.08,y:.70,width:.84,height:.21}]},
{id:'grid',name:'그리드',outputWidth:3304,outputHeight:4920,footerY:4232/4920,footerHeight:688/4920,previewAspectRatio:3304/4920,slots:[{x:205/3304,y:250/4920,width:1411/3304,height:1900/4920},{x:1688/3304,y:250/4920,width:1411/3304,height:1900/4920},{x:205/3304,y:2206/4920,width:1411/3304,height:1900/4920},{x:1688/3304,y:2206/4920,width:1411/3304,height:1900/4920}]},
{id:'wide',name:'와이드',outputWidth:1440,outputHeight:4500,footerY:.92,footerHeight:.08,previewAspectRatio:1440/4500,slots:[{x:.04,y:.04,width:.92,height:.20},{x:.04,y:.25,width:.92,height:.20},{x:.04,y:.46,width:.92,height:.20},{x:.04,y:.67,width:.92,height:.20}]}
];
export const getLayoutAspectRatio=(layout:LayoutPreset)=>layout.outputWidth/layout.outputHeight;
export const getPhysicalSlotSize=(layout:LayoutPreset,slot:LayoutSlot)=>({width:slot.width*layout.outputWidth,height:slot.height*layout.outputHeight});
export const getSlotAspectRatio=(layout:LayoutPreset,slot:LayoutSlot)=>{const size=getPhysicalSlotSize(layout,slot);return size.width/size.height};
export const layoutById=(id:LayoutId)=>layouts.find(x=>x.id===id)??layouts[0];
