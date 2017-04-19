import React, {Component} from 'react'
import {Row, Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
import {getDateNo,getRankDateNo} from './util'


export default class SenkaCallendar extends Component {

  generateCallendarFromExpadd(expadd){
    var firstday = new Date();
    var month = firstday.getMonth();
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
    return callendar;
  }

  senkaOfDay = exphis => {
    let hiskey = Object.keys(exphis).sort((a, b) => parseInt(a) - parseInt(b));
    let lastkey = hiskey[0];
    let expadd=[];
    hiskey.map(key => {
      if(key != hiskey[0] && key <= getDateNo(new Date())) {
        let addsenka = (exphis[key] - exphis[lastkey]) / 50000 * 35;
        if(exphis[lastkey] > 0){
          expadd[key] = addsenka;
        }
        lastkey = key;
      }
    });

    if(!expadd[this.props.tmpno+1]){
      if(exphis[lastkey]>0) {
        var addsenka = (this.props.tmpexp - exphis[lastkey]) / 50000 * 35;
        expadd[this.props.tmpno + 1] = addsenka;
      }
    }

    return expadd;
  };


  render(){
    var exphis = this.props.exphis;
    var expadd = this.senkaOfDay(exphis);
    var callendar = this.generateCallendarFromExpadd(expadd);
    return(
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
    )
  }
}

















