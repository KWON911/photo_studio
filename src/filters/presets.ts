import type {PhotoFilter} from '../types/photo';
const neutral={exposure:0,contrast:0,saturation:0,temperature:0,tint:0,blackLift:0,shadows:0,highlights:0,vignette:0,grain:0} as const;
export const filters:PhotoFilter[]=[
 {id:'original',name:'Original',adjustments:neutral},
 {id:'mono',name:'Mono',adjustments:{...neutral,exposure:.02,contrast:.05,saturation:-1,blackLift:.015,shadows:.06,highlights:.07,vignette:.035}},
 {id:'soft-portrait',name:'Soft Portrait',adjustments:{...neutral,exposure:.08,contrast:-.07,saturation:-.04,temperature:.015,tint:.005,blackLift:.01,shadows:.07,highlights:.1,vignette:.015}},
 {id:'clean-bright',name:'Clean Bright',adjustments:{...neutral,exposure:.12,contrast:.06,saturation:.02,temperature:-.005,blackLift:.005,shadows:.03,highlights:.12,vignette:.01}},
 {id:'warm-film',name:'Warm Film',adjustments:{...neutral,exposure:.04,contrast:-.02,temperature:.055,tint:.006,blackLift:.012,shadows:.045,highlights:.08,vignette:.06}},
 {id:'matte-film',name:'Matte Film',adjustments:{...neutral,exposure:.02,contrast:-.08,saturation:-.14,temperature:.025,blackLift:.08,shadows:.05,highlights:.08,vignette:.075}}
];
export const filterById=(id:PhotoFilter['id'])=>filters.find(x=>x.id===id)??filters[0];
