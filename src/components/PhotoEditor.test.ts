import{describe,expect,it}from'vitest';
import{continueDragAfterPinch}from'./PhotoEditor';

describe('continueDragAfterPinch',()=>{
  it('continues a remaining pointer from the pinched transform instead of the pre-pinch transform',()=>{
    expect(continueDragAfterPinch({x:120,y:240},{scale:1.8,offsetX:.12,offsetY:-.08})).toEqual({x:120,y:240,value:{scale:1.8,offsetX:.12,offsetY:-.08}});
  });
});
