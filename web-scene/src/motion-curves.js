// Zero velocity and acceleration at each end; keyframe holds read as intent.
export const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10)};
export function poseTrack(t,keys){
 if(t<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++){const [end,b]=keys[i],[start,a]=keys[i-1];if(t<=end)return a+(b-a)*smooth((t-start)/(end-start));}
 return keys.at(-1)[1];
}
export const gestureWeight=(t,duration,attack=.65,release=1.25)=>smooth(t/attack)*(1-smooth((t-duration+release)/release));
