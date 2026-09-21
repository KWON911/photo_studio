export const messageLimit=30;
export const truncateMessage=(value:string)=>value.slice(0,messageLimit);
export const createPhotoFile=(blob:Blob,filename:string)=>new File([blob],filename,{type:'image/jpeg'});
export const canSharePhoto=(file:File)=>typeof navigator!=='undefined'&&'share'in navigator&&typeof navigator.canShare==='function'&&navigator.canShare({files:[file]});
export const isIOSDevice=()=>typeof navigator!=='undefined'&&(/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1));
export const downloadBlob=(blob:Blob,filename:string)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.click();window.setTimeout(()=>URL.revokeObjectURL(url),0)};
