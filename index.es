import React, {Component} from 'react'
import {connect} from 'react-redux'
import {createSelector} from 'reselect'

import {store} from 'views/create-store'

import {join} from 'path'
import { FormControl,FormGroup} from 'react-bootstrap'

import {extensionSelectorFactory} from 'views/utils/selectors'

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
      notify_list:{}
    }
  }

  componentDidMount = () => {
    console.log("cmount!");
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
    for(var p in allships){
      var ship = allships[p];
      var shipid = ship.api_ship_id;
      if(newshipid==shipid){
        return false;
      }
    }
    return true;
  }

  need_notify(newshipid,newshipname){
    if(this.if_new_ship(newshipid)){
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
    console.log(value);
    if(value=="请选择"){

    }else if(value == "船舱里没有的新船"){

    }else{
      var notify_list=this.state.notify_list;
      if(notify_list[value]==undefined){
        notify_list[value]=1;
        this.setState({notify_list:notify_list})
      }
    }

  }


  render(){
    const $ships = this.props.$ships;
    const allship = Object.keys($ships);
    const notifylist = this.state.notify_list;
    console.log(notifylist);
    const notifykeys = Object.keys(notifylist);
    return(
      <div>
        {notifykeys.map(function(notifykey){
          return(
            <div>{
              $ships[notifykey].api_name
            }</div>
          )
        })}
        <div>
          <FormControl style={{width:"200px",display:'inline','text-align':'center'}} componentClass="select"
                       onChange={this.handleFormChange.bind(this)}
          >
            <option value="请选择">请选择</option>
            <option value="船舱里没有的新船">船舱里没有的新船</option>
            {
              allship.map(function(shipid){
                var shipinfo = $ships[shipid];
                var shipname = shipinfo.api_name;
                return(
                  <option value={shipid}>{shipname}</option>
                )
              })
            }
          </FormControl>
        </div>
      </div>
    )
  }
});




























