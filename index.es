import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import {FormGroup, FormControl, ListGroup, ListGroupItem, Button, Row, Col} from 'react-bootstrap'
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
      mysenka:0,
      targetsenka:2400,
      need_load:true
    }
  }

  componentWillReceiveProps(nextProps) {

    var basic = this.props.basic;
    var exp = basic.api_experience;
    var now = new Date();
    var date = now.getDate();
    var hour = now.getHours();
    var month = now.getMonth();
    var no = (date-1)*2+((hour>13)?1:0);
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
      this.savelist();
      this.setState(achieve);
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
      for(var i=0;i<list.length;i++){
        if(list[i].api_mtjmdcwtvhdr==myname){
          var no=list[i].api_mxltvkpyuklh;
          var key = list[i].api_wuhnhojjxmke
          var senka = this.getRate(no,key,myid);
          achieve.mysenka=senka;
          achieve.myno=no;
        }
      }
      if(page==1){
        var no=list[0].api_mxltvkpyuklh;
        var key = list[0].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid);
        achieve.r1=senka;
      }else if(page==51){
        var no=list[0].api_mxltvkpyuklh;
        var key = list[0].api_wuhnhojjxmke
        var senka = this.getRate(no,key,myid);
        achieve.r501=senka;
      }else{

      }
      var now = new Date();
      achieve.ranktime = now;
      this.savelist();
      this.setState(achieve);
    }
  };


  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);

    this.loadlist();
  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  savelist() {
    try {
      console.log("save");
      let data = this.state;
      let savepath = join(window.APPDATA_PATH, 'achieve', 'achieve.json');
      fs.writeFileSync(savepath, JSON.stringify(data));
    } catch (e) {
      fs.mkdir(join(window.APPDATA_PATH, 'achieve'));
      try {
        let data = this.state;
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
        console.log("loadingstate");
        console.log(data);
        data.need_load=false;
        this.setState(data);
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
    const MAGIC_L_NUMS = [ 90, 85, 79, 42, 41, 56, 97, 90, 83, 88 ]
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
            unknown error
          </div>
        </div>
      )
    }
  }

  handleChangeTarget = e =>{
    console.log(e);
    var value = e.target.value;
    this.setState({targetsenka:value})
  }

  render_D() {
    var achieve = this.state;
    var r1 = achieve.r1?achieve.r1:0;
    var r501 = achieve.r501?achieve.r501:0;
    var ranktime =new Date(achieve.ranktime?achieve.ranktime:0);
    var mysenka = achieve.mysenka?achieve.mysenka:0;
    var myno=achieve.myno?achieve.myno:0;

    var exp = this.props.basic.api_experience;

    var date = ranktime.getDate();
    var hour = ranktime.getHours();
    var no = (date-1)*2+((hour>13)?1:0);

    var exphis = this.state.exphis;
    var hiskey = Object.keys(exphis);

    hiskey.sort(function (a,b) {return(parseInt(a)-parseInt(b))});
    var lastkey = hiskey[0];
    var ret = [];
    hiskey.map(function(key){
      if(key!=hiskey[0]) {
        var tsstr = (Math.floor(parseInt(key)/2)+1) + "日" + ((parseInt(key)%2==0)?"上午":"下午");
        var addsenka = (exphis[key] - exphis[lastkey])/50000*35;
        if(addsenka>0.1){
          ret.push(<div>{tsstr}:{addsenka.toFixed(1)}</div>);
        }
        lastkey = key;
      }
    });
    var upsenka = (exp - exphis[no])/50000*35;
    var exlist=[15,16,25,35,45,55,65];
    var maps = this.props.maps;
    var unfinishedex = [];
    return (
      <div>
        <div>
          <div>第1名：{r1.toFixed(1)}</div>
          <div>第501名：{r501.toFixed(1)}</div>
          <div>我的排名：{myno}</div>
          <div>我的战果：{mysenka.toFixed(1)}</div>
          <div>更新时间：{ranktime.toLocaleString()}</div>
          <div>上升预测：{(mysenka+upsenka).toFixed(1)}↑{upsenka.toFixed(1)}</div>
        </div>
        <div>
          本月战果记录：
          {ret}
        </div>
        <div>
          EX图完成情况：
          {
            exlist.map(function(mapid,index){
              return(
                <div>
                  {mapid}:{maps[mapid]?((maps[mapid].api_cleared==1)?'cleared':'unfinished'):'unfinished'}
                </div>
              )
            })
          }
        </div>
        <div>
          <div>计算器：</div>
          <div>目标战果：
            <FormControl style={{width:'200px'}} value={this.state.targetsenka} type="text" placeholder="target senka" onChange={this.handleChangeTarget}></FormControl>
          </div>
          <div>剩余战果：{(this.state.targetsenka-mysenka-upsenka).toFixed(1)}</div>
          <div>5-4：{Math.ceil((this.state.targetsenka-mysenka-upsenka)/2.05)}次</div>
          <div>5-2：{Math.ceil((this.state.targetsenka-mysenka-upsenka)/1.85)}次</div>
          <div>2-3：{Math.ceil((this.state.targetsenka-mysenka-upsenka)/1.55)}次</div>
        </div>
        <div>
          <br></br>
        </div>
      </div>
    )
  }
});













