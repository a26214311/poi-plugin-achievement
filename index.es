import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import {Row, Col, Checkbox, Panel, FormGroup, FormControl, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'


import {extensionSelectorFactory} from 'views/utils/selectors'
const fs = require('fs')
const zh = "阿八嚓哒妸发旮哈或讥咔垃麻拏噢妑七呥撒它拖脱穵夕丫帀坐".split('');


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
      achieve:{
        exphis:{}
      },
      exphis:{},
      lastmonth:-1,
      r1:0,
      r501:0,
      ranktime:0,
      r1time:0,
      r501time:0,
      r1last:0,
      r501last:0,
      r1lasttime:0,
      r501lasttime:0,
      mysenka:0,
      targetsenka:2400,
      ignoreex:{},
      need_load:true
    }
  }

  componentWillReceiveProps(nextProps) {
    var basic = nextProps.basic;
    var exp = basic.api_experience;
    var now = new Date();
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
      needupdate=true;
    }
    if(!exphistory[no]){
      exphistory[no]=exp;
      achieve.exphis=exphistory;
      needupdate=true;
    }
    if(needupdate){
      this.setState(achieve,()=>this.savelist());
    }
  }

  handleResponse = e => {
    const {path, body} = e.detail;
    if(path=="/kcsapi/api_req_ranking/mxltvkpyuklh"){
      var myname = this.props.basic.api_nickname;
      var myid = this.props.basic.api_member_id;
      var achieve = this.state;
      var page = body.api_disp_page;
      var list = body.api_list;
      var now = new Date();
      for(var i=0;i<list.length;i++){
        if(list[i].api_mtjmdcwtvhdr==myname){
          var no=list[i].api_mxltvkpyuklh;
          var key = list[i].api_wuhnhojjxmke;
          var senka = this.getRate(no,key,myid);
          achieve.mysenka=senka;
          achieve.myno=no;
          achieve.ranktime = now;
        }
      }
      if(page==1){
        var no=list[0].api_mxltvkpyuklh;
        var key = list[0].api_wuhnhojjxmke;
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
      }else{

      }
      this.setState(achieve,()=>this.savelist());
    }
  };

  getDateNo(now){
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

  savelist() {
    try {
      console.log(this.state);
      let data = this.loadlist();
      console.log("save");
      console.log(data);
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
        this.setState(data,() => {});
        return data;
      } catch (e) {
        console.log(e);
        return {};
      }
    } else {
      return this.state;
    }
  }


  getRate(rankNo, obfsRate, memberId) {
    const MAGIC_R_NUMS = [ 8931, 1201, 1156, 5061, 4569, 4732, 3779, 4568, 5695, 4619, 4912, 5669, 6586 ]
    const MAGIC_L_NUMS = [ 25, 92, 79, 52, 58, 36, 93, 92, 58, 82 ]
    const rate = obfsRate / MAGIC_R_NUMS[rankNo % 13] / MAGIC_L_NUMS[memberId % 10] - 73 - 18
    return rate > 0 ? rate : 0
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
    var value = e.target.value;
    var checked = e.target.checked;
    var ignoreex = this.state.ignoreex;
    ignoreex[value]=checked;
    this.setState({ignoreex:ignoreex});
  }

  render_D() {
    var achieve = this.state;
    var r1 = achieve.r1?achieve.r1:0;
    var r501 = achieve.r501?achieve.r501:0;

    var r1time = new Date(achieve.r1time?achieve.r1time:0);
    var r1no = this.getRankDateNo(r1time);
    var r1tsstr = ["更新时间: " + (Math.floor((parseInt(r1no))/2)+1) + "日", parseInt(r1no)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
    var r501time = new Date(achieve.r501time?achieve.r501time:0);
    var r501no = this.getRankDateNo(r501time);
    var r501tsstr = ["更新时间: " + (Math.floor((parseInt(r501no))/2)+1) + "日", parseInt(r1no)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];


    var ranktime =new Date(achieve.ranktime?achieve.ranktime:0);
    var mysenka = achieve.mysenka?achieve.mysenka:0;
    var myno=achieve.myno?achieve.myno:0;

    var exp = this.props.basic.api_experience;
    var no = this.getRankDateNo(ranktime);
    var mynostr = ["更新时间: " + (Math.floor((parseInt(no))/2)+1) + "日", parseInt(r1no)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
    var exphis = this.state.exphis;
    var hiskey = Object.keys(exphis);

    hiskey.sort(function (a,b) {return(parseInt(a)-parseInt(b))});
    var lastkey = hiskey[0];
    var ret = [];



    var expadd=[];
    hiskey.map(function(key){
      if(key!=hiskey[0]) {
        var tsstr = ["" + (Math.floor((parseInt(key)+1)/2)) + "日", parseInt(r1no)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
        var addsenka = (exphis[key] - exphis[lastkey])/50000*35;
        expadd[key]=addsenka;
        if(addsenka>0.1){
          ret.push(<div>{tsstr}:{addsenka.toFixed(1)}</div>);
        }
        lastkey = key;
      }
    });
    var upsenka = (exp - exphis[no])/50000*35;
    var exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"];
    var exvalue={"1-5":75,"1-6":75,"2-5":100,"3-5":150,"4-5":180,"5-5":200,"6-5":250};
    var maps = this.props.maps;
    var exret = [];
    var unclearedex = [];
    exlist.map(function(mapidstr,index){
      var mapid = mapidstr.split("-").join('');
      if(maps[mapid]){
        if(maps[mapid].api_cleared==1){
          exret.push(<div>{mapidstr}:已完成</div>);
        }else{
          unclearedex.push(mapidstr);
          exret.push(<div>{mapidstr}:未完成</div>);
        }
      }else{
        unclearedex.push(mapidstr);
        exret.push(<div>{mapidstr}:未完成</div>);
      }
    });
    var ignoreex = this.state.ignoreex;
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth();
    var dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
    var daysleft = dayofMonth[month]-day;
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
          weeks.push(<td><div>{day}</div><div>{
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
            <Panel header="战果信息" className="info senka-info">
              <Table striped bordered condensed hover>
                <thead>
                <tr>
                  <th>顺位</th>
                  <th>战果</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td>1位</td>
                  <td className="pob">
                    <OverlayTrigger placement="bottom" overlay={
                      <Tooltip>
                        <div>战果增加： {(r1-this.state.r1last).toFixed(0)}<FontAwesome name="arrow-up"/></div>
                        <div>{"上次更新: " + (Math.floor((parseInt(this.state.r1lasttime))/2)+1) + "日"}
                          {(parseInt(this.state.r1lasttime)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
                        </div>
                      </Tooltip>
                    }>
                      <div>{r1.toFixed(0)}</div>
                    </OverlayTrigger>
                    <div className="day pos bg-primary">{r1tsstr}</div></td>
                </tr>
                <tr>
                  <td>501位</td>
                  <td className="pob">
                    <OverlayTrigger placement="bottom" overlay={
                      <Tooltip>
                        <div>战果增加： {(r501-this.state.r501last).toFixed(0)}<FontAwesome name="arrow-up"/></div>
                        <div> {"上次更新: " + (Math.floor((parseInt(this.state.r501lasttime))/2)+1)+"日"}
                          {(parseInt(this.state.r501lasttime)%2==0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
                        </div>
                      </Tooltip>
                    }>
                      <div>{r501.toFixed(0)}</div>
                    </OverlayTrigger>
                    <div className="day pos bg-primary">{r501tsstr}</div></td>
                </tr>
                <tr>
                  <td>
                    <div>{myno}位</div>
                  </td>
                  <td className="pob">
                    <OverlayTrigger placement="bottom" overlay={
                      <Tooltip>
                        <div>预想战果增加： <FontAwesome name="arrow-up"/>{upsenka.toFixed(1)}</div>
                        <div>战果预测值： {(mysenka+upsenka).toFixed(1)}</div>
                      </Tooltip>
                    }>
                      <div>{mysenka.toFixed(0)}</div>
                    </OverlayTrigger>
                    <div className="day pos bg-primary">{mynostr}</div>
                  </td>
                </tr>
                </tbody>
              </Table>
            </Panel>
          </Col>
          <Col xs={6}>
            <Panel header="战果计算器" className="info senka-calc">
              <FormGroup bsClass="row">
                <Row>
                  <Col sm={6}>
                    目标战果
                  </Col>
                  <Col sm={6}>
                    <FormControl
                      value={this.state.targetsenka}
                      type="text"
                      placeholder="目标战果"
                      onChange={this.handleChangeTarget}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    剩余战果
                  </Col>
                  <Col sm={6}>
                    {senkaleft.toFixed(1)}
                  </Col>
                </Row>
              </FormGroup>
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


            </Panel>
          </Col>
          <Col xs={12}>
            <Panel header="预想要攻略的EX图">
              <div>
                不准备攻略的EX：
                {
                  unclearedex.map(exid =>
                    <Checkbox inline checked={ignoreex[exid]} value={exid} onChange={this.handleExChange}>
                      {exid}
                    </Checkbox>
                  )
                }
              </div>
            </Panel>
          </Col>
          <Col xs={12}>
            <Panel header="战果日历">
              <Table striped bordered condensed>
                <thead>
                  <tr><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td><td>六</td><td>日</td></tr>
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













