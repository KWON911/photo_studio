import type{Frame,LayoutPreset,Photo,PhotoFilter,PhotoTransform}from'../types/photo';
import{cropRectForSlot,defaultTransform}from'./crop';
import{layoutById}from'../layouts/presets';
import{truncateMessage}from'./result';

export async function capture(video:HTMLVideoElement,mirrored:boolean){const canvas=document.createElement('canvas');canvas.width=video.videoWidth||1280;canvas.height=video.videoHeight||720;const context=canvas.getContext('2d')!;if(mirrored){context.translate(canvas.width,0);context.scale(-1,1)}context.drawImage(video,0,0,canvas.width,canvas.height);return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('저장 오류')),'image/jpeg',.92))}
const load=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url});

export async function compose(photos:Photo[],frame:Frame,filter:PhotoFilter,transforms:Record<string,PhotoTransform>,showDate:boolean,message='',date=new Date(),layout:LayoutPreset=layoutById('classic')){
  const canvas=document.createElement('canvas');canvas.width=layout.outputWidth;canvas.height=layout.outputHeight;
  const context=canvas.getContext('2d')!;context.fillStyle=frame.background;context.fillRect(0,0,canvas.width,canvas.height);context.filter=filter.cssFilter;
  for(const[index,photo]of photos.entries()){
    const slot=layout.slots[index],size={width:slot.width*canvas.width,height:slot.height*canvas.height},image=await load(photo.url),crop=cropRectForSlot(image.width,image.height,layout,slot,transforms[photo.id]??defaultTransform);
    context.drawImage(image,crop.left,crop.top,crop.width,crop.height,slot.x*canvas.width,slot.y*canvas.height,size.width,size.height);
  }
  context.filter='none';context.fillStyle=frame.color;const fontSize=Math.round(canvas.width*.024);context.font=`500 ${fontSize}px system-ui`;context.textAlign='center';
  const formattedDate=`${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
  const lines=[truncateMessage(message),[frame.label,showDate?formattedDate:''].filter(Boolean).join(' · ')].filter(Boolean),footerTop=layout.footerY*canvas.height,footerHeight=layout.footerHeight*canvas.height,lineHeight=fontSize*1.45,start=footerTop+footerHeight/2-(lines.length-1)*lineHeight/2+fontSize*.35;
  lines.forEach((line,index)=>context.fillText(line,canvas.width/2,start+index*lineHeight));
  return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('합성 오류')),'image/png'));
}
export const name=()=>{const date=new Date(),pad=(value:number)=>String(value).padStart(2,'0');return `photo-studio_${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.png`};
