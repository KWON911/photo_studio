import type {Frame,LayoutPreset,Photo,PhotoFilter,PhotoTransform}from'../types/photo';
import{clampTransformForCover,defaultTransform}from'../utils/crop';
import{getLayoutAspectRatio,getSlotAspectRatio,layoutById}from'../layouts/presets';

export function PhotoStrip({photos,frame,layout=layoutById('classic'),filter,transforms,active,onSelect,message='',showDate=true,date=new Date()}:{photos:Photo[];frame:Frame;layout?:LayoutPreset;filter:PhotoFilter;transforms:Record<string,PhotoTransform>;active?:string;onSelect?:(id:string)=>void;message?:string;showDate?:boolean;date?:Date}){
  const formattedDate=`${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')}`;
  return <div className="strip layout-strip" style={{background:frame.background,color:frame.color,aspectRatio:String(getLayoutAspectRatio(layout))}}>
    {photos.map((photo,index)=>{
      const slot=layout.slots[index],transform=clampTransformForCover(transforms[photo.id]??defaultTransform);
      return <button key={photo.id} className={active===photo.id?'editing':''} style={{left:`${slot.x*100}%`,top:`${slot.y*100}%`,width:`${slot.width*100}%`,height:`${slot.height*100}%`,aspectRatio:String(getSlotAspectRatio(layout,slot))}} onClick={()=>onSelect?.(photo.id)}>
        <img src={photo.url} alt="선택 사진" style={{filter:filter.cssFilter,transform:`translate(${transform.offsetX*100}%,${transform.offsetY*100}%) scale(${transform.scale})`}}/>
      </button>
    })}
    <footer className="strip-footer" style={{top:`${layout.footerY*100}%`,height:`${layout.footerHeight*100}%`}}>
      {message&&<span className="strip-message">{message}</span>}
      <span>{[frame.label??'감성사진관',showDate?formattedDate:''].filter(Boolean).join(' · ')}</span>
    </footer>
  </div>
}
