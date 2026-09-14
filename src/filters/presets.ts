import type {PhotoFilter} from '../types/photo';
export const filters:PhotoFilter[]=[
 {id:'original',name:'원본',cssFilter:'none'},
 {id:'soft',name:'소프트',cssFilter:'brightness(1.06) contrast(.94) saturate(1.04)'},
 {id:'warm',name:'웜',cssFilter:'sepia(.12) saturate(1.05) contrast(.95) brightness(1.02)'},
 {id:'cool',name:'쿨',cssFilter:'saturate(.93) contrast(1.02) hue-rotate(4deg) brightness(1.02)'},
 {id:'film',name:'필름',cssFilter:'sepia(.16) saturate(.83) contrast(.94) brightness(1.05)'},
 {id:'mono',name:'모노',cssFilter:'grayscale(1) contrast(.94) brightness(1.04)'}
];
export const filterById=(id:PhotoFilter['id'])=>filters.find(x=>x.id===id)??filters[0];
