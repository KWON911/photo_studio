import{defaultTextSize}from'../types/photo';import type{Frame,LayoutPreset,Photo,PhotoFilter,PhotoTransform,TextAlignment,TextSize,TypographyPreset}from'../types/photo';
import{cropRectForSlot,defaultTransform}from'./crop';
import{layoutById}from'../layouts/presets';
import{truncateMessage}from'./result';
import{getFooterTextLayout}from'../typography/footer-layout';
import{defaultTypographyId,ensureTypographyLoaded,typographyById}from'../typography/presets';

export async function capture(video:HTMLVideoElement,mirrored:boolean){const canvas=document.createElement('canvas');canvas.width=video.videoWidth||1280;canvas.height=video.videoHeight||720;const context=canvas.getContext('2d')!;if(mirrored){context.translate(canvas.width,0);context.scale(-1,1)}context.drawImage(video,0,0,canvas.width,canvas.height);return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('저장 오류')),'image/jpeg',.92))}
const load=(url:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=url});

export async function compose(photos:Photo[],frame:Frame,filter:PhotoFilter,transforms:Record<string,PhotoTransform>,showDate:boolean,message='',date=new Date(),layout:LayoutPreset=layoutById('classic'),typography:TypographyPreset=typographyById(defaultTypographyId),alignment:TextAlignment='center',textSize:TextSize=defaultTextSize){
  const canvas=document.createElement('canvas');canvas.width=layout.outputWidth;canvas.height=layout.outputHeight;
  const context=canvas.getContext('2d')!;context.fillStyle=frame.background;context.fillRect(0,0,canvas.width,canvas.height);context.filter=filter.cssFilter;
  for(const[index,photo]of photos.entries()){
    const slot=layout.slots[index],size={width:slot.width*canvas.width,height:slot.height*canvas.height},image=await load(photo.url),crop=cropRectForSlot(image.width,image.height,layout,slot,transforms[photo.id]??defaultTransform);
    context.drawImage(image,crop.left,crop.top,crop.width,crop.height,slot.x*canvas.width,slot.y*canvas.height,size.width,size.height);
  }
  const text=truncateMessage(message),formattedDate=`${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`,brand=frame.label??'감성사진관',footer=getFooterTextLayout({layout,typography,alignment,hasMessage:Boolean(text),hasDate:showDate,outputWidth:canvas.width,textSize}),fontFamily=await ensureTypographyLoaded(typography,footer.messageSize,[text,showDate?formattedDate:'',brand].filter(Boolean).join(' ')),contentWidth=footer.contentRight-footer.contentLeft;
  context.filter='none';context.fillStyle=frame.color;context.textAlign=footer.canvasAlign;context.textBaseline='alphabetic';context.letterSpacing=`${typography.letterSpacing}em`;
  context.save();context.beginPath();context.rect(footer.contentLeft,layout.footerY*canvas.height,contentWidth,layout.footerHeight*canvas.height);context.clip();
  const drawLine=(line:string,size:number,weight:number,y:number)=>{context.font=`${weight} ${size}px ${fontFamily}`;context.fillText(line,footer.anchorX,y)};
  if(text)drawLine(text,footer.messageSize,typography.messageWeight,footer.messageY);
  if(showDate)drawLine(formattedDate,footer.dateSize,typography.dateWeight,footer.dateY);
  drawLine(brand,footer.brandSize,typography.dateWeight,footer.brandY);context.restore();
  return new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('합성 오류')),'image/jpeg',.94));
}
export const name=()=>{const date=new Date(),pad=(value:number)=>String(value).padStart(2,'0');return `photo-studio_${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}.jpg`};
