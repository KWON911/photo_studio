import type{PhotoFilter}from'../types/photo';import type{SkinRetouchLevel}from'./skin-retouch';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const luminance=(red:number,green:number,blue:number)=>red*.2126+green*.7152+blue*.0722;
const smoothstep=(edge0:number,edge1:number,value:number)=>{const t=clamp((value-edge0)/(edge1-edge0));return t*t*(3-2*t)};
export const skinRetouchWeight=(red:number,green:number,blue:number)=>{
  const tone=luminance(red,green,blue),redGreen=red/(green||.0001),greenBlue=green/(blue||.0001);
  return smoothstep(1.005,1.10,redGreen)*smoothstep(1.0,1.07,greenBlue)*smoothstep(.16,.28,tone)*(1-smoothstep(.72,.88,tone));
};
const lipProtectionWeight=(red:number,green:number,blue:number)=>smoothstep(1.22,1.48,red/(green||.0001))*smoothstep(1.32,1.62,red/(blue||.0001))*smoothstep(.10,.32,red-blue);
export const retouchLevelParameters={
  natural:{baseStrength:.10,blemishBoost:.10,maxStrength:.18,toneUniformity:0,midtoneLift:0,neighbourDistance:.10,blemishContrast:.018,detailEdge:.18,lowContrastCleanup:0},
  clean:{baseStrength:.22,blemishBoost:.27,maxStrength:.34,toneUniformity:0,midtoneLift:0,neighbourDistance:.13,blemishContrast:.012,detailEdge:.16,lowContrastCleanup:0},
  booth:{baseStrength:.40,blemishBoost:.50,maxStrength:.52,toneUniformity:0,midtoneLift:0,neighbourDistance:.19,blemishContrast:.007,detailEdge:.10,lowContrastCleanup:.30},
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
  const {baseStrength,blemishBoost,maxStrength,toneUniformity,midtoneLift,neighbourDistance,blemishContrast,detailEdge,lowContrastCleanup}=retouchLevelParameters[level];
  for(let index=0;index<data.length;index+=4){
    const pixel=index/4,x=pixel%width,y=Math.floor(pixel/width),originalRed=source[index]/255,originalGreen=source[index+1]/255,originalBlue=source[index+2]/255;
    const tone=luminance(originalRed,originalGreen,originalBlue),skinWeight=skinRetouchWeight(originalRed,originalGreen,originalBlue),finalWeight=skinWeight*(1-lipProtectionWeight(originalRed,originalGreen,originalBlue));
    if(finalWeight<=0)continue;
    const midtone=clamp(1-Math.abs(tone-.52)*1.85),lift=midtone*midtoneLift*finalWeight,liftedTone=tone+lift;
    let red=originalRed+lift,green=originalGreen+lift,blue=originalBlue+lift;
    red+=((liftedTone-red)*toneUniformity*finalWeight);green+=((liftedTone-green)*toneUniformity*finalWeight);blue+=((liftedTone-blue)*toneUniformity*finalWeight);
    const neighbourPixels=[x>0?pixel-1:undefined,x<width-1?pixel+1:undefined,y>0?pixel-width:undefined,y<height-1?pixel+width:undefined].filter((neighbour):neighbour is number=>neighbour!==undefined);
    const similarNeighbours=neighbourPixels.filter(neighbour=>{const offset=neighbour*4;return(Math.abs(source[offset]/255-originalRed)+Math.abs(source[offset+1]/255-originalGreen)+Math.abs(source[offset+2]/255-originalBlue))/3<=neighbourDistance});
    if(similarNeighbours.length){
      const average=similarNeighbours.reduce((sum,neighbour)=>{const offset=neighbour*4;return[sum[0]+source[offset],sum[1]+source[offset+1],sum[2]+source[offset+2]]},[0,0,0]);
      const divisor=similarNeighbours.length*255,averageRed=average[0]/divisor,averageGreen=average[1]/divisor,averageBlue=average[2]/divisor;
      const localContrast=(Math.abs(averageRed-originalRed)+Math.abs(averageGreen-originalGreen)+Math.abs(averageBlue-originalBlue))/3;
      const detailProtection=1-smoothstep(detailEdge,detailEdge*1.8,localContrast);
      const blemishWeight=Math.max(smoothstep(blemishContrast,detailEdge,localContrast),lowContrastCleanup*smoothstep(.003,blemishContrast,localContrast));
      const softness=Math.min(maxStrength,baseStrength+blemishWeight*blemishBoost)*finalWeight*detailProtection;
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
