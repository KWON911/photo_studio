import type{PhotoFilter}from'../types/photo';import type{SkinRetouchLevel}from'./skin-retouch';

const clamp=(value:number)=>Math.max(0,Math.min(1,value));
const luminance=(red:number,green:number,blue:number)=>red*.2126+green*.7152+blue*.0722;
const smoothstep=(edge0:number,edge1:number,value:number)=>{const t=clamp((value-edge0)/(edge1-edge0));return t*t*(3-2*t)};
export const skinRetouchWeight=(red:number,green:number,blue:number)=>{
  const tone=luminance(red,green,blue),redGreen=red/(green||.0001),greenBlue=green/(blue||.0001),chroma=Math.max(red,green,blue)-Math.min(red,green,blue);
  return smoothstep(.98,1.06,redGreen)*smoothstep(.96,1.04,greenBlue)*smoothstep(.07,.22,tone)*(1-smoothstep(.82,.98,tone))*smoothstep(.018,.085,chroma);
};
const lipProtectionWeight=(red:number,green:number,blue:number)=>smoothstep(1.22,1.48,red/(green||.0001))*smoothstep(1.32,1.62,red/(blue||.0001))*smoothstep(.10,.32,red-blue);
export const retouchLevelParameters={
  natural:{smoothing:.48,toneUniformity:.09,midtoneLift:.035,neighbourDistance:.16,radius:2,rosyTone:.006},
  booth:{smoothing:.82,toneUniformity:.17,midtoneLift:.075,neighbourDistance:.22,radius:4,rosyTone:.014},
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

export const applyPortraitRetouchToImageData=(image:ImageData,level:Exclude<SkinRetouchLevel,'none'>='booth')=>{
  const {data,width,height}=image,source=new Uint8ClampedArray(data);
  const {smoothing,toneUniformity,midtoneLift,neighbourDistance,radius,rosyTone}=retouchLevelParameters[level],sampleRadius=Math.min(radius,Math.max(1,Math.floor(Math.min(width,height)/2))),innerRadius=Math.max(1,Math.ceil(sampleRadius/2));
  const sampleOffsets=[[-sampleRadius,0],[sampleRadius,0],[0,-sampleRadius],[0,sampleRadius],[-sampleRadius,-sampleRadius],[sampleRadius,-sampleRadius],[-sampleRadius,sampleRadius],[sampleRadius,sampleRadius],[-innerRadius,0],[innerRadius,0],[0,-innerRadius],[0,innerRadius]] as const;
  for(let index=0;index<data.length;index+=4){
    const pixel=index/4,x=pixel%width,y=Math.floor(pixel/width),originalRed=source[index]/255,originalGreen=source[index+1]/255,originalBlue=source[index+2]/255;
    const tone=luminance(originalRed,originalGreen,originalBlue),skinWeight=skinRetouchWeight(originalRed,originalGreen,originalBlue),finalWeight=skinWeight*(1-lipProtectionWeight(originalRed,originalGreen,originalBlue));
    if(finalWeight<=0)continue;
    const midtone=clamp(1-Math.abs(tone-.52)*1.85),lightingWeight=midtone*(1-smoothstep(.62,.82,tone)),lift=lightingWeight*midtoneLift*finalWeight,liftedTone=tone+lift;
    let red=originalRed+lift+rosyTone*lightingWeight*finalWeight,green=originalGreen+lift,blue=originalBlue+lift+rosyTone*.32*lightingWeight*finalWeight;
    red+=((liftedTone-red)*toneUniformity*finalWeight);green+=((liftedTone-green)*toneUniformity*finalWeight);blue+=((liftedTone-blue)*toneUniformity*finalWeight);
    let sampleRed=0,sampleGreen=0,sampleBlue=0,sampleWeight=0;
    for(const[offsetX,offsetY]of sampleOffsets){
      const sampleX=x+offsetX,sampleY=y+offsetY;
      if(sampleX<0||sampleX>=width||sampleY<0||sampleY>=height)continue;
      const offset=(sampleY*width+sampleX)*4,sampleR=source[offset]/255,sampleG=source[offset+1]/255,sampleB=source[offset+2]/255,difference=(Math.abs(sampleR-originalRed)+Math.abs(sampleG-originalGreen)+Math.abs(sampleB-originalBlue))/3;
      if(difference>neighbourDistance)continue;
      const weight=(1-difference/neighbourDistance)*(.3+.7*skinRetouchWeight(sampleR,sampleG,sampleB));
      sampleRed+=sampleR*weight;sampleGreen+=sampleG*weight;sampleBlue+=sampleB*weight;sampleWeight+=weight;
    }
    if(sampleWeight>0){
      const softness=smoothing*(.45+.55*midtone)*finalWeight;
      red=red*(1-softness)+sampleRed/sampleWeight*softness;green=green*(1-softness)+sampleGreen/sampleWeight*softness;blue=blue*(1-softness)+sampleBlue/sampleWeight*softness;
    }
    data[index]=Math.round(clamp(red)*255);data[index+1]=Math.round(clamp(green)*255);data[index+2]=Math.round(clamp(blue)*255);
  }
  return image;
};

export const applyPhotoAdjustmentsToImageData=(image:ImageData,filter:PhotoFilter,skinRetouch:SkinRetouchLevel='none')=>{
  if(skinRetouch!=='none')applyPortraitRetouchToImageData(image,skinRetouch);
  return applyFilterToImageData(image,filter);
};

export const applyFilterToCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,x=0,y=0,width=context.canvas.width,height=context.canvas.height)=>{
  const image=context.getImageData(x,y,width,height);context.putImageData(applyFilterToImageData(image,filter),x,y);
};

export const applyPhotoAdjustmentsToCanvas=(context:CanvasRenderingContext2D,filter:PhotoFilter,skinRetouch:SkinRetouchLevel='none',x=0,y=0,width=context.canvas.width,height=context.canvas.height)=>{
  const image=context.getImageData(x,y,width,height);context.putImageData(applyPhotoAdjustmentsToImageData(image,filter,skinRetouch),x,y);
};
