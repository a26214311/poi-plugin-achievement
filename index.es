import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import {Row, Col, Checkbox, Panel, FormGroup, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

import {extensionSelectorFactory} from 'views/utils/selectors'

import SenkaCaculator from './views/caculator'
import SenkaCalendar from './views/calendar'
import SenkaInfo from './views/info'
import {drawChart} from './views/calendar.es'

import {EAforArr,getDateNo,getRankDateNo,
        fs,exlist,exvalue,dayofMonth,MAGIC_L_NUMS,MAGIC_R_NUMS} from './lib/util'


const Chart = require("./assets/Chart");

export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    basic:state.info.basic,
    $maps:state.const.$maps,
    maps:state.info.maps
  }),
  null, null, {pure: false}
)(class PluginAchievement extends Component {

  constructor(props) {
    super(props)
    this.state = {
      achieve: {
        exphis: {}
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


      mylastno:0,
      mylastranktime:0,

      mymagic:MAGIC_L_NUMS[this.props.basic?this.props.basic.api_member_id:0],
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
      chartType: 'mon'
    }
  }

  componentWillReceiveProps(nextProps){
    var basic = nextProps.basic;
    var exp = basic.api_experience;
    var now = new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
    var month = now.getMonth();
    var no = getDateNo(now);
    var achieve = {};
    var data = this.loadlist();
    var exphistory = data.exphis;
    var lastmonth = data.lastmonth;
    var needupdate=false;
    if(month!=lastmonth){
      exphistory={};
      achieve.exphis=exphistory;
      achieve.lastmonth=month;
      achieve.fensureexp=0;
      achieve.fensurets=0;
      achieve.fensuresenka=0;
      achieve.fensureuex=exlist;
      achieve.r1=0;
      achieve.r501=0;
      achieve.r5=0;
      achieve.r20=0;
      achieve.mysenka=0;
      achieve.rankuex=exlist;
      achieve.extraSenka=1;
      achieve.zclearts=0;
      needupdate=true;
    }
    if(!exphistory[no]){
      if(!exphistory[data.tmpno+1]){
        exphistory[data.tmpno+1]=data.tmpexp;
      }
      exphistory[no]=exp;
      achieve.exphis=exphistory;
      needupdate=true;
    }
    if(exp>data.tmpexp||exp<data.tmpexp-10000){
      if(now.getDate()==dayofMonth[month]){
        var Hour = now.getHours();
        if(Hour<21){
          achieve.tmpexp=exp;
          achieve.tmpno=no;
          needupdate=true;
        }
      }else{
        achieve.tmpexp=exp;
        achieve.tmpno=no;
        needupdate=true;
      }
      drawChart(exphistory,exp,no, data.chartType);
    }
    if(needupdate){
      this.setState(achieve,()=>this.savelist());
    }
  }

  starttimer(){
    var now = new Date();
    now = new Date(new Date(now).getTime()+(new Date().getTimezoneOffset()+480)*60000);
    var left = (43200000-(now.getTime()-18001000)%43200000);
    setTimeout(() =>{
      var exp = this.props.basic.api_experience;
      var nowtime = new Date();
      var unclearedex = this.getUnclearedEx();
      var achieve = {tensureexp:exp,tensurets:nowtime,tensureuex:unclearedex};
      this.setState(achieve,()=>{
        this.savelist();
        setTimeout(()=>{
          this.starttimer();
        },600000);
      });
    },left);
  }

  getRate(rankNo, obfsRate, memberId) {
    var mymagic = this.state.mymagic>9?this.state.mymagic:MAGIC_L_NUMS[memberId % 10];
    const rate = obfsRate / MAGIC_R_NUMS[rankNo % 13] / mymagic - 73 - 18
    return rate > 0 ? rate : 0
  }

  auto_magic(page,list){
    var larray = [];
    var fixR=false;
    for(var i=0;i<list.length;i++){
      var no=list[i].api_mxltvkpyuklh;
      var key = list[i].api_wuhnhojjxmke;
      var Rno = no % 13;
      if(key%MAGIC_R_NUMS[Rno]==0){//R magic is correct
        var lrate = key /  MAGIC_R_NUMS[Rno];
        larray.push(lrate);
      }else{
        fixR=true;
      }
    }
    var lsub=[];
    for(var i=1;i<larray.length;i++){
      var sub = larray[i-1] - larray[i];
      if(sub>0){
        lsub.push(sub);
      }
    }
    return EAforArr(lsub)
  }


  handleResponse = e => {
    const {path, body,postBody} = e.detail;

    /*for test only!

    if(path=="/kcsapi/api_req_quest/start"){
      this.setState({extraSenka:2,zclearts:new Date()});
    }
    if(path=="/kcsapi/api_req_quest/stop"){
      this.setState({extraSenka:1,zclearts:0});
    }

    */


    if(path=="/kcsapi/api_req_quest/clearitemget"){
      if(postBody.api_quest_id==854){
        this.setState({extraSenka:2,zclearts:new Date()});
      }
    }
    if(path=="/kcsapi/api_req_ranking/mxltvkpyuklh"){
      var myname = this.props.basic.api_nickname;
      var myid = this.props.basic.api_member_id;
      var achieve = this.state;
      var page = body.api_disp_page;
      var list = body.api_list;
      var now = new Date();
      var tensurets = achieve.tensurets;
      if(achieve.reviseType==0){
        var newmagic = this.auto_magic(page,list);
        achieve.mymagic=newmagic;
        achieve.reviseType=1;
        console.log("newmagic:"+newmagic);
      }
      for(var i=0;i<list.length;i++){
        if(list[i].api_mtjmdcwtvhdr==myname){
          var no=list[i].api_mxltvkpyuklh;
          var key = list[i].api_wuhnhojjxmke;
          var senka = this.getRate(no,key,myid);
          achieve.mysenka=senka;
          achieve.mylastno=achieve.myno;
          achieve.mylastranktime=getRankDateNo(achieve.ranktime);
          achieve.myno=no;
          var then = achieve.ranktime;
          if(getRankDateNo(now)>getRankDateNo(new Date(then))){
            achieve.rankuex = this.getUnclearedEx();
          }
          achieve.ranktime = now;
          var sub = now.getTime()-new Date(tensurets).getTime();
          var dateno = getRankDateNo(now);
          if(sub>3600000+30000&&sub<3600000*13-30000){
            achieve.fensuresenka=senka;
            achieve.fensurets=achieve.tensurets;
            achieve.fensureuex=achieve.tensureuex;
            achieve.fensureexp=achieve.tensureexp;
            achieve.exphis[dateno] = achieve.tensureexp;
          }else{
            var ensuresenka=achieve.fensuresenka;
            var ensureexp = achieve.fensureexp;
            var ensureuex = achieve.fensureuex;
            if(ensuresenka>0&&ensureexp>0){
              var thenexp = ensureexp;
              var thensenka = ensuresenka;
              var senkauex = this.getUnclearedEx();
              var addexsenka = this.addExSenka(senkauex,ensureuex);
              if(addexsenka==0){
                var senkaexp = thenexp + (senka-thensenka-addexsenka)*50000/35;
                achieve.exphis[dateno] = senkaexp;
              }
            }
          }
        }
      }
      if(page==10){
        var no=list[9].api_mxltvkpyuklh;
        var key = list[9].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var r1last = achieve.r1;
        var r1time = achieve.r1time;
        var r1timeno = getRankDateNo(new Date(r1time));
        achieve.r1=senka;
        achieve.r1time=now;
        var timeno = getRankDateNo(now);
        achieve.r100his[timeno]=senka;
        if(r1timeno!=timeno){
          achieve.r1last=r1last;
          achieve.r1lasttime=r1timeno;
        }
      }else if(page==51){
        var no=list[0].api_mxltvkpyuklh;
        var key = list[0].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = getRankDateNo(now);
        var r501last = achieve.r501;
        var r501time = achieve.r501time;
        var r501timeno = getRankDateNo(new Date(r501time));
        achieve.r501=senka;
        achieve.r501time=now;
        achieve.r501his[timeno]=senka;
        if(r501timeno!=timeno){
          achieve.r501last=r501last;
          achieve.r501lasttime=r501timeno;
        }
      }else if(page==1){
        var no=list[4].api_mxltvkpyuklh;
        var key = list[4].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = getRankDateNo(now);
        var r5last = achieve.r5;
        var r5time = achieve.r5time;
        var r5timeno = getRankDateNo(new Date(r5time));
        achieve.r5=senka;
        achieve.r5time=now;
        achieve.r5his[timeno]=senka;
        if(r5timeno!=timeno){
          achieve.r5last=r5last;
          achieve.r5lasttime=r5timeno;
        }
      }else if(page==2){
        var no=list[9].api_mxltvkpyuklh;
        var key = list[9].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = getRankDateNo(now);
        var r20last = achieve.r20;
        var r20time = achieve.r20time;
        var r20timeno = getRankDateNo(new Date(r20time));
        achieve.r20=senka;
        achieve.r20time=now;
        achieve.r20his[timeno]=senka;
        if(r20timeno!=timeno){
          achieve.r20last=r20last;
          achieve.r20lasttime=r20timeno;
        }
      }else{

      }
      this.setState(achieve,()=>this.savelist());
    }
  }

  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);
    this.loadlist();

  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  savelist(){
    try {
      let data = this.loadlist();
      let savepath = join(window.APPDATA_PATH, 'achieve', 'achieve.json');
      fs.writeFileSync(savepath, JSON.stringify(data));
    } catch (e) {
      fs.mkdir(join(window.APPDATA_PATH, 'achieve'));
      try {
        let data = this.loadlist();
        let savepath = join(window.APPDATA_PATH, 'achieve', 'achieve.json');
        fs.writeFileSync(savepath, JSON.stringify(data));
      } catch (e2) {
        console.log(e2);
      }
    }
  }

  loadlist() {
    let needload = this.state.need_load;
    if (needload) {
      try {
        let savedpath = join(window.APPDATA_PATH, 'achieve', 'achieve.json');
        let datastr = fs.readFileSync(savedpath, 'utf-8');
        let data = eval("(" + datastr + ")");
        data.need_load=false;
        this.setState(data,() => {
          this.starttimer();
          drawChart(data.exphis, data.tmpexp, data.tmpno, data.chartType);
        });
        return data;
      } catch (e) {
        console.log(e);
        return {};
      }
    } else {
      return this.state;
    }
  }

  getUnclearedEx(){
    var maps = this.props.maps;
    var unclearedex = [];
    exlist.map(function(mapidstr,index){
      var mapid = mapidstr.split("-").join('');
      if(maps[mapid]){
        if(maps[mapid].api_cleared==1){

        }else{
          unclearedex.push(mapidstr);
        }
      }else{
        unclearedex.push(mapidstr);
      }
    });
    return unclearedex;
  }

  addExSenka(uexnow,uexthen){
    var hash={};
    for(var i=0;i<uexnow.length;i++){
      hash[uexnow[i]]=1;
    }
    var r=0;
    for(var i=0;i<uexthen.length;i++){
      var map=uexthen[i];
      if(!hash[map]){
        r=r+exvalue[map];
      }
    }
    return r;
  }


  render() {
    try {
      return this.render_D();
    } catch (e) {
      console.log(e);
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
    var achieve = this.state;

    var ranktime =new Date(achieve.ranktime?achieve.ranktime:0);
    var mysenka = achieve.mysenka?achieve.mysenka:0;
    var exp = this.state.tmpexp;
    var no = getRankDateNo(ranktime);

    var unclearedex = this.getUnclearedEx();
    var exphis = this.state.exphis;
    var upsenka;
    var ensuresenka=achieve.fensuresenka;
    var ensureexp = achieve.fensureexp;
    var ensureuex = achieve.fensureuex;
    if(ensuresenka>0&&ensureexp>0){
      upsenka = (exp-ensureexp)/50000*35+ensuresenka-mysenka+this.addExSenka(unclearedex,ensureuex);
      if(new Date(this.state.zclearts).getTime()>new Date(this.state.fensurets).getTime()){
        upsenka = upsenka + 350;
      }
    }else{
      upsenka = (exp - exphis[no])/50000*35 + this.addExSenka(unclearedex,this.state.rankuex);
      if(new Date(this.state.zclearts).getTime()>ranktime.getTime()){
        upsenka = upsenka + 350;
      }
    }
    var ignoreex = this.state.ignoreex;
    let maps = this.props.maps;
    var senkaleft = this.state.targetsenka-mysenka-upsenka;
    for(var i=0;i<unclearedex.length;i++){
      if(!ignoreex[unclearedex[i]]){
        senkaleft=senkaleft-exvalue[unclearedex[i]];
      }
    }
    var extraSenka=this.state.extraSenka;
    if(extraSenka==0){
      senkaleft=senkaleft-350;
    }

    return (
      <div id="achievement" className="achievement">
        <link rel="stylesheet" href={join(__dirname, 'assets/achievement.css')}/>
        <Row>
          <SenkaInfo
            achieve={achieve}
            upsenka={upsenka}
            member_id={this.props.basic.api_member_id}
            backstate={
              (newstate) => {
                this.setState(newstate);
              }
            }
          >
          </SenkaInfo>
          <SenkaCaculator
            senkaleft={senkaleft}
            targetsenka={this.state.targetsenka}
            ignoreex={ignoreex}
            extraSenka={extraSenka}
            maps={maps}
            zclearts={this.state.zclearts}
            backstate={
              (newstate) => {
                this.setState(newstate);
              }
            }
          >
          </SenkaCaculator>
          <SenkaCalendar
            exphis={exphis}
            tmpexp={this.state.tmpexp}
            tmpno={this.state.tmpno}
            chartType={this.state.chartType}
            backstate={
              (newstate) => {
                this.setState(newstate);
              }
            }
          >
          </SenkaCalendar>
        </Row>
      </div>
    )
  }
});
