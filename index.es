import React, {Component} from 'react'
import {connect} from 'react-redux'

import {join} from 'path'
import {readJsonSync} from 'fs-extra'
import {Row} from 'react-bootstrap'

import SenkaCalculator from './views/calculator'
import SenkaCalendar, {drawChart} from './views/calendar'
import SenkaInfo from './views/info'

import {
  pluginDidLoad,
  pluginWillUnload,
} from './mananger'

import {
  getDateNo,getRankDateNo,
  fs,exlist,exvalue,dayofMonth,MAGIC_L_NUMS,MAGIC_R_NUMS,
  findSenkaMagicNum,
} from './lib/util'

import {
  mainUISelector,
} from './selectors'

import { debug } from './debug'

const Chart = require("./assets/Chart")

let lineChart

const mkInitState = props => ({
  achieve: {
    exphis: {},
  },
  exphis: {},
  lastmonth: -1,
  r1: 0,
  r501: 0,
  ranktime: 0,
  rankuex:exlist,
  r1time: 0,
  r501time: 0,
  r1last: 0,
  r501last: 0,
  r1lasttime: 0,
  r501lasttime: 0,

  r5:0,
  r5time:0,
  r5last:0,
  r5lasttime:0,
  r20:0,
  r20time:0,
  r20last:0,
  r20lasttime:0,

  r5his:{},
  r20his:{},
  r100his:{},
  r501his:{},

  myhis:{},

  mylastno:0,
  mylastranktime:0,

  mymagic:MAGIC_L_NUMS[props.basic?props.basic.api_member_id:0],
  tmpexp:0,
  tmpno:0,
  reviseType: 0, /* revise */

  mysenka: 0,
  targetsenka: 2400,
  ignoreex: {},
  need_load: true,
  fensureexp: 0,
  fensurets: 0,
  fensuresenka: 0,
  tensureexp:0,
  tensurets:0,
  tensureuex:exlist,
  fensureuex:exlist,
  extraSenka: 1,
  zclearts:0,

  checksum:484764,  //2017.6.5

  senkaType:'calendar',
  chartType: 'mon',
})

export const reactClass = connect(
  mainUISelector,
  null, null, {pure: false}
)(class PluginAchievement extends Component {
  constructor(props) {
    super(props)
    this.state = mkInitState(props)
  }

  componentWillReceiveProps(nextProps){
    const basic = nextProps.basic
    const exp = basic.api_experience
    const now = new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000)
    const month = now.getMonth()
    const no = getDateNo(now)
    const achieve = {}
    const data = this.loadlist()
    let exphistory = data.exphis
    const lastmonth = data.lastmonth
    let needupdate=false
    if(month!=lastmonth){
      exphistory={}
      achieve.exphis=exphistory
      achieve.lastmonth=month
      achieve.fensureexp=0
      achieve.fensurets=0
      achieve.fensuresenka=0
      achieve.fensureuex=exlist
      achieve.r1=0
      achieve.r501=0
      achieve.r5=0
      achieve.r20=0
      achieve.mysenka=0
      achieve.rankuex=exlist
      achieve.extraSenka=1
      achieve.zclearts=0
      achieve.r5his={}
      achieve.r20his={}
      achieve.r100his={}
      achieve.r501his={}
      achieve.myhis={}
      needupdate=true
    }
    if(!exphistory[no]){
      if(!exphistory[data.tmpno+1]){
        if(no>data.tmpno){
          exphistory[data.tmpno+1]=data.tmpexp
        }
      }
      exphistory[no]=exp
      achieve.exphis=exphistory
      needupdate=true
    }
    let willUpdateChart = false
    if(exp>data.tmpexp||exp<data.tmpexp-10000){
      if(now.getDate()==dayofMonth[month]){
        const Hour = now.getHours()
        if(Hour<21){
          achieve.tmpexp=exp
          achieve.tmpno=no
          needupdate=true
        }
      }else{
        achieve.tmpexp=exp
        achieve.tmpno=no
        needupdate=true
      }
      if(!!lineChart){
        willUpdateChart = true
      }
    }
    if(needupdate){
      this.setState(achieve,()=>{
        if(willUpdateChart){
          drawChart(data.chartType, data.senkaType, lineChart, {
            r5his: data.r5his,
            r20his: data.r20his,
            r100his: data.r100his,
            r501his: data.r501his,
            myhis: data.myhis
          })
        }
        this.savelist()
      })
    }
  }


  starttimer(){
    let now = new Date()
    now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000)
    const left = (43200000-(now.getTime()-18001000)%43200000)
    setTimeout(() =>{
      const exp = this.props.basic.api_experience
      const nowtime = new Date()
      const unclearedex = this.props.unclearedExList
      const achieve = {tensureexp:exp,tensurets:nowtime,tensureuex:unclearedex}
      this.setState(achieve,()=>{
        this.savelist()
        setTimeout(()=>{
          this.starttimer()
        },600000)
      })
    },left)
  }

  getRate(rankNo, obfsRate, memberId) {
    const mymagic = this.state.mymagic>9?this.state.mymagic:MAGIC_L_NUMS[memberId % 10]
    const rate = obfsRate / MAGIC_R_NUMS[rankNo % 13] / mymagic - 73 - 18
    return rate > 0 ? rate : 0
  }

  handleResponse = e => {
    const {path, body,postBody} = e.detail

    /*for test only!

    if(path=="/kcsapi/api_req_quest/start"){
      this.setState({extraSenka:2,zclearts:new Date()});
    }
    if(path=="/kcsapi/api_req_quest/stop"){
      this.setState({extraSenka:1,zclearts:0});
    }

    */

    const now = new Date()
    if(path=="/kcsapi/api_req_quest/clearitemget"){
      if(postBody.api_quest_id==854){
        if(now.getDate()==1&&now.getHours()<4){
          this.setState({extraSenka:2})
        }else{
          this.setState({extraSenka:2,zclearts:new Date()})
        }
      }
    }
    if(path=="/kcsapi/api_req_ranking/mxltvkpyuklh"){
      const myname = this.props.basic.api_nickname
      const myid = this.props.basic.api_member_id
      const achieve = this.state
      const page = body.api_disp_page
      const list = body.api_list
      const tensurets = achieve.tensurets

      const sum = this.props.shipChecksum
      const checksum = this.state.checksum
      if(sum>0&&sum!=checksum){
        achieve.reviseType=0
        achieve.checksum=sum
      }
      if(achieve.reviseType==0){
        debug.log('checksum failed,will refresh magic')
        const newmagic = findSenkaMagicNum(list)
        if (newmagic){
          achieve.mymagic=newmagic
          achieve.reviseType=1
          debug.log("newmagic:"+newmagic)
        }
      }
      for(let i=0;i<list.length;i++){
        if(list[i].api_mtjmdcwtvhdr==myname){
          var no=list[i].api_mxltvkpyuklh
          var key = list[i].api_wuhnhojjxmke
          var senka = this.getRate(no,key,myid)
          if(achieve){

          }

          var timeno = getRankDateNo(now)
          achieve.myhis[timeno]=senka


          achieve.mysenka=senka
          achieve.mylastno=achieve.myno
          achieve.mylastranktime=getRankDateNo(achieve.ranktime)
          achieve.myno=no
          const then = achieve.ranktime
          if(getRankDateNo(now)>getRankDateNo(new Date(then))){
            achieve.rankuex = this.props.unclearedExList
          }
          achieve.ranktime = now
          const sub = now.getTime()-new Date(tensurets).getTime()
          const dateno = getRankDateNo(now)
          if(sub>3600000+30000&&sub<3600000*13-30000){
            achieve.fensuresenka=senka
            achieve.fensurets=achieve.tensurets
            achieve.fensureuex=achieve.tensureuex
            achieve.fensureexp=achieve.tensureexp
            achieve.exphis[dateno] = achieve.tensureexp
          }else{
            const ensuresenka=achieve.fensuresenka
            const ensureexp = achieve.fensureexp
            const ensureuex = achieve.fensureuex
            if(ensuresenka>0&&ensureexp>0){
              const thenexp = ensureexp
              const thensenka = ensuresenka
              const senkauex = this.props.unclearedExList
              const addexsenka = this.addExSenka(senkauex,ensureuex)
              if(addexsenka==0){
                const subsenka = (senka-thensenka-addexsenka)*50000/35
                if(subsenka>0){
                  const senkaexp = thenexp + subsenka
                  if(senkaexp<=achieve.tmpexp){
                    achieve.exphis[dateno] = senkaexp
                  }
                }
              }
            }
          }
        }
      }
      if(page==10){
        var no=list[9].api_mxltvkpyuklh
        var key = list[9].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid)
        const r1last = achieve.r1
        const r1time = achieve.r1time
        const r1timeno = getRankDateNo(new Date(r1time))
        achieve.r1=senka
        achieve.r1time=now
        var timeno = getRankDateNo(now)
        achieve.r100his[timeno]=senka
        if(r1timeno!=timeno){
          achieve.r1last=r1last
          achieve.r1lasttime=r1timeno
        }
      }else if(page==51){
        var no=list[0].api_mxltvkpyuklh
        var key = list[0].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid)
        var timeno = getRankDateNo(now)
        const r501last = achieve.r501
        const r501time = achieve.r501time
        const r501timeno = getRankDateNo(new Date(r501time))
        achieve.r501=senka
        achieve.r501time=now
        achieve.r501his[timeno]=senka
        if(r501timeno!=timeno){
          achieve.r501last=r501last
          achieve.r501lasttime=r501timeno
        }
      }else if(page==1){
        var no=list[4].api_mxltvkpyuklh
        var key = list[4].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid)
        var timeno = getRankDateNo(now)
        const r5last = achieve.r5
        const r5time = achieve.r5time
        const r5timeno = getRankDateNo(new Date(r5time))
        achieve.r5=senka
        achieve.r5time=now
        achieve.r5his[timeno]=senka
        if(r5timeno!=timeno){
          achieve.r5last=r5last
          achieve.r5lasttime=r5timeno
        }
      }else if(page==2){
        var no=list[9].api_mxltvkpyuklh
        var key = list[9].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid)
        var timeno = getRankDateNo(now)
        const r20last = achieve.r20
        const r20time = achieve.r20time
        const r20timeno = getRankDateNo(new Date(r20time))
        achieve.r20=senka
        achieve.r20time=now
        achieve.r20his[timeno]=senka
        if(r20timeno!=timeno){
          achieve.r20last=r20last
          achieve.r20lasttime=r20timeno
        }
      }else{

      }
      this.setState(achieve,()=>this.savelist())
    }
  }

  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse)
    this.loadlist()

  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  savelist(){
    try {
      const data = this.loadlist()
      const savepath = join(window.APPDATA_PATH, 'achieve', 'achieve.json')
      fs.writeFileSync(savepath, JSON.stringify(data))
    } catch (e) {
      fs.mkdir(join(window.APPDATA_PATH, 'achieve'))
      try {
        const data = this.loadlist()
        const savepath = join(window.APPDATA_PATH, 'achieve', 'achieve.json')
        fs.writeFileSync(savepath, JSON.stringify(data))
      } catch (e2) {
        debug.log(e2)
      }
    }
  }

  loadlist() {
    const needload = this.state.need_load
    if (needload) {
      try {
        const savedpath = join(window.APPDATA_PATH, 'achieve', 'achieve.json')
        const data = readJsonSync(savedpath)
        data.need_load = false
        let zclearts = data.zclearts;
        if(new Date(zclearts).getDate()==1&&new Date(zclearts).getHours()<6){
          data.zclearts=0
        }
        this.setState(data,() => {
          this.starttimer()
          /* create chart */
          if(!lineChart){
            debug.log('===== init chart =====')
            const ctx = document.getElementById("myChart")
            const backgroundColors = [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(153, 102, 255, 0.2)',
              'rgba(255, 159, 64, 0.2)',
            ]
            const borderColors = [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ]
            Chart.defaults.global.animation.duration = 0
            Chart.defaults.line.spanGaps = true;
            lineChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: [],
                datasets: [
                  {
                    label: '我的战果',
                    data: [],
                    backgroundColor: backgroundColors[0],
                    borderColor: borderColors[0],
                    borderWidth: 1,
                  },
                  {
                    label: '5位',
                    data: [],
                    backgroundColor: backgroundColors[1],
                    borderColor: borderColors[1],
                    borderWidth: 1,
                  },
                  {
                    label: '20位',
                    data: [],
                    backgroundColor: backgroundColors[2],
                    borderColor: borderColors[2],
                    borderWidth: 1,
                  },
                  {
                    label: '100位',
                    data: [],
                    backgroundColor: backgroundColors[3],
                    borderColor: borderColors[3],
                    borderWidth: 1,
                  },
                  {
                    label: '501位',
                    data: [],
                    backgroundColor: backgroundColors[4],
                    borderColor: borderColors[4],
                    borderWidth: 1,
                  },
                ],
              },
              options: {
                tooltips: {
                  mode: 'index',
                  intersect: false,
                },
                hover: {
                  mode: 'nearest',
                  intersect: true
                },
                scales: {
                  yAxes: [{
                    ticks: {
                      beginAtZero:true,
                    },
                  }],
                },
              },
            })
            if (typeof data.exphis !== 'undefined' &&
              typeof data.tmpexp !== 'undefined')
              drawChart(data.chartType, data.senkaType, lineChart, {
                r5his: data.r5his,
                r20his: data.r20his,
                r100his: data.r100his,
                r501his: data.r501his,
                myhis: data.myhis
              })
          }
        })
        return data
      } catch (e) {
        debug.log(e)
        return {}
      }
    } else {
      return this.state
    }
  }

  addExSenka(uexnow,uexthen){
    const hash={}
    for(var i=0;i<uexnow.length;i++){
      hash[uexnow[i]]=1
    }
    let r=0
    for(var i=0;i<uexthen.length;i++){
      const map=uexthen[i]
      if(!hash[map]){
        r=r+exvalue[map]
      }
    }
    return r
  }

  render() {
    try {
      return this.render_D()
    } catch (e) {
      debug.log(e)
      return (
        <div>
          <div>
            {e.message}
          </div>
          <div>
            {e.stack}
          </div>
        </div>
      )
    }
  }

  render_D() {
    const achieve = this.state

    const ranktime =new Date(achieve.ranktime?achieve.ranktime:0)
    const mysenka = achieve.mysenka?achieve.mysenka:0
    const exp = this.state.tmpexp
    const no = getRankDateNo(ranktime)

    const unclearedex = this.props.unclearedExList
    const exphis = this.state.exphis
    let upsenka
    const ensuresenka=achieve.fensuresenka
    const ensureexp = achieve.fensureexp
    const ensureuex = achieve.fensureuex
    if(ensuresenka>0&&ensureexp>0){
      upsenka = (exp-ensureexp)/50000*35+ensuresenka-mysenka+this.addExSenka(unclearedex,ensureuex)
      if(new Date(this.state.zclearts).getTime()>new Date(this.state.fensurets).getTime()){
        upsenka = upsenka + 350
      }
    }else{
      upsenka = (exp - exphis[no])/50000*35 + this.addExSenka(unclearedex,this.state.rankuex)
      if(new Date(this.state.zclearts).getTime()>ranktime.getTime()){
        upsenka = upsenka + 350
      }
    }
    const ignoreex = this.state.ignoreex
    const maps = this.props.maps
    let senkaleft = this.state.targetsenka-mysenka-upsenka
    for(let i=0;i<unclearedex.length;i++){
      if(!ignoreex[unclearedex[i]]){
        senkaleft=senkaleft-exvalue[unclearedex[i]]
      }
    }
    const extraSenka=this.state.extraSenka
    if(extraSenka==0){
      senkaleft=senkaleft-350
    }
    const layouttype = (this.props.layout=='vertical') && (this.props.doubleTabbed==false)

    return (
      <div id="achievement" className="achievement">
        <link rel="stylesheet" href={join(__dirname, 'assets/achievement.css')}/>
        <Row>
          <SenkaInfo
            achieve={achieve}
            upsenka={upsenka}
            member_id={this.props.basic.api_member_id}
            lt={layouttype}
            backstate={
              (newstate) => {
                this.setState(newstate)
              }
            }
          >
          </SenkaInfo>
          <SenkaCalculator
            senkaleft={senkaleft}
            targetsenka={this.state.targetsenka}
            ignoreex={ignoreex}
            extraSenka={extraSenka}
            maps={maps}
            zclearts={this.state.zclearts}
            lt={layouttype}
            backstate={
              (newstate) => {
                this.setState(newstate)
              }
            }
          >
          </SenkaCalculator>
          <SenkaCalendar
            exphis={exphis}
            tmpexp={this.state.tmpexp}
            tmpno={this.state.tmpno}
            chartType={this.state.chartType}
            senkaType={this.state.senkaType}
            lineChart={lineChart}
            senkaLine={{
              r5his: this.state.r5his,
              r20his: this.state.r20his,
              r100his: this.state.r100his,
              r501his: this.state.r501his,
              myhis: this.state.myhis
            }}
            lt={layouttype}
            backstate={
              (newstate, callback) => {
                this.setState(newstate, callback)
              }
            }
          >
          </SenkaCalendar>
        </Row>
      </div>
    )
  }
})

const switchPluginPath = [
  '/kcsapi/api_req_ranking/mxltvkpyuklh',
]

export {
  switchPluginPath,
  pluginDidLoad,
  pluginWillUnload,
}
