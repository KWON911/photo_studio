import {useRef} from 'react';
import type {PointerEvent,WheelEvent} from 'react';
import type {LayoutPreset,LayoutSlot,Photo,PhotoTransform} from '../types/photo';
import {clampTransformForCover,defaultTransform} from '../utils/crop';
import {getSlotAspectRatio} from '../layouts/presets';

const clampScale=(scale:number)=>Math.max(1,Math.min(3,scale));
export const continueDragAfterPinch=(point:{x:number;y:number},value:PhotoTransform)=>({x:point.x,y:point.y,value});

export function PhotoEditor({photo,layout,slot,value,onChange}:{photo:Photo;layout:LayoutPreset;slot:LayoutSlot;value:PhotoTransform;onChange:(value:PhotoTransform)=>void}) {
  const drag=useRef<{x:number;y:number;value:PhotoTransform}|null>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<{distance:number;scale:number}|null>(null);
  const latestTransform=useRef(value);latestTransform.current=value;
  const distance=()=>{const[a,b]=[...pointers.current.values()];return a&&b?Math.hypot(a.x-b.x,a.y-b.y):0};
  const change=(next:PhotoTransform)=>{latestTransform.current=next;onChange(next)};
  const release=(event:PointerEvent<HTMLDivElement>)=>{pointers.current.delete(event.pointerId);const wasPinching=pinch.current!==null;if(pointers.current.size<2){pinch.current=null;const remaining=[...pointers.current.values()][0];drag.current=wasPinching&&remaining?continueDragAfterPinch(remaining,latestTransform.current):null}if(!pointers.current.size)drag.current=null};
  const startDrag=(event:PointerEvent<HTMLDivElement>)=>{
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    event.currentTarget.setPointerCapture(event.pointerId);
    if(pointers.current.size===1)drag.current={x:event.clientX,y:event.clientY,value:latestTransform.current};
    if(pointers.current.size===2)pinch.current={distance:distance(),scale:value.scale};
  };
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    if(!pointers.current.has(event.pointerId))return;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pinch.current&&pointers.current.size===2&&pinch.current.distance){change(clampTransformForCover({...latestTransform.current,scale:clampScale(pinch.current.scale*distance()/pinch.current.distance)}));return}
    if(drag.current){const bounds=event.currentTarget.getBoundingClientRect();change(clampTransformForCover({...drag.current.value,offsetX:drag.current.value.offsetX+(event.clientX-drag.current.x)/bounds.width,offsetY:drag.current.value.offsetY+(event.clientY-drag.current.y)/bounds.height}))}
  };
  const wheel=(event:WheelEvent<HTMLDivElement>)=>{event.preventDefault();change(clampTransformForCover({...latestTransform.current,scale:clampScale(latestTransform.current.scale+(event.deltaY<0?.1:-.1))}))};

  return <div className="photo-editor">
    <p>사진을 드래그하거나 두 손가락으로 확대하세요.</p>
    <div className="zoom"><button onClick={()=>onChange(clampTransformForCover({...value,scale:clampScale(value.scale-.1)}))}>−</button><span>확대</span><button onClick={()=>onChange(clampTransformForCover({...value,scale:clampScale(value.scale+.1)}))}>＋</button><button className="reset" onClick={()=>onChange(defaultTransform)}>초기화</button></div>
    <div className="edit-slot" style={{aspectRatio:String(getSlotAspectRatio(layout,slot))}} onPointerDown={startDrag} onPointerMove={move} onPointerUp={release} onPointerCancel={release} onWheel={wheel} onDoubleClick={()=>onChange(defaultTransform)}>
      <img src={photo.url} alt="편집 중인 사진" style={{transform:`translate(${value.offsetX*100}%,${value.offsetY*100}%) scale(${value.scale})`}}/>
    </div>
  </div>;
}
