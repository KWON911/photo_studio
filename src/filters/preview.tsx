import{useEffect,useState}from'react';import type{ComponentPropsWithoutRef}from'react';import type{PhotoFilter}from'../types/photo';import type{SkinRetouchLevel}from'./skin-retouch';import{applyPhotoAdjustmentsToCanvas}from'./engine';

export const previewMaxEdge=720;
export const applyFilterToPreviewCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,skinRetouch:SkinRetouchLevel='natural')=>applyPhotoAdjustmentsToCanvas(context,filter,skinRetouch);
const loadImage=(source:string)=>new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=source});
const canvasBlob=(canvas:HTMLCanvasElement)=>new Promise<Blob>((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('미리보기 생성 오류')),'image/png'));

export async function createFilteredPreview(source:string,filter:PhotoFilter,maxEdge=previewMaxEdge,skinRetouch:SkinRetouchLevel='natural'){
  const image=await loadImage(source),sourceWidth=image.naturalWidth||image.width,sourceHeight=image.naturalHeight||image.height,scale=Math.min(1,maxEdge/Math.max(sourceWidth,sourceHeight)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(sourceWidth*scale));canvas.height=Math.max(1,Math.round(sourceHeight*scale));
  const context=canvas.getContext('2d')!;context.drawImage(image,0,0,canvas.width,canvas.height);applyFilterToPreviewCanvas(context,filter,skinRetouch);
  return URL.createObjectURL(await canvasBlob(canvas));
}

export const useFilteredPreview=(source:string,filter:PhotoFilter,maxEdge=previewMaxEdge,skinRetouch:SkinRetouchLevel='natural')=>{
  const [preview,setPreview]=useState(source);
  useEffect(()=>{let active=true,generated='';setPreview(source);void createFilteredPreview(source,filter,maxEdge,skinRetouch).then(url=>{generated=url;if(active)setPreview(url);else URL.revokeObjectURL(url)}).catch(()=>{});return()=>{active=false;if(generated)URL.revokeObjectURL(generated)}},[source,filter.id,maxEdge,skinRetouch]);
  return preview;
};

export function FilteredPreviewImage({source,filter,maxEdge,skinRetouch='natural',...props}:{source:string;filter:PhotoFilter;maxEdge?:number;skinRetouch?:SkinRetouchLevel}&Omit<ComponentPropsWithoutRef<'img'>,'src'>){
  return <img {...props} src={useFilteredPreview(source,filter,maxEdge,skinRetouch)}/>;
}
