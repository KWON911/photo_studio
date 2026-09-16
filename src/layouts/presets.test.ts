import{describe,expect,it}from'vitest';import{getPhysicalSlotSize,getSlotAspectRatio,layouts}from'./presets';

describe('layouts',()=>{
  it('contains three valid four-slot layouts inside their canvases',()=>{
    expect(layouts).toHaveLength(3);
    layouts.forEach(layout=>{
      expect(layout.slots).toHaveLength(4);
      layout.slots.forEach(slot=>{
        expect(slot.x+slot.width).toBeLessThanOrEqual(1);
        expect(slot.y+slot.height).toBeLessThanOrEqual(1);
      });
    });
  });

  it('derives a slot aspect ratio from physical canvas dimensions',()=>{
    const classic=layouts.find(layout=>layout.id==='classic')!;
    const slot=classic.slots[0];
    expect(getPhysicalSlotSize(classic,slot)).toEqual({width:1008,height:756});
    expect(getSlotAspectRatio(classic,slot)).toBeCloseTo(4/3,6);
    expect(getSlotAspectRatio(classic,slot)).not.toBeCloseTo(slot.width/slot.height,6);
  });

  it('keeps classic, grid, and wide photo slots at practical non-panorama ratios',()=>{
    const ranges={classic:[1.25,1.4],grid:[.72,.82],wide:[1.35,1.6]} as const;
    layouts.forEach(layout=>layout.slots.forEach(slot=>{
      const [minimum,maximum]=ranges[layout.id];
      expect(getSlotAspectRatio(layout,slot)).toBeGreaterThan(minimum);
      expect(getSlotAspectRatio(layout,slot)).toBeLessThan(maximum);
    }));
  });

  it('uses the specified 3304 by 4920 physical grid geometry',()=>{
    const grid=layouts.find(layout=>layout.id==='grid')!;
    expect([grid.outputWidth,grid.outputHeight]).toEqual([3304,4920]);
    expect(grid.slots).toHaveLength(4);
    const expectedPhysicalSlots=[[205,250,1411,1900],[1688,250,1411,1900],[205,2206,1411,1900],[1688,2206,1411,1900]] as const;
    grid.slots.forEach((slot,index)=>{
      const [expectedX,expectedY,expectedWidth,expectedHeight]=expectedPhysicalSlots[index];
      expect(getPhysicalSlotSize(grid,slot)).toEqual({width:expectedWidth,height:expectedHeight});
      expect(slot.x*grid.outputWidth).toBeCloseTo(expectedX,6);
      expect(slot.y*grid.outputHeight).toBeCloseTo(expectedY,6);
      expect(getSlotAspectRatio(grid,slot)).toBeCloseTo(1411/1900,6);
      expect(slot.x+slot.width).toBeLessThanOrEqual(1);
      expect(slot.y+slot.height).toBeLessThanOrEqual(1);
    });
    const [topLeft,topRight,bottomLeft,bottomRight]=grid.slots;
    expect(grid.outputWidth-(topRight.x+topRight.width)*grid.outputWidth).toBeCloseTo(205,6);
    expect((topRight.x-topLeft.x-topLeft.width)*grid.outputWidth).toBeCloseTo(72,6);
    expect((bottomLeft.y-topLeft.y-topLeft.height)*grid.outputHeight).toBeCloseTo(56,6);
    expect(topLeft.x+topLeft.width).toBeLessThanOrEqual(topRight.x);
    expect(topLeft.y+topLeft.height).toBeLessThanOrEqual(bottomLeft.y);
    expect(bottomLeft.x+bottomLeft.width).toBeLessThanOrEqual(bottomRight.x);
    expect(topRight.y+topRight.height).toBeLessThanOrEqual(bottomRight.y);
    expect(bottomLeft.y+bottomLeft.height).toBeLessThanOrEqual(grid.footerY);
    expect(grid.footerY*grid.outputHeight).toBeCloseTo(4232,6);
    expect(grid.footerHeight*grid.outputHeight).toBeCloseTo(688,6);
  });
});
