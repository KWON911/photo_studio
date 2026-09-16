import type{PhotoFilter}from'../types/photo';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const luminance=(red:number,green:number,blue:number)=>red*.2126+green*.7152+blue*.0722;

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

export const applyFilterToCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,x=0,y=0,width=context.canvas.width,height=context.canvas.height)=>{
  const image=context.getImageData(x,y,width,height);context.putImageData(applyFilterToImageData(image,filter),x,y);
};
