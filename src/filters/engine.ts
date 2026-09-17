import type{PhotoFilter}from'../types/photo';import type{SkinRetouchLevel}from'./skin-retouch';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const luminance=(red:number,green:number,blue:number)=>red*.2126+green*.7152+blue*.0722;
const retouchParameters={
  natural:{smoothing:.07,toneUniformity:.03,midtoneLift:.03,neighbourDistance:.10},
  clean:{smoothing:.13,toneUniformity:.05,midtoneLift:.05,neighbourDistance:.09},
  booth:{smoothing:.20,toneUniformity:.07,midtoneLift:.07,neighbourDistance:.075},
}as const;

export const applyFilterToImageData=(image:ImageData,filter:PhotoFilter)=>{
  if(filter.id==='original')return image;
  const {data,width,height}=image,{adjustments}=filter;
  const {exposure,contrast,saturation,temperature,tint,blackLift,shadows,highlights,vignette,grain}=adjustments;
  const exposureMultiplier=2**exposure;
  for(let index=0;index<data.length;index+=4){
    const pixel=index/4,x=pixel%width,y=Math.floor(pixel/width),centerX=(x+.5)/width-.5,centerY=(y+.5)/height-.5;
    let red=data[index]/255*exposureMultiplier,green=data[index+1]/255*exposureMultiplier,blue=data[index+2]/255*exposureMultiplier;
    const tone=luminance(red,green,blue),shadowLift=shadows*(1-clamp(tone))**2,highlightRecovery=highlights*clamp(tone)**2;
    red+=shadowLift-highlightRecovery;green+=shadowLift-highlightRecovery;blue+=shadowLift-highlightRecovery;
    red=.5+(red-.5)*(1+contrast);green=.5+(green-.5)*(1+contrast);blue=.5+(blue-.5)*(1+contrast);
    const gray=luminance(red,green,blue),saturationMultiplier=1+saturation;
    red=gray+(red-gray)*saturationMultiplier;green=gray+(green-gray)*saturationMultiplier;blue=gray+(blue-gray)*saturationMultiplier;
    red+=temperature*.075+tint*.018;green+=tint*.06;blue-=temperature*.075-tint*.018;
    red=blackLift+red*(1-blackLift);green=blackLift+green*(1-blackLift);blue=blackLift+blue*(1-blackLift);
    const radial=Math.min(1,Math.hypot(centerX,centerY)*1.4142),edge=1-vignette*Math.max(0,(radial-.22)/.78)**1.7;
    const noise=grain?(((x*73856093^y*19349663)&255)/255-.5)*grain:0;
    data[index]=Math.round(clamp(red*edge+noise)*255);data[index+1]=Math.round(clamp(green*edge+noise)*255);data[index+2]=Math.round(clamp(blue*edge+noise)*255);
  }
  return image;
};

export const applyPortraitRetouchToImageData=(image:ImageData,level:Exclude<SkinRetouchLevel,'none'>='natural')=>{
  const {data,width,height}=image,source=new Uint8ClampedArray(data);
  const {smoothing,toneUniformity,midtoneLift,neighbourDistance}=retouchParameters[level];
  for(let index=0;index<data.length;index+=4){
    const pixel=index/4,x=pixel%width,y=Math.floor(pixel/width),originalRed=source[index]/255,originalGreen=source[index+1]/255,originalBlue=source[index+2]/255;
    const tone=luminance(originalRed,originalGreen,originalBlue),skinLike=originalRed>originalGreen*1.04&&originalGreen>originalBlue*1.015&&tone>.2&&tone<.82;
    if(!skinLike)continue;
    const midtone=clamp(1-Math.abs(tone-.52)*1.85),lift=midtone*midtoneLift,liftedTone=tone+lift;
    let red=originalRed+lift,green=originalGreen+lift,blue=originalBlue+lift;
    red+=((liftedTone-red)*toneUniformity);green+=((liftedTone-green)*toneUniformity);blue+=((liftedTone-blue)*toneUniformity);
    const neighbourPixels=[x>0?pixel-1:undefined,x<width-1?pixel+1:undefined,y>0?pixel-width:undefined,y<height-1?pixel+width:undefined].filter((neighbour):neighbour is number=>neighbour!==undefined);
    const similarNeighbours=neighbourPixels.filter(neighbour=>{const offset=neighbour*4;return(Math.abs(source[offset]/255-originalRed)+Math.abs(source[offset+1]/255-originalGreen)+Math.abs(source[offset+2]/255-originalBlue))/3<=neighbourDistance});
    if(similarNeighbours.length){
      const average=similarNeighbours.reduce((sum,neighbour)=>{const offset=neighbour*4;return[sum[0]+source[offset],sum[1]+source[offset+1],sum[2]+source[offset+2]]},[0,0,0]);
      const softness=smoothing*midtone,divisor=similarNeighbours.length*255;
      red=red*(1-softness)+average[0]/divisor*softness;green=green*(1-softness)+average[1]/divisor*softness;blue=blue*(1-softness)+average[2]/divisor*softness;
    }
    data[index]=Math.round(clamp(red)*255);data[index+1]=Math.round(clamp(green)*255);data[index+2]=Math.round(clamp(blue)*255);
  }
  return image;
};

export const applyPhotoAdjustmentsToImageData=(image:ImageData,filter:PhotoFilter,skinRetouch:SkinRetouchLevel='natural')=>{
  if(skinRetouch!=='none')applyPortraitRetouchToImageData(image,skinRetouch);
  return applyFilterToImageData(image,filter);
};

export const applyFilterToCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,x=0,y=0,width=context.canvas.width,height=context.canvas.height)=>{
  const image=context.getImageData(x,y,width,height);context.putImageData(applyFilterToImageData(image,filter),x,y);
};

export const applyPhotoAdjustmentsToCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,skinRetouch:SkinRetouchLevel='natural',x=0,y=0,width=context.canvas.width,height=context.canvas.height)=>{
  const image=context.getImageData(x,y,width,height);context.putImageData(applyPhotoAdjustmentsToImageData(image,filter,skinRetouch),x,y);
};
