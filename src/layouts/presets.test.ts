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
    const ranges={classic:[1.25,1.4],grid:[.75,.85],wide:[1.35,1.6]} as const;
    layouts.forEach(layout=>layout.slots.forEach(slot=>{
      const [minimum,maximum]=ranges[layout.id];
      expect(getSlotAspectRatio(layout,slot)).toBeGreaterThan(minimum);
      expect(getSlotAspectRatio(layout,slot)).toBeLessThan(maximum);
    }));
  });

  it('uses a portrait 4:5 photocard grid with separate footer space',()=>{
    const grid=layouts.find(layout=>layout.id==='grid')!;
    expect([grid.outputWidth,grid.outputHeight]).toEqual([1600,2000]);
    expect(grid.slots).toHaveLength(4);
    grid.slots.forEach(slot=>expect(getSlotAspectRatio(grid,slot)).toBeGreaterThanOrEqual(.75));
    grid.slots.forEach(slot=>expect(getSlotAspectRatio(grid,slot)).toBeLessThanOrEqual(.85));
    expect(getPhysicalSlotSize(grid,grid.slots[0])).toEqual({width:662.4,height:780});
    expect(grid.slots[0].x+grid.slots[0].width).toBeLessThanOrEqual(grid.slots[1].x);
    expect(grid.slots[0].y+grid.slots[0].height).toBeLessThanOrEqual(grid.slots[2].y);
    expect(grid.slots[2].y+grid.slots[2].height).toBeLessThanOrEqual(grid.footerY);
    expect(grid.footerHeight).toBeCloseTo(.14,6);
  });
});
