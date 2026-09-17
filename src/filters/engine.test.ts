import{describe,expect,it}from'vitest';import{applyFilterToImageData,applyPhotoAdjustmentsToImageData,applyPortraitRetouchToImageData,skinRetouchWeight}from'./engine';import{filterById}from'./presets';import{defaultSkinRetouch}from'./skin-retouch';

const pixels=(values:number[],width=values.length/4)=>({data:new Uint8ClampedArray(values),width,height:values.length/4/width} as ImageData);

describe('applyFilterToImageData',()=>{
  it('uses a continuous bounded skin weight at the skin boundary',()=>{
    const boundary=skinRetouchWeight(.50,.47,.43),skin=skinRetouchWeight(.62,.49,.40);
    expect(boundary).toBeGreaterThan(0);
    expect(boundary).toBeLessThan(1);
    expect(skin).toBeGreaterThan(boundary);
  });
  it('uses natural as the default skin retouch level',()=>{
    expect(defaultSkinRetouch).toBe('natural');
  });

  it('leaves Original pixels unchanged',()=>{
    const image=pixels([40,120,220,255]);
    applyFilterToImageData(image,filterById('original'));
    expect([...image.data]).toEqual([40,120,220,255]);
  });

  it('converts Mono pixels to neutral gray while retaining alpha',()=>{
    const image=pixels([40,120,220,173]);
    applyFilterToImageData(image,filterById('mono'));
    expect(image.data[0]).toBe(image.data[1]);
    expect(image.data[1]).toBe(image.data[2]);
    expect(image.data[3]).toBe(173);
  });

  it('lifts a Matte Film black point without changing transparency',()=>{
    const image=pixels([0,0,0,91]);
    applyFilterToImageData(image,filterById('matte-film'));
    expect(image.data[0]).toBeGreaterThan(0);
    expect(image.data[1]).toBeGreaterThan(0);
    expect(image.data[2]).toBeGreaterThan(0);
    expect(image.data[3]).toBe(91);
  });

  it('brightens a midtone portrait pixel while preserving its alpha',()=>{
    const image=pixels([120,100,86,137]);
    applyPortraitRetouchToImageData(image);
    expect(image.data[0]).toBeGreaterThan(120);
    expect(image.data[1]).toBeGreaterThan(100);
    expect(image.data[3]).toBe(137);
  });

  it('leaves pixels untouched when skin retouch is none',()=>{
    const image=pixels([120,100,86,137]);
    applyPhotoAdjustmentsToImageData(image,filterById('original'),'none' as never);
    expect([...image.data]).toEqual([120,100,86,137]);
  });

  it('makes clean skin retouch stronger than natural without changing alpha',()=>{
    const natural=pixels([120,100,86,137]),clean=pixels([120,100,86,137]);
    applyPhotoAdjustmentsToImageData(natural,filterById('original'),'natural' as never);
    applyPhotoAdjustmentsToImageData(clean,filterById('original'),'clean' as never);
    expect(clean.data[0]-natural.data[0]).toBeGreaterThanOrEqual(8);
    expect(clean.data[3]).toBe(137);
  });

  it('makes booth retouch stronger than clean without changing alpha',()=>{
    const clean=pixels([120,100,86,137]);
    const booth=pixels([120,100,86,137]);
    applyPhotoAdjustmentsToImageData(clean,filterById('original'),'clean');
    applyPhotoAdjustmentsToImageData(booth,filterById('original'),'booth');
    expect(booth.data[0]-clean.data[0]).toBeGreaterThanOrEqual(8);
    expect(booth.data[3]).toBe(137);
  });

  it('keeps Mono Booth output neutral while preserving alpha',()=>{
    const image=pixels([120,100,86,137]);
    applyPhotoAdjustmentsToImageData(image,filterById('mono'),'booth');
    expect(image.data[0]).toBe(image.data[1]);
    expect(image.data[1]).toBe(image.data[2]);
    expect(image.data[3]).toBe(137);
  });

  it('does not blend high-contrast feature neighbours into skin',()=>{
    const isolated=pixels([120,100,86,255]);
    const highContrast=pixels([
      20,20,20,255,20,20,20,255,20,20,20,255,
      20,20,20,255,120,100,86,255,20,20,20,255,
      20,20,20,255,20,20,20,255,20,20,20,255,
    ],3);
    applyPortraitRetouchToImageData(isolated,'booth');
    applyPortraitRetouchToImageData(highContrast,'booth');
    expect([...highContrast.data.slice(16,20)]).toEqual([...isolated.data]);
  });

  it('smooths skin when similar neighbours qualify',()=>{
    const isolated=pixels([120,100,86,255]);
    const similar=pixels([
      115,96,83,255,115,96,83,255,115,96,83,255,
      115,96,83,255,120,100,86,255,115,96,83,255,
      115,96,83,255,115,96,83,255,115,96,83,255,
    ],3);
    applyPortraitRetouchToImageData(isolated,'booth');
    applyPortraitRetouchToImageData(similar,'booth');
    expect([...similar.data.slice(16,20)]).not.toEqual([...isolated.data]);
  });

  it('preserves saturated lip colour during booth retouch',()=>{
    const lips=pixels([190,110,95,255]);
    applyPortraitRetouchToImageData(lips,'booth');
    expect([...lips.data]).toEqual([190,110,95,255]);
  });
});
