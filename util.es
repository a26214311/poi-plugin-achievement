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
