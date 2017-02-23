import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import { FormGroup, FormControl, ListGroup, ListGroupItem, Button, Row, Col } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'


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
      notify_list:{newShip: true},
      newestshipid:0,
      need_load:true,
      ship_targets: this.simplfyship(),
      show_shipList: false,
      input_shipList: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    var oldnewestshipid = this.state.newestshipid;
    console.log(oldnewestshipid,nextProps);
    if(oldnewestshipid==0){
      var newestshipid = this.get_newest_shipid(nextProps);
      this.setState({newestshipid:newestshipid});
    }else{
      this.get_newest_ship(nextProps)
    }
  }

  get_newest_ship(nextProps){
    try{
      this.get_newest_ship_D(nextProps);
    }catch (e){
      console.log(e);
    }
  }

  get_newest_shipid(nextProps){
    try{
      var ships = nextProps.ships;
      var newestid=0;
      for(var p in ships){
        if(parseInt(p)>newestid){
          newestid = p;
        }
      }
      return newestid;
    }catch(e){
      console.log(e);
      return -1;
    }
  }

  get_newest_ship_D(nextProps){
    var newestid=this.get_newest_shipid(nextProps);
    var oldnewestshipid = this.state.newestshipid;
    var ships = nextProps.ships;
    if(newestid>oldnewestshipid){
      var newestship = ships[newestid];
      var newestapiid = newestship.api_ship_id;
      var $ships = this.props.$ships;
      var newestname = $ships[newestapiid].api_name;
      this.need_notify(newestapiid,newestname,newestid);
    }
  }






  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);
    this.loadlist();
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
  }

  if_new_ship(newshipid){
    var allships = this.props.ships;
    var $ships = this.props.$ships;
    var shipidlist = {};
    var x = newshipid;
    shipidlist[x]=1;
    var c = 0;
    while($ships[x].api_aftershipid!="0"){
      var aftershipid = $ships[x].api_aftershipid;
      if(shipidlist[aftershipid]==undefined){
        shipidlist[aftershipid]=1;
        x=parseInt($ships[x].api_aftershipid);
      }else{
        break;
      }
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

  need_notify(newshipid,newshipname,newestid){
    var newstate = {};
    var notifylist = this.state.notify_list;
    if(notifylist.newShip){
      if(this.if_new_ship(newshipid)){
        var neednotify = this.state.need_notify;
        if(neednotify==""){
          newstate.need_notify = newshipname;
        }else{
          newstate.need_notify = neednotify+"&"+newshipname;
        }
      }
    }
    if(notifylist[newshipid]){
      var neednotify = this.state.need_notify;
      if(neednotify==""){
        newstate.need_notify = newshipname;
      }else{
        newstate.need_notify = neednotify+"&"+newshipname;
      }
    }
    newstate.newestshipid=newestid;
    this.setState(newstate);
  }
  handleFormChange(e){
    var value = e.target.value;
    var notify_list=this.state.notify_list;
    if(notify_list[value]==undefined){
      notify_list[value]=1;
      this.savelist();
      this.setState({notify_list:notify_list})
    }
  }

  removenotify(shipid){
    var notify_list=this.state.notify_list;
    if(notify_list[shipid]){
      delete(notify_list[shipid]);
      this.savelist();
      this.setState({notify_list:notify_list})
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
        if(notifylist.n){
          delete(notifylist.n);
          notifylist.newShip=true;
        }
        this.setState({notify_list:notifylist,need_load:false});
        return notifylist;
      }catch(e){
        console.log(e);
        this.setState({notify_list:{newShip :true},need_load:false});
        return {newShip :true};
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
    list.sort(function(a,b){return 8*($ships[a].api_stype-$ships[b].api_stype)+$ships[a].api_name.localeCompare($ships[b].api_name)});
    return list;
  }

  hiddenShipList(e){
    e.preventDefault();
    e.stopPropagation();
    this.setState({show_shipList: false});
  }

  showShipList(e){
    e.preventDefault();
    e.stopPropagation();
    this.setState({show_shipList: true, input_shipList: ''}, this.changeHandler(e, true));
  }

  changeHandler(e){
    e.preventDefault();
    e.stopPropagation();
    let allship = [], $ship = this.props.$ships, expStr = e.target.value;
    if(arguments.length == 2 && arguments[1]){
      expStr = ''
    }
    this.simplfyship().map((id) => {
      if(new RegExp(expStr, 'i').test($ship[id].api_name))
        allship.push(id);
    });
    this.setState({ship_targets: allship, input_shipList: e.target.value})
  }

  selectShip(e){
    e.stopPropagation();
    let $ships = this.props.$ships, option = e.target.value;
    console.log(e.target);
    if(option != 0){
      this.setState({input_shipList: $ships[option].api_name});
    }
    this.handleFormChange(e);
  }

  handleNewShip(e){
    let nl = this.state.notify_list;
    if(nl.newShip != 'undefined'){
      nl.newShip = !nl.newShip;
    }else{
      nl.newShip = true
    }
    this.savelist();
    this.setState({notify_list: nl})
  }

  render(){
    const { $ships, horizontal } = this.props;
    const colSm = (horizontal == 'horizontal') ? 3 : 2,
      colMd = (horizontal == 'horizontal') ? 3 : 1;
    const allship = this.simplfyship();
    const notifylist = this.state.notify_list;
    const notifykeys = Object.keys(notifylist);
    try{
      notifykeys.sort(function(a,b){
        if(a=="newShip"){return -999};
        if(b=="newShip"){return 999};
        return $ships[a].api_stype-$ships[b].api_stype
      })
    }catch(e){
      console.log(e);
    }
    const $shipTypes = this.props.$shipTypes;

    const createList = (arr) => {
      let out = [];
      arr.map((option) => {
        const shipinfo = $ships[option],
          shipname = shipinfo.api_name,
          shiptypeid = shipinfo.api_stype,
          shiptypename = $shipTypes[shiptypeid].api_name;
        out.push(
          <li onMouseDown={this.selectShip.bind(this)} value={option}>
            {shiptypename + ' : ' + shipname}
          </li>
        )
      });
      return out;
    };

    return(
      <div id="notify" className="notify">
        <link rel="stylesheet" href={join(__dirname, 'notify.css')}/>
        <Row>
          <Col xs={12}>
            <form className="input-select">
              <FormGroup>
                <FormControl type="text" placeholder="选择或输入要提醒的舰船" ref="shipInput" value={this.state.input_shipList} onChange={this.changeHandler.bind(this)} onFocus={this.showShipList.bind(this)} onBlur={this.hiddenShipList.bind(this)}/>
              </FormGroup>
              <ul className="ship-list" style={{display: this.state.show_shipList ? 'block' : 'none'}}>
                {createList(this.state.ship_targets)}
              </ul>
            </form>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button bsSize="small" onClick={this.handleNewShip.bind(this)} bsStyle={this.state.notify_list.newShip ? "success" : "danger"} style={{width: '100%'}}>
              <FontAwesome name={this.state.notify_list.newShip ? 'heart' : 'heartbeat'} />
              &nbsp;船舱里没有的新船
            </Button>
          </Col>
        </Row>
        <Row>
          {notifykeys.map(function(notifykey){
            if(notifykey != "newShip"){
              return(
                <Col xs={3} sm={colSm} md={colMd}>
                  <div className="ship-item">
                  <span className="ship-name">
                    {$ships[notifykey].api_name}
                  </span>
                    <span onClick={() => {this.removenotify(notifykey)}} className="close-btn"> </span>
                  </div>
                </Col>
              )
            }
          }.bind(this))}
        </Row>
      </div>
    )
  }
});




























