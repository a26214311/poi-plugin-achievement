import _ from 'lodash'

export const getDateNo = (now) =>{
  now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000)
  let date = now.getDate()
  let hour = now.getHours()
  if(hour<1){
    date = date -1
    hour = hour + 24
  }
  const no = (date-1)*2+((hour>=13)?1:0)
  return no
}

export const getRankDateNo = (now) =>{
  now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000)
  let date = now.getDate()
  let hour = now.getHours()
  if(hour<2){
    date = date -1
    hour = hour + 24
  }
  const no = (date-1)*2+((hour>=14)?1:0)
  return no
}

export const senkaOfDay = (exphis,tmpexp,tmpno) => {
  const hiskey = Object.keys(exphis).sort((a, b) => parseInt(a) - parseInt(b))
  let lastkey = hiskey[0]
  const expadd=[]
  hiskey.map(key => {
    if(key != hiskey[0] && key <= getDateNo(new Date())) {
      const addsenka = (exphis[key] - exphis[lastkey]) / 50000 * 35
      if(exphis[lastkey] > 0){
        expadd[key] = addsenka
      }
      lastkey = key
    }
  })

  if(!expadd[tmpno+1]){
    if(exphis[lastkey]>0&&tmpno<=getDateNo(new Date())) {
      const addsenka = (tmpexp - exphis[lastkey]) / 50000 * 35
      expadd[tmpno + 1] = addsenka
    }
  }
  return expadd
}

export const fs = require('fs')
export const exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"]
export const exvalue={"1-5":75,"1-6":75,"2-5":100,"3-5":150,"4-5":180,"5-5":200,"6-5":250}

export const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31]

export const MAGIC_R_NUMS = [ 8931, 1201, 1156, 5061, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6586 ]
//export const MAGIC_L_NUMS = [ 25, 92, 79, 52, 58, 36, 93, 92, 58, 82 ]  // 2017.2.28-2017.3.17
//export const MAGIC_L_NUMS = [ 63, 30, 70, 83, 95, 52, 45, 88, 92, 83 ]     // 2017.3.17-2017.4.6
//export const MAGIC_L_NUMS = [26,79,33,71,95,75,40,54,37,78]     // 2017.4.6-2017.5.2
export const MAGIC_L_NUMS = [36,31,33,97,64,54,52,78,40,85]     // 2017.5.2-2017.5.22


/*
   gcd(a1,a2,a3,...) returns:

   - NaN if the argument list is empty
   - NaN if any of the arguments is not an integer
   - otherwise the greatest common divisor of a1,a2,a3...
 */
const gcd = (() => {
  const unsafeBinaryGcd = (m,n) =>
    n === 0 ? m : gcd(n,m % n)

  return (...args) =>
    args.length === 0 ?
      NaN :
    args.every(_.isInteger) ?
      args.reduce(unsafeBinaryGcd) :
    NaN
})()

/*
   find senka magic number, return null on failure
 */
const findSenkaMagicNum = apiData => {
  let failed = false
  const obfsRates = apiData.map(raw => {
    const no = raw.api_mxltvkpyuklh
    const key = raw.api_wuhnhojjxmke
    const magicR = MAGIC_R_NUMS[no % 13]
    if (key % magicR !== 0){
      console.warn(`${key} is indivisible by ${magicR}`)
      failed = true
    }
    return key / magicR
  })
  if (failed)
    return null

  const magicX = gcd(...obfsRates)

  if (_.isNaN(magicX))
    return null

  if (magicX < 99)
    return magicX

  for (let magic=99; magic>0; --magic) {
    if (magicX % magic === 0)
      return magic
  }
  // unreachable, because magicX % 1 === 0 will always be true.
}

export {
  gcd,
  findSenkaMagicNum,
}
