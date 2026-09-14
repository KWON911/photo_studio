import type{LayoutId,LayoutPreset}from'../types/photo';
export const layouts:LayoutPreset[]=[
{id:'classic',name:'클래식',outputWidth:1440,outputHeight:5000,footerY:.89,footerHeight:.11,previewAspectRatio:1440/5000,slots:[{x:.08,y:.06,width:.84,height:.19},{x:.08,y:.27,width:.84,height:.19},{x:.08,y:.48,width:.84,height:.19},{x:.08,y:.69,width:.84,height:.19}]},
{id:'grid',name:'그리드',outputWidth:1800,outputHeight:2250,footerY:.84,footerHeight:.16,previewAspectRatio:.8,slots:[{x:.07,y:.06,width:.41,height:.36},{x:.52,y:.06,width:.41,height:.36},{x:.07,y:.46,width:.41,height:.36},{x:.52,y:.46,width:.41,height:.36}]},
{id:'wide',name:'와이드',outputWidth:1440,outputHeight:4050,footerY:.90,footerHeight:.10,previewAspectRatio:1440/4050,slots:[{x:.05,y:.04,width:.90,height:.205},{x:.05,y:.265,width:.90,height:.205},{x:.05,y:.49,width:.90,height:.205},{x:.05,y:.715,width:.90,height:.165}]}
]; export const layoutById=(id:LayoutId)=>layouts.find(x=>x.id===id)??layouts[0];
