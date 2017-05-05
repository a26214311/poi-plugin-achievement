import React, {Component} from 'react'
import {Row, Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {getDateNo,dayofMonth,senkaOfDay} from '../lib/util'

export const drawChart = (exphis, tmpexp, tmpno, chartType) =>{
  let ctx = document.getElementById("myChart");
  const backgroundColors = [
    'rgba(255, 99, 132, 0.2)',
    'rgba(54, 162, 235, 0.2)',
    'rgba(255, 206, 86, 0.2)',
    'rgba(75, 192, 192, 0.2)',
    'rgba(153, 102, 255, 0.2)',
    'rgba(255, 159, 64, 0.2)'
  ];
  const borderColors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)'
  ];

  let expadd = senkaOfDay(exphis, tmpexp, tmpno);
  let day = new Date().getDate();
  let labels = [], mySenkaData = [];
  for(let i = 1; i <= day; i++){
    labels.push(i);
  }
  labels.map(day => {
    mySenkaData.push(((expadd[day * 2 - 1] ? expadd[day * 2 - 1] : 0) + (expadd[day * 2] ? expadd[day * 2] : 0)).toFixed(1))
  });
  if(chartType === 'mon'){
    mySenkaData.reduce((cur, pre, idx, arr) => arr[idx] = (parseFloat(cur) + parseFloat(pre)).toFixed(2))
  }

  console.log(JSON.stringify(mySenkaData));

  Chart.defaults.global.animation.duration = 0

  let myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: '我的战果',
        data: mySenkaData,
        backgroundColor: backgroundColors[0],
        borderColor: borderColors[0],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
};


export default class SenkaCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      senkaType: 'calendar',
    }
  }

  handleTypeChange = e => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      senkaType: e.currentTarget.value
    })
  };

  handleChartType = e => {
    e.preventDefault();
    e.stopPropagation();
    let type = this.props.chartType === 'mon' ? 'day' : 'mon';
    switch(this.props.chartType){
      case 'mon':
        drawChart(this.props.exphis, this.props.tmpexp, this.props.tmpno, 'day')
        break;
      case 'day':
        drawChart(this.props.exphis, this.props.tmpexp, this.props.tmpno, 'mon')
        break;
    }
    this.props.backstate({
      chartType: type
    })
  };

  generateCalendarFromExpadd(expadd){
    var firstday = new Date();
    var month = firstday.getMonth();
    firstday.setDate(1);
    var firstdayofWeek = firstday.getDay();
    var calendar = [];
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
      calendar.push(<tr>{weeks}</tr>)
    }
    return calendar;
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
    var calendar = this.generateCalendarFromExpadd(expadd);
    console.log(this.state.senkaType);
    console.log(this.props.chartType);
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
            {calendar}
            </tbody>
          </Table>
          <div className="chart-main">
            <Button onClick={this.handleChartType} bsStyle="primary" bsSize="xsmall" className="btn-block">
              {this.props.chartType === 'mon'? '按月显示' : '按日显示'}
            </Button>
            <canvas id="myChart" width="400" height="400"></canvas>
          </div>
        </Panel>
      </Col>
    )
  }
}

















