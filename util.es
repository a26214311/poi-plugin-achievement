export const getDateNo = (now) =>{
  now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000);
  var date = now.getDate();
  var hour = now.getHours();
  if(hour<1){
    date = date -1;
    hour = hour + 24;
  }
  var no = (date-1)*2+((hour>=13)?1:0);
  return no;
}

export const getRankDateNo = (now) =>{
  now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000);
  var date = now.getDate();
  var hour = now.getHours();
  if(hour<1){
    date = date -1;
    hour = hour + 24;
  }
  var no = (date-1)*2+((hour>=14)?1:0);
  return no;
}

const ea = (max, min) => (max % min ? ea(min, max % min) : min);
export const EAforArr = arr => arr.sort().reduce((pre, cur) => ea(cur, pre));



export const fs = require('fs')
export const exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"];
export const exvalue={"1-5":75,"1-6":75,"2-5":100,"3-5":150,"4-5":180,"5-5":200,"6-5":250};

export const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

export const MAGIC_R_NUMS = [ 8931, 1201, 1156, 5061, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6586 ]
//export const MAGIC_L_NUMS = [ 25, 92, 79, 52, 58, 36, 93, 92, 58, 82 ]  // 2017.2.28-2017.3.17
//export const MAGIC_L_NUMS = [ 63, 30, 70, 83, 95, 52, 45, 88, 92, 83 ]     // 2017.3.17-2017.4.6
export const MAGIC_L_NUMS = [26,79,33,71,95,75,40,54,37,78]     // 2017.4.6-2017.?



























