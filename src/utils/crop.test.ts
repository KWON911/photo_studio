import{describe,expect,it}from'vitest';import{layoutById}from'../layouts/presets';import{clampTransformForCover,cropRect,cropRectForSlot}from'./crop';

describe('cropRect',()=>{
  it('uses centered cover crop by default',()=>expect(cropRect(1600,900,400,300)).toMatchObject({left:200,top:0,width:1200,height:900}));
  it('applies normalized photo translation relative to the target slot',()=>expect(cropRect(1600,900,400,300,{scale:1.5,offsetX:.25,offsetY:0}).left).toBe(200));
  it('uses physical layout slot dimensions instead of normalized dimensions',()=>{
    const layout=layoutById('classic');
    expect(cropRectForSlot(1600,900,layout,layout.slots[0])).toMatchObject({left:200,top:0,width:1200,height:900});
  });
  it('keeps stored pan within the current cover scale without resetting it',()=>expect(clampTransformForCover({scale:1.5,offsetX:1,offsetY:-1})).toEqual({scale:1.5,offsetX:.25,offsetY:-.25}));
});
