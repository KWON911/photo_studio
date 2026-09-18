import{describe,expect,it}from'vitest';import{applyFilterToImageData,applyPhotoAdjustmentsToImageData,applyPortraitRetouchToImageData,skinRetouchWeight}from'./engine';import{filterById}from'./presets';import{defaultSkinRetouch}from'./skin-retouch';
const pixels=(values:number[],width=values.length/4)=>({data:new Uint8ClampedArray(values),width,height:values.length/4/width} as ImageData);
describe('portrait retouch',()=>{
it('defaults to the visible photo booth treatment',()=>expect(defaultSkinRetouch).toBe('booth'));
it('leaves off pixels untouched',()=>{const image=pixels([120,100,86,255]);applyPhotoAdjustmentsToImageData(image,filterById('original'),'none');expect([...image.data]).toEqual([120,100,86,255])});
it('smooths and visibly lifts skin in booth mode',()=>{const image=pixels([105,85,71,255,105,85,71,255,105,85,71,255,105,85,71,255,120,100,86,255,105,85,71,255,105,85,71,255,105,85,71,255,105,85,71,255],3);applyPortraitRetouchToImageData(image,'booth');expect(image.data[16]).toBeLessThan(120);expect(image.data[16]).toBeGreaterThan(105)});
it('makes booth mode more visible than natural mode',()=>{const natural=pixels([145,112,92,255]),booth=pixels([145,112,92,255]);applyPortraitRetouchToImageData(natural,'natural');applyPortraitRetouchToImageData(booth,'booth');expect(booth.data[0]).toBeGreaterThan(natural.data[0])});
it('preserves lips',()=>{const image=pixels([190,110,95,255]);applyPortraitRetouchToImageData(image,'booth');expect([...image.data]).toEqual([190,110,95,255])});
it('uses continuous skin mask',()=>expect(skinRetouchWeight(.62,.49,.4)).toBeGreaterThan(skinRetouchWeight(.5,.47,.43)));
it('keeps mono neutral',()=>{const image=pixels([120,100,86,255]);applyPhotoAdjustmentsToImageData(image,filterById('mono'),'booth');expect(image.data[0]).toBe(image.data[1])});
it('keeps original neutral',()=>{const image=pixels([40,120,220,255]);applyFilterToImageData(image,filterById('original'));expect([...image.data]).toEqual([40,120,220,255])});
});
