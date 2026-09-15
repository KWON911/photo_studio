import type {CSSProperties}from'react';
import type {Frame,LayoutPreset,Photo,PhotoFilter,PhotoTransform,TextAlignment,TypographyPreset}from'../types/photo';
import{clampTransformForCover,defaultTransform}from'../utils/crop';
import{getLayoutAspectRatio,getSlotAspectRatio,layoutById}from'../layouts/presets';
import{getFooterTextLayout}from'../typography/footer-layout';
import{defaultTypographyId,typographyById}from'../typography/presets';
import{truncateMessage}from'../utils/result';

type FooterStyle=CSSProperties&Record<`--footer-${string}`,string>;

export function PhotoStrip({photos,frame,layout=layoutById('classic'),filter,transforms,active,onSelect,message='',showDate=true,date=new Date(),typography=typographyById(defaultTypographyId),alignment='center'}:{photos:Photo[];frame:Frame;layout?:LayoutPreset;filter:PhotoFilter;transforms:Record<string,PhotoTransform>;active?:string;onSelect?:(id:string)=>void;message?:string;showDate?:boolean;date?:Date;typography?:TypographyPreset;alignment?:TextAlignment}){
  const formattedDate=`${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`,footerMessage=truncateMessage(message);
  const footer=getFooterTextLayout({layout,typography,alignment,hasMessage:Boolean(footerMessage),hasDate:showDate,outputWidth:layout.outputWidth}),footerTop=layout.footerY*layout.outputHeight,footerHeight=layout.footerHeight*layout.outputHeight,asFooterPercent=(value:number)=>`${value/footerHeight*100}%`,asWidthPercent=(value:number)=>`${value/layout.outputWidth*100}%`,alignOffset=alignment==='left'?'0%':alignment==='right'?'-100%':'-50%';
  const footerStyle:FooterStyle={top:`${layout.footerY*100}%`,height:`${layout.footerHeight*100}%`,fontFamily:typography.fontFamily,textAlign:alignment,letterSpacing:`${typography.letterSpacing}em`,'--footer-content-left':asWidthPercent(footer.contentLeft),'--footer-content-right':asWidthPercent(footer.contentRight),'--footer-anchor-x':asWidthPercent(footer.anchorX),'--footer-align-offset':alignOffset,'--footer-message-size':`${footer.messageSize/layout.outputWidth*100}cqw`,'--footer-date-size':`${footer.dateSize/layout.outputWidth*100}cqw`,'--footer-brand-size':`${footer.brandSize/layout.outputWidth*100}cqw`,'--footer-message-y':asFooterPercent(footer.messageY-footerTop),'--footer-date-y':asFooterPercent(footer.dateY-footerTop),'--footer-brand-y':asFooterPercent(footer.brandY-footerTop),'--footer-message-weight':String(typography.messageWeight),'--footer-date-weight':String(typography.dateWeight)};
  return <div className="strip layout-strip" style={{background:frame.background,color:frame.color,aspectRatio:String(getLayoutAspectRatio(layout))}}>
    {photos.map((photo,index)=>{
      const slot=layout.slots[index],transform=clampTransformForCover(transforms[photo.id]??defaultTransform);
      return <button key={photo.id} className={active===photo.id?'editing':''} style={{left:`${slot.x*100}%`,top:`${slot.y*100}%`,width:`${slot.width*100}%`,height:`${slot.height*100}%`,aspectRatio:String(getSlotAspectRatio(layout,slot))}} onClick={()=>onSelect?.(photo.id)}>
        <img src={photo.url} alt="선택 사진" style={{filter:filter.cssFilter,transform:`translate(${transform.offsetX*100}%,${transform.offsetY*100}%) scale(${transform.scale})`}}/>
      </button>
    })}
    <footer className="strip-footer" style={footerStyle}>
      {footerMessage&&<span className="strip-message">{footerMessage}</span>}
      {showDate&&<span className="strip-date">{formattedDate}</span>}
      <span className="strip-brand">{frame.label??'감성사진관'}</span>
    </footer>
  </div>
}
