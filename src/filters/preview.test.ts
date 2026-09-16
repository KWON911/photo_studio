import{describe,expect,it,vi}from'vitest';import{filterById}from'./presets';import{applyFilterToPreviewCanvas}from'./preview';

describe('applyFilterToPreviewCanvas',()=>{
  it('uses the shared pixel adjustment outcome for a Mono preview',()=>{
    const image={data:new Uint8ClampedArray([40,120,220,255]),width:1,height:1} as ImageData;
    const putImageData=vi.fn(),context={canvas:{width:1,height:1},getImageData:()=>image,putImageData} as unknown as CanvasRenderingContext2D;

    applyFilterToPreviewCanvas(context,filterById('mono'));

    expect(image.data[0]).toBe(image.data[1]);
    expect(image.data[1]).toBe(image.data[2]);
    expect(putImageData).toHaveBeenCalledWith(image,0,0);
  });
});
