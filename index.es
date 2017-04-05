import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import {Row, Col, Checkbox, Panel, FormGroup, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'


import {extensionSelectorFactory} from 'views/utils/selectors'
const fs = require('fs')
const zh = "阿八嚓哒妸发旮哈或讥咔垃麻拏噢妑七呥撒它拖脱穵夕丫帀坐".split('');
const exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"];
const exvalue={"1-5":75,"1-6":75,"2-5":100,"3-5":150,"4-5":180,"5-5":200,"6-5":250};

const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

const MAGIC_R_NUMS = [ 8931, 1201, 1156, 5061, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6586 ]
//const MAGIC_L_NUMS = [ 25, 92, 79, 52, 58, 36, 93, 92, 58, 82 ]  // 2017.2.28-2017.3.17
const MAGIC_L_NUMS = [ 63, 30, 70, 83, 95, 52, 45, 88, 92, 83 ]     // 2017.3.17-2017.?
//    const MAGIC_L_NUMS = [ 63, 30, 79, 52, 58, 36, 45, 88, 92, 82 ]  // 0 1 6 7 8 is correct

const ea = (max, min) => (max % min ? ea(min, max % min) : min);
const EAforArr = arr => arr.sort().reduce((pre, cur) => ea(cur, pre));


export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    basic:state.info.basic,
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

      mylastno:0,
      mylastranktime:0,

      mymagic:MAGIC_L_NUMS[this.props.basic?this.props.basic.api_member_id:0],
      tmpexp:0,
      tmpno:0,
      reviseType: 1, /* revise */

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
      fensureuex:exlist


    }
  }

  componentWillReceiveProps(nextProps){
    var basic = nextProps.basic;
    var exp = basic.api_experience;
    var now = new Date(new Date().getTime()+(new Date().getTimezoneOffset()+480)*60000);
    var month = now.getMonth();
    var no = this.getDateNo(now);
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
    if(exp>data.tmpexp){
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
    var oldmagic = this.state.mymagic;
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

  handleRevise = e => {
    e.preventDefault();
    e.stopPropagation();
    if(this.state.reviseType)
      this.setState({reviseType: 0});
    else
      this.setState({reviseType: 1});
  };


  handleResponse = e => {
    const {path, body} = e.detail;
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
          achieve.mylastranktime=this.getRankDateNo(achieve.ranktime);
          achieve.myno=no;
          var then = achieve.ranktime;
          if(this.getRankDateNo(now)>this.getRankDateNo(new Date(then))){
            achieve.rankuex = this.getUnclearedEx();
          }
          achieve.ranktime = now;
          var sub = now.getTime()-new Date(tensurets).getTime();
          var dateno = this.getRankDateNo(now);
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
        var r1timeno = this.getRankDateNo(new Date(r1time));
        achieve.r1=senka;
        achieve.r1time=now;
        var timeno = this.getRankDateNo(now);
        if(r1timeno!=timeno){
          achieve.r1last=r1last;
          achieve.r1lasttime=r1timeno;
        }
      }else if(page==51){
        var no=list[0].api_mxltvkpyuklh;
        var key = list[0].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = this.getRankDateNo(now);
        var r501last = achieve.r501;
        var r501time = achieve.r501time;
        var r501timeno = this.getRankDateNo(new Date(r501time));
        achieve.r501=senka;
        achieve.r501time=now;
        if(r501timeno!=timeno){
          achieve.r501last=r501last;
          achieve.r501lasttime=r501timeno;
        }
      }else if(page==1){
        var no=list[4].api_mxltvkpyuklh;
        var key = list[4].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = this.getRankDateNo(now);
        var r5last = achieve.r5;
        var r5time = achieve.r5time;
        var r5timeno = this.getRankDateNo(new Date(r5time));
        achieve.r5=senka;
        achieve.r5time=now;
        if(r5timeno!=timeno){
          achieve.r5last=r5last;
          achieve.r5lasttime=r5timeno;
        }
      }else if(page==2){
        var no=list[9].api_mxltvkpyuklh;
        var key = list[9].api_wuhnhojjxmke;
        var senka = this.getRate(no,key,myid);
        var timeno = this.getRankDateNo(now);
        var r20last = achieve.r20;
        var r20time = achieve.r20time;
        var r20timeno = this.getRankDateNo(new Date(r20time));
        achieve.r20=senka;
        achieve.r20time=now;
        if(r20timeno!=timeno){
          achieve.r20last=r20last;
          achieve.r20lasttime=r20timeno;
        }
      }else{

      }
      this.setState(achieve,()=>this.savelist());
    }
  }

  getDateNo(now){
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

  getRankDateNo(now){
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

  handleChangeTarget = e =>{
    var value = e.target.value;
    if(parseInt(value)>66666){
      value=66666;
    }
    if(parseInt(value)<0){
      value=0;
    }
    this.setState({targetsenka:value})
  }
  handleExChange = e =>{
    var value = e.currentTarget.value;
    var ignoreex = this.state.ignoreex;
    if(ignoreex[value] == 'undefined')
      ignoreex[value] = true;
    else
      ignoreex[value] = !ignoreex[value];
    this.setState({ignoreex:ignoreex});
  }




  generateRankHtml(order,rx,rxtime,rxlast,rxlasttime){
    rx=rx?rx:0;
    rxlast = rxlast?rxlast:0;
    rxtime = new Date(rxtime);
    var rxno = this.getRankDateNo(rxtime);
    var rxtsstr = ["更新时间: " + (Math.floor((parseInt(rxno))/2)+1) + "日", parseInt(rxno)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
    return(
      <tr>
        <td className="pob">
          <div>{order}位</div>
          <div className="pos bg-primary">{rxtsstr}</div>
        </td>
        <td className="pob">
          <OverlayTrigger placement="bottom" overlay={
            <Tooltip>
              <div>战果增加： <FontAwesome name="arrow-up"/>{(rx-rxlast).toFixed(0)}</div>
              <div>
                {"上次更新: " + (Math.floor((parseInt(rxlasttime))/2)+1) + "日"}
                {(parseInt(rxlasttime)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
              </div>
            </Tooltip>
          }>
            <div>{rx.toFixed(0)}<span className="senka-up">(<FontAwesome name="arrow-up"/>{(rx-rxlast).toFixed(0)})</span></div>
          </OverlayTrigger>
        </td>
      </tr>
    )
  }


  render_D() {
    var achieve = this.state;
    var r1 = achieve.r1?achieve.r1:0;
    var r501 = achieve.r501?achieve.r501:0;

    var r1time = new Date(achieve.r1time?achieve.r1time:0);
    var r501time = new Date(achieve.r501time?achieve.r501time:0);


    var ranktime =new Date(achieve.ranktime?achieve.ranktime:0);
    var mysenka = achieve.mysenka?achieve.mysenka:0;
    var myno=achieve.myno?achieve.myno:0;
    var exp = this.state.tmpexp;
    var no = this.getRankDateNo(ranktime);
    var mynostr = ["更新时间: " + (Math.floor((parseInt(no))/2)+1) + "日", parseInt(no)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
    var exphis = this.state.exphis;
    var now = new Date();
    var nowno = this.getDateNo(now);
    var hiskey = Object.keys(exphis);
    hiskey.sort(function (a,b) {return(parseInt(a)-parseInt(b))});
    var lastkey = hiskey[0];
    var unclearedex = this.getUnclearedEx();

    var expadd=[];
    hiskey.map(function(key){
      if(key!=hiskey[0]&&key<=nowno) {
          var addsenka = (exphis[key] - exphis[lastkey])/50000*35;
        if(exphis[lastkey]>0){
          expadd[key]=addsenka;
        }
          lastkey = key;
      }
    });
    if(!expadd[this.state.tmpno+1]){
      if(exphis[lastkey]>0) {
        var addsenka = (this.state.tmpexp - exphis[lastkey]) / 50000 * 35;
        expadd[this.state.tmpno + 1] = addsenka;
      }
    }
    var upsenka;

    var ensuresenka=achieve.fensuresenka;
    var ensureexp = achieve.fensureexp;
    var ensureuex = achieve.fensureuex;
    if(ensuresenka>0&&ensureexp>0){
      upsenka = (exp-ensureexp)/50000*35+ensuresenka-mysenka+this.addExSenka(unclearedex,ensureuex);
    }else{
      upsenka = (exp - exphis[no])/50000*35 + this.addExSenka(unclearedex,this.state.rankuex);
    }

    var ignoreex = this.state.ignoreex;
    let maps = this.props.maps;

    var day = now.getDate();
    var month = now.getMonth();


    var daysleft = dayofMonth[month] - day + 1;
    var senkaleft = this.state.targetsenka-mysenka-upsenka;
    for(var i=0;i<unclearedex.length;i++){
      if(!ignoreex[unclearedex[i]]){
        senkaleft=senkaleft-exvalue[unclearedex[i]];
      }
    }
    var firstday = new Date();
    firstday.setDate(1);
    var firstdayofWeek = firstday.getDay();
    var callendar = [];
    var frontblanknum=(6+firstdayofWeek)%7;
    var days = dayofMonth[month];
    var lines = Math.ceil((days+frontblanknum)/7);
    for(var i=0;i<lines;i++){
      var weeks = [];
      for(var j=1;j<=7;j++){
        var day = i*7+j-frontblanknum;
        if(day<1){
          weeks.push(<td><div></div><div></div></td>)
        }else if(day>days){
          weeks.push(<td><div></div><div></div></td>)
        }else{
          var expmorning = expadd[day*2-1]?expadd[day*2-1]:0;
          var expafternoon = expadd[day*2]?expadd[day*2]:0;
          var totalexp = expmorning+expafternoon;
          weeks.push(<td><div><font size={"4"}>{day}</font></div><div>{
            totalexp>0.1?totalexp.toFixed(1):'--'
          }</div></td>)
        }
      }
      callendar.push(<tr>{weeks}</tr>)
    }
    return (
      <div id="achievement" className="achievement">
        <link rel="stylesheet" href={join(__dirname, 'achievement.css')}/>
        <Row>
          <Col xs={6}>
            <Panel header={
            <span>
              <FontAwesome name="list-ol"/> 战果信息
                <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>
                    <p className="text-left">
                      {this.state.reviseType ?
                      <span>
                      当前战果系数为{this.state.mymagic>9?this.state.mymagic:MAGIC_L_NUMS[this.props.basic.api_member_id % 10]}<br/>
                      游戏更新后，战果榜单可能不准确<br/>
                      榜单不准确时，点击此按钮<br/>
                      进入游戏刷新战果榜的任意一页<br/>
                      则会自动校准战果系数<br/>
                      如果战果榜单依然不准，请再次点击此按钮<br/>
                      进入战果榜单的另外一页<br/>
                      如果多次校准后战果依然不准确<br/>
                      请等待插件更新
                      </span>
                      :
                      <span>
                      更新中<br/>
                      请刷新战果
                      </span>}
                    </p>
                  </Tooltip>
                }>
                  <FontAwesome name="refresh" className={this.state.reviseType? 'revise': 'revise active'} onClick={this.handleRevise}/>
                </OverlayTrigger>
            </span>
            } className="info senka-info">
              <Table striped bordered condensed hover>
                <thead>
                <tr>
                  <th className="senka-title">顺位</th>
                  <th>战果</th>
                </tr>
                </thead>
                <tbody>
                {this.generateRankHtml(5,achieve.r5,achieve.r5time,achieve.r5last,achieve.r5lasttime)}
                {this.generateRankHtml(20,achieve.r20,achieve.r20time,achieve.r20last,achieve.r20lasttime)}
                {this.generateRankHtml(100,r1,r1time,achieve.r1last,achieve.r1lasttime)}
                {this.generateRankHtml(501,r501,r501time,achieve.r501last,achieve.r501lasttime)}
                <tr>
                  <td className="pob">
                    <OverlayTrigger placement="bottom" overlay={
                      <Tooltip>
                        <div>
                          本次变化：{
                          (this.state.mylastno>this.state.myno?
                          <FontAwesome name="arrow-up"/>:<FontAwesome name="arrow-down"/>)}
                          {Math.abs(this.state.mylastno-this.state.myno)}
                        </div>
                        <div>上次排名： {this.state.mylastno}</div>
                        <div>
                          {"上次更新: " + (Math.floor((parseInt(this.state.mylastranktime))/2)+1) + "日"}
                          {(parseInt(this.state.mylastranktime)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
                        </div>
                      </Tooltip>
                    }>
                      <div>{myno}位</div>
                    </OverlayTrigger>
                    <div className="pos bg-primary">{mynostr}</div>
                  </td>
                  <td>
                    <OverlayTrigger placement="bottom" overlay={
                      <Tooltip>
                        <div>预想战果增加： <FontAwesome name="arrow-up"/>{upsenka.toFixed(1)}</div>
                        <div>战果预测值： {(mysenka+upsenka).toFixed(1)}</div>
                      </Tooltip>
                    }>
                      <div>
                        {mysenka.toFixed(0)}
                        <span className="senka-up">(<FontAwesome name="arrow-up"/>{upsenka.toFixed(1)})</span>
                      </div>
                    </OverlayTrigger>
                  </td>
                </tr>
                </tbody>
              </Table>
            </Panel>
          </Col>
          <Col xs={6}>
            <Panel header={
              <span>
                <FontAwesome name="calculator"/> 战果计算器
              </span>
            } className="info senka-calc">
              <div className="senka-ipt flex">
                <div>
                  目标战果
                </div>
                <div className="flex-auto">
                  <FormControl
                    value={this.state.targetsenka}
                    type="text"
                    placeholder="目标战果"
                    onChange={this.handleChangeTarget}
                  />
                </div>
              </div>
              <div className="senka-eq flex">
                <div>
                  剩余战果
                </div>
                <OverlayTrigger placement="top" overlay={
                  <Tooltip>
                    {(senkaleft/daysleft).toFixed(1)}/天
                  </Tooltip>
                }>
                <div className="flex-auto">
                  {senkaleft.toFixed(1)}
                </div>
                </OverlayTrigger>
              </div>
              <Table striped bordered condensed hover>
                <thead>
                <tr><td>MAP</td><td>次数</td><td>每天</td></tr>
                </thead>
                <tbody>
                <tr><td>5-4</td><td>{Math.ceil(senkaleft/2.282)}</td><td>{(senkaleft/daysleft/2.282).toFixed(1)}</td></tr>
                <tr><td>5-2</td><td>{Math.ceil(senkaleft/1.995)}</td><td>{(senkaleft/daysleft/1.995).toFixed(1)}</td></tr>
                <tr><td>1-5</td><td>{Math.ceil(senkaleft/0.8925)}</td><td>{(senkaleft/daysleft/0.8925).toFixed(1)}</td></tr>
                </tbody>
              </Table>
              <p>预想攻略的EX图</p>
              <OverlayTrigger placement="top" overlay={
                <Tooltip>
                  <p className="text-left"><Button bsStyle='success' bsSize="xsmall"><FontAwesome name="check"/></Button>：计划攻略</p>
                  <p className="text-left"><Button bsStyle='danger' bsSize="xsmall"><FontAwesome name="close"/></Button>：计划不攻略</p>
                  <p className="text-left"><Button bsStyle='info' bsSize="xsmall"><FontAwesome name="star"/></Button>：已完成</p>
                </Tooltip>
              }>
                <div>
                  <ButtonGroup bsSize="xsmall" className="justified-group">
                    {
                      exlist.map((exid, idx) =>{
                        if(idx < 4){
                          let mapId = exid.split('-').join('');
                          if(maps[mapId] && maps[mapId].api_cleared == 1){
                            return (
                              <Button bsStyle='info'>
                                <FontAwesome name="star"/>
                                {exid}
                              </Button>
                            )
                          } else {
                            return (
                              <Button bsStyle={ignoreex[exid] ? 'danger' : 'success'} value={exid} onClick={this.handleExChange}>
                                {ignoreex[exid] ? <FontAwesome name="close"/> : <FontAwesome name="check"/>}
                                {exid}
                              </Button>
                            )
                          }
                        }
                      })
                    }
                  </ButtonGroup>
                  <ButtonGroup bsSize="xsmall" className="justified-group">
                    {
                      exlist.map((exid, idx) =>{
                        if(idx >= 4){
                          let mapId = exid.split('-').join('');
                          if(maps[mapId] && maps[mapId].api_cleared == 1){
                            return (
                              <Button bsStyle='info'>
                                <FontAwesome name="star"/>
                                {exid}
                              </Button>
                            )
                          } else {
                            return (
                              <Button bsStyle={ignoreex[exid] ? 'danger' : 'success'} value={exid} onClick={this.handleExChange}>
                                {ignoreex[exid] ? <FontAwesome name="close"/> : <FontAwesome name="check"/>}
                                {exid}
                              </Button>
                            )
                          }
                        }
                      })
                    }
                  </ButtonGroup>
                </div>
              </OverlayTrigger>
            </Panel>
          </Col>
          <Col xs={12}>
            <Panel header={
              <span>
                <FontAwesome name="calendar"/> 战果日历
              </span>
            }>
              <Table striped bordered condensed>
                <thead>
                <tr><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td>
                  <td><font color={"red"}>六</font></td><td><font color={"red"}>日</font></td></tr>
                </thead>
                <tbody>
                {callendar}
                </tbody>
              </Table>
            </Panel>
          </Col>
        </Row>
      </div>
    )
  }
});













