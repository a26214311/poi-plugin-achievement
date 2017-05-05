import React, {Component} from 'react'
import {Row, Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {getDateNo,dayofMonth,senkaOfDay} from './util'

export default class SenkaCallendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      senkaType: 'calendar'
    }
  }

  handleTypeChange = e => {
    e.preventDefault();
    e.stopPropagation();
    //TODO: change senka type
    this.setState({
      senkaType: e.currentTarget.value
    })
  };

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
        </div>
      )
    }
  }


  render_D(){
    var exphis = this.props.exphis;
    var expadd = senkaOfDay(exphis,this.props.tmpexp,this.props.tmpno);
    var callendar = this.generateCallendarFromExpadd(expadd);
    console.log(this.state.senkaType);
    return(
      <Col xs={12}>
        <Panel header={
          <ButtonGroup>
            <Button onClick={this.handleTypeChange} value="calendar" bsStyle={this.state.senkaType === 'calendar' ? 'info' : 'default'}>
              <FontAwesome name="calendar"/> 战果日历
            </Button>
            <Button onClick={this.handleTypeChange} value="chart" bsStyle={this.state.senkaType === 'chart' ? 'info' : 'default'}>
              <FontAwesome name="area-chart"/> 战果趋势
            </Button>
          </ButtonGroup>
        } className={'btn-panel-title ' + this.state.senkaType}>
          <Table striped bordered condensed>
            <thead>
            <tr><td>一</td><td>二</td><td>三</td><td>四</td><td>五</td>
              <td><font color={"red"}>六</font></td><td><font color={"red"}>日</font></td></tr>
            </thead>
            <tbody>
            {callendar}
            </tbody>
          </Table>
          <canvas id="myChart" width="400" height="400"></canvas>
        </Panel>
      </Col>
    )
  }
}

















