import{describe,expect,it}from'vitest';import{applyFilterToImageData,applyPhotoAdjustmentsToImageData,applyPortraitRetouchToImageData}from'./engine';import{filterById}from'./presets';

const pixels=(values:number[])=>({data:new Uint8ClampedArray(values),width:values.length/4,height:1} as ImageData);

describe('applyFilterToImageData',()=>{
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
    expect(clean.data[0]).toBeGreaterThan(natural.data[0]);
    expect(clean.data[3]).toBe(137);
  });
});
