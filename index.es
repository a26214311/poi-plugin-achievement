import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import { FormGroup, FormControl, Button, Row, Col } from 'react-bootstrap'


import {extensionSelectorFactory} from 'views/utils/selectors'
const fs = require('fs')
export const reactClass = connect(
  state => ({
    horizontal: state.config.poi.layout || 'horizontal',
    $ships: state.const.$ships,
    ships: state.info.ships,
    $shipTypes: state.const.$shipTypes
  }),
  null, null, {pure: false}
)(class PluginNotify extends Component {

  constructor(props) {
    super(props)
    this.state = {
      test:"testinfo",
      need_notify:"",
      notify_list:{n:1},
      need_load:true
    }
  }

  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse)
  }

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  }

  handleResponse = e => {
    const { path, body } = e.detail;
    if(path == "/kcsapi/api_port/port"){
      var neednotify = this.state.need_notify;
      if(neednotify!=""){
        window.toggleModal('锁船提醒', neednotify+':快给老娘上锁！');
        this.setState({need_notify:""});
      }
    }
    if(path == "/kcsapi/api_req_sortie/battleresult"){
      var getship = body.api_get_ship;
      if(getship){
        var getshipid = getship.api_ship_id;
        var getshipname = getship.api_ship_name;
        this.need_notify(getshipid,getshipname);
      }
    }
  }

  if_new_ship(newshipid){
    var allships = this.props.ships;
    var $ships = this.props.$ships;
    var shipidlist = {};
    var x = newshipid;
    shipidlist[x]=1;
    while($ships[x].api_aftershipid!="0"){
      var aftershipid = $ships[x].api_aftershipid;
      shipidlist[aftershipid]=1;
      x=parseInt($ships[x].api_aftershipid);
    }
    for(var p in allships){
      var ship = allships[p];
      var shipid = ship.api_ship_id;
      if(shipidlist[shipid]){
        return false;
      }
    }
    return true;
  }

  need_notify(newshipid,newshipname){
    var notifylist = this.state.notify_list;
    if(notifylist.n){
      if(this.if_new_ship(newshipid)){
        var neednotify = this.state.need_notify;
        if(neednotify==""){
          this.setState({need_notify:newshipname});
        }else{
          this.setState({need_notify:neednotify+"&"+newshipname});
        }
        return;
      }
    }
    if(notifylist[newshipid]){
      var neednotify = this.state.need_notify;
      if(neednotify==""){
        this.setState({need_notify:newshipname});
      }else{
        this.setState({need_notify:neednotify+"&"+newshipname});
      }
    }

  }
  handleFormChange(e){
    var value = e.target.value;
    if(value=="请选择"){

    }else if(value == "船舱里没有的新船"){
      var notify_list=this.state.notify_list;
      if(notify_list.n==undefined){
        notify_list.n=1;
        this.setState({notify_list:notify_list})
      }
    }else{
      var notify_list=this.state.notify_list;
      if(notify_list[value]==undefined){
        notify_list[value]=1;
        this.setState({notify_list:notify_list})
      }
    }
  }

  removenotify(shipid){
    var notify_list=this.state.notify_list;
    if(shipid=="n"){
      if(notify_list.n){
        delete(notify_list["n"]);
        this.setState({notify_list:notify_list})
      }
    }else{
      if(notify_list[shipid]){
        delete(notify_list[shipid]);
        this.setState({notify_list:notify_list})
      }
    }
  }

  savelist(){
    try{
      var notifylist = this.state.notify_list;
      var savepath = join(window.APPDATA_PATH, 'notify_config','notify_config.json');
      fs.writeFileSync(savepath, JSON.stringify(notifylist));
      window.success("保存列表成功");
    }catch(e){
      fs.mkdir(join(window.APPDATA_PATH, 'notify_config'));
      try{
        var notifylist = this.state.notify_list;
        var savepath = join(window.APPDATA_PATH, 'notify_config','notify_config.json');
        fs.writeFileSync(savepath, JSON.stringify(notifylist));
        window.success("保存列表成功");
      }catch(e2){
        window.success("保存列表失败");
        console.log(e2);
      }
    }
  }

  loadlist(){
    var needload = this.state.need_load;
    if(needload){
      try{
        var savedpath = join(window.APPDATA_PATH, 'notify_config','notify_config.json');
        var datastr = fs.readFileSync(savedpath,'utf-8');
        var notifylist = eval("(" + datastr + ")");
        this.setState({notify_list:notifylist,need_load:false});
        return notifylist;
      }catch(e){
        console.log(e);
        this.setState({notify_list:{n:1},need_load:false});
        return {n:1};
      }
    }else{
      return this.state.notify_list;
    }
  }

  simplfyship(){
    try{
      return this.simplfyship_D();
    }catch(e){
      console.log(e);
      try{
        return Object.keys(this.props.$ships);
      }catch(e2){
        console.log(e2);
        return [];
      }
    }

  }

  simplfyship_D(){
    var $ships = this.props.$ships;
    for(var p in $ships){
      var ship = $ships[p];
      var afterlv = ship.api_afterlv;
      var aftershipid = ship.api_aftershipid;
      if(afterlv&&aftershipid){
        var aftership = $ships[aftershipid];
        var aftership_beforeshipid = aftership.before_shipid;
        var aftership_beforeshiplv = aftership.before_shiplv;
        if(aftership_beforeshipid){
          if(afterlv<aftership_beforeshiplv){
            aftership.before_shipid=p;
            aftership.before_shiplv=afterlv;
          }
        }else{
          aftership.before_shipid=p;
          aftership.before_shiplv=afterlv;
        }
      }
    }
    var list = [];
    for(var p in $ships){
      var ship = $ships[p];
      var afterlv = ship.api_afterlv;
      var aftershipid = ship.api_aftershipid;
      if(afterlv&&aftershipid){
        if(ship.before_shipid==undefined){
          list.push(p);
        }
      }
    }
    list.sort(function(a,b){return $ships[a].api_stype-$ships[b].api_stype});
    return list;
  }

  render(){
    const $ships = this.props.$ships;
    const allship = this.simplfyship();
    const notifylist = this.loadlist();
    const notifykeys = Object.keys(notifylist);
    try{
      notifykeys.sort(function(a,b){
        if(a=="n"){return -999};
        if(b=="n"){return 999};
        return $ships[a].api_stype-$ships[b].api_stype
      })
    }catch(e){
      console.log(e);
    }
    const $shipTypes = this.props.$shipTypes;
    return(
      <div id="notify" className="notify">
        <link rel="stylesheet" href={join(__dirname, 'notify.css')}/>
        <Row className="top-control">
          <Col xs={8}>
            <FormControl style={{width:"200px",display:'inline','text-align':'center'}} componentClass="select" onChange={this.handleFormChange.bind(this)}>
              <option value="请选择">请选择</option>
              <option value="船舱里没有的新船">船舱里没有的新船</option>
              {
                allship.map(function(shipid){
                  var shipinfo = $ships[shipid];
                  if(shipinfo){
                    var shipname = shipinfo.api_name;
                    var shiptypeid = shipinfo.api_stype;
                    var shiptypename = $shipTypes[shiptypeid].api_name;
                    return(
                      <option value={shipid}>{shiptypename}:{shipname}</option>
                    )
                  }
                })
              }
            </FormControl>
          </Col>
          <Col xs={4}>
            <Button onClick={this.savelist.bind(this)}>保存列表</Button>
          </Col>
        </Row>
        <Row>
          {notifykeys.map(function(notifykey){
            if(notifykey=="n"){
              return(
                <Col xs={6}>
                  <div className="ship-item">
                  <span className="ship-name">
                    船舱里没有的新船
                  </span>
                    <span onClick={() => {this.removenotify("n")}} className="close-btn"> </span>
                  </div>
                </Col>
              )
            }
            return(
              <Col xs={3} sm={2} md={1}>
                <div className="ship-item">
                  <span className="ship-name">
                    {$ships[notifykey].api_name}
                  </span>
                  <span onClick={() => {this.removenotify(notifykey)}} className="close-btn"> </span>
                </div>
              </Col>
            )
          }.bind(this))}
        </Row>
      </div>
    )
  }
});




























