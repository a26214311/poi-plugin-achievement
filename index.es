import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import {FormGroup, FormControl, ListGroup, ListGroupItem, Button, Row, Col} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'


import {extensionSelectorFactory} from 'views/utils/selectors'
const fs = require('fs')
const zh = "阿八嚓哒妸发旮哈或讥咔垃痳拏噢妑七呥撒它拖脱穵夕丫帀坐".split('');


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
      need_notify: "",
      notify_list: {newShip: true},
      newestshipid: 0,
      need_load: true,
      ship_targets: this.simplfyship(),
      show_shipList: false,
      input_shipList: ''
    }
  }

  componentWillReceiveProps(nextProps) {
    let oldnewestshipid = this.state.newestshipid;
    console.log(oldnewestshipid, nextProps);
    if (oldnewestshipid == 0) {
      let newestshipid = this.get_newest_shipid(nextProps);
      this.setState({newestshipid: newestshipid});
    } else {
      this.get_newest_ship(nextProps)
    }
  }

  get_newest_ship(nextProps) {
    try {
      this.get_newest_ship_D(nextProps);
    } catch (e) {
      console.log(e);
    }
  }

  get_newest_shipid(nextProps) {
    try {
      let ships = nextProps.ships;
      let newestid = 0;
      for (let p in ships) {
        if (parseInt(p) > newestid) {
          newestid = p;
        }
      }
      return newestid;
    } catch (e) {
      console.log(e);
      return -1;
    }
  }

  get_newest_ship_D(nextProps) {
    let newestid = this.get_newest_shipid(nextProps);
    let oldnewestshipid = this.state.newestshipid;
    let ships = nextProps.ships;
    if (newestid > oldnewestshipid) {
      let newestship = ships[newestid];
      let newestapiid = newestship.api_ship_id;
      let $ships = this.props.$ships;
      let newestname = $ships[newestapiid].api_name;
      this.need_notify(newestapiid, newestname, newestid);
    }
  }


  componentDidMount = () => {
    window.addEventListener('game.response', this.handleResponse);
    this.loadlist();
  };

  componentWillUnmount = () => {
    window.removeEventListener('game.response', this.handleResponse)
  };

  handleResponse = e => {
    const {path, body} = e.detail;
    if (path == "/kcsapi/api_port/port") {
      let neednotify = this.state.need_notify;
      if (neednotify != "") {
        window.toggleModal('锁船提醒', neednotify + ':快给老娘上锁！');
        window.toast(neednotify + ':快给老娘上锁！');
        this.setState({need_notify: ""});
      }
    }
  };

  if_new_ship(newshipid) {
    let allships = this.props.ships;
    let $ships = this.props.$ships;
    let shipidlist = {};
    let x = newshipid;
    shipidlist[x] = 1;
    let c = 0;
    while ($ships[x].api_aftershipid != "0") {
      let aftershipid = $ships[x].api_aftershipid;
      if (shipidlist[aftershipid] == undefined) {
        shipidlist[aftershipid] = 1;
        x = parseInt($ships[x].api_aftershipid);
      } else {
        break;
      }
    }
    for (let p in allships) {
      let ship = allships[p];
      let shipid = ship.api_ship_id;
      if (shipidlist[shipid]) {
        return false;
      }
    }
    return true;
  }

  need_notify(newshipid, newshipname, newestid) {
    let newstate = {};
    let notifylist = this.state.notify_list;
    if (notifylist.newShip) {
      if (this.if_new_ship(newshipid)) {
        let neednotify = this.state.need_notify;
        if (neednotify == "") {
          newstate.need_notify = newshipname;
        } else {
          newstate.need_notify = neednotify + "&" + newshipname;
        }
      }
    }
    if (notifylist[newshipid]) {
      let neednotify = this.state.need_notify;
      if (neednotify == "") {
        newstate.need_notify = newshipname;
      } else {
        newstate.need_notify = neednotify + "&" + newshipname;
      }
    }
    newstate.newestshipid = newestid;
    this.setState(newstate);
  }

  handleFormChange(e) {
    let value = e.currentTarget.value;
    let notify_list = this.state.notify_list;
    if (notify_list[value] == undefined) {
      notify_list[value] = 1;
      this.savelist();
      this.setState({notify_list: notify_list})
    }
  }

  removenotify(shipid) {
    let notify_list = this.state.notify_list;
    if (notify_list[shipid]) {
      delete(notify_list[shipid]);
      this.savelist();
      this.setState({notify_list: notify_list})
    }
  }

  savelist() {
    try {
      let notifylist = this.state.notify_list;
      let savepath = join(window.APPDATA_PATH, 'notify_config', 'notify_config.json');
      fs.writeFileSync(savepath, JSON.stringify(notifylist));
      window.success("保存列表成功");
    } catch (e) {
      fs.mkdir(join(window.APPDATA_PATH, 'notify_config'));
      try {
        let notifylist = this.state.notify_list;
        let savepath = join(window.APPDATA_PATH, 'notify_config', 'notify_config.json');
        fs.writeFileSync(savepath, JSON.stringify(notifylist));
        window.success("保存列表成功");
      } catch (e2) {
        window.success("保存列表失败");
        console.log(e2);
      }
    }
  }

  loadlist() {
    let needload = this.state.need_load;
    if (needload) {
      try {
        let savedpath = join(window.APPDATA_PATH, 'notify_config', 'notify_config.json');
        let datastr = fs.readFileSync(savedpath, 'utf-8');
        let notifylist = eval("(" + datastr + ")");
        if (notifylist.n) {
          delete(notifylist.n);
          notifylist.newShip = true;
        }
        this.setState({notify_list: notifylist, need_load: false});
        return notifylist;
      } catch (e) {
        console.log(e);
        this.setState({notify_list: {newShip: true}, need_load: false});
        return {newShip: true};
      }
    } else {
      return this.state.notify_list;
    }
  }

  simplfyship() {
    try {
      return this.simplfyship_D();
    } catch (e) {
      console.log(e);
      try {
        return Object.keys(this.props.$ships);
      } catch (e2) {
        console.log(e2);
        return [];
      }
    }

  }

  simplfyship_D() {
    let $ships = this.props.$ships;
    for (let p in $ships) {
      let ship = $ships[p];
      let afterlv = ship.api_afterlv;
      let aftershipid = ship.api_aftershipid;
      if (afterlv && aftershipid) {
        let aftership = $ships[aftershipid];
        let aftership_beforeshipid = aftership.before_shipid;
        let aftership_beforeshiplv = aftership.before_shiplv;
        if (aftership_beforeshipid) {
          if (afterlv < aftership_beforeshiplv) {
            aftership.before_shipid = p;
            aftership.before_shiplv = afterlv;
          }
        } else {
          aftership.before_shipid = p;
          aftership.before_shiplv = afterlv;
        }
      }
    }
    let list = [];
    for (let p in $ships) {
      let ship = $ships[p];
      let afterlv = ship.api_afterlv;
      let aftershipid = ship.api_aftershipid;
      if (afterlv && aftershipid) {
        if (ship.before_shipid == undefined) {
          list.push(p);
        }
      }
    }
    list.sort(function (a, b) {
      return 8 * ($ships[a].api_stype - $ships[b].api_stype) + $ships[a].api_name.localeCompare($ships[b].api_name)
    });
    return list;
  }

  hiddenShipList = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({show_shipList: false});
  };

  showShipList = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({show_shipList: true, input_shipList: ''}, this.changeHandler(e, true));
  };

  changeHandler = (e, ...other) => {
    e.preventDefault();
    e.stopPropagation();
    let allship = [], $ship = this.props.$ships, expStr = e.target.value;
    if (other.length == 1 && other[0]) {
      expStr = ''
    }
    let lowstr = expStr.toLowerCase();
    this.simplfyship().map((id) => {
      var shipname = $ship[id].api_name;
      if(lowstr>='a'&&lowstr<='z'){
        var match=true;
        for(var i=0;i<lowstr.length;i++){
          var x=lowstr.charCodeAt(i)-97;
          var cs=zh[x];
          var ce=zh[x+1];
          if(shipname.charAt(i).localeCompare(cs)>0&&shipname.charAt(i).localeCompare(ce)<0){

          }else{
            match=false;
            break;
          }
        }
        if(match){
          allship.push(id);
        }
      }
      if (new RegExp(expStr, 'i').test($ship[id].api_name))
        allship.push(id);
    });
    this.setState({ship_targets: allship, input_shipList: e.target.value})
  };

  selectShip = e => {
    e.stopPropagation();
    let $ships = this.props.$ships, option = e.currentTarget.value;
    if (option != 0) {
      this.setState({input_shipList: $ships[option].api_name});
    }
    this.handleFormChange(e);
  };

  handleNewShip = e => {
    e.preventDefault();
    e.stopPropagation();
    let nl = this.state.notify_list;
    if (nl.newShip != 'undefined') {
      nl.newShip = !nl.newShip;
    } else {
      nl.newShip = true
    }
    this.savelist();
    this.setState({notify_list: nl})
  };

  render() {
    try {
      return this.render_D();
    } catch (e) {
      console.log(e);
      return (
        <div>
          unknown error
        </div>
      )
    }
  }

  render_D() {
    const {$ships, horizontal} = this.props;
    const colSm = (horizontal == 'horizontal') ? 3 : 2,
      colMd = (horizontal == 'horizontal') ? 3 : 1;
    const notifylist = this.state.notify_list;
    const notifykeys = Object.keys(notifylist);
    try {
      notifykeys.sort(function (a, b) {
        if (a == "newShip") {
          return -999
        }
        if (b == "newShip") {
          return 999
        }
        return $ships[a].api_stype - $ships[b].api_stype
      })
    } catch (e) {
      console.log(e);
    }
    const $shipTypes = this.props.$shipTypes;

    const createList = arr => {
      let out = [];
      arr.map((option) => {
        const shipinfo = $ships[option],
          shipname = shipinfo.api_name,
          shiptypeid = shipinfo.api_stype,
          shiptypename = $shipTypes[shiptypeid].api_name;
        out.push(
          <li onMouseDown={this.selectShip} value={option}>
            <a>
              {shiptypename + ' : ' + shipname}
            </a>
          </li>
        )
      });
      return out;
    };

    return (
      <div id="notify" className="notify">
        <link rel="stylesheet" href={join(__dirname, 'notify.css')}/>
        <Row>
          <Col xs={12}>
            <form className="input-select">
              <FormGroup>
                <FormControl type="text" placeholder="选择或输入要提醒的舰船" ref="shipInput" value={this.state.input_shipList}
                             onChange={this.changeHandler} onFocus={this.showShipList}
                             onBlur={this.hiddenShipList}/>
              </FormGroup>
              <ul className="ship-list dropdown-menu" style={{display: this.state.show_shipList ? 'block' : 'none'}}>
                {createList(this.state.ship_targets)}
              </ul>
            </form>
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button bsSize="small" onClick={this.handleNewShip}
                    bsStyle={this.state.notify_list.newShip ? "success" : "danger"} style={{width: '100%'}}>
              <FontAwesome name={this.state.notify_list.newShip ? 'heart' : 'heartbeat'}/>
              &nbsp;船舱里没有的新船
            </Button>
          </Col>
        </Row>
        <Row>
          {notifykeys.map(function (notifykey) {
            if (notifykey != "newShip") {
              return (
                <Col xs={3} sm={colSm} md={colMd}>
                  <div className="ship-item btn-default">
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




























