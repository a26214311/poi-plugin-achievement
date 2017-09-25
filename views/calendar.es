import React, {Component} from 'react'
import { Col, Panel, ButtonGroup, Button, Table } from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import { getDateNo, dayofMonth, senkaOfDay } from '../lib/util'

export const drawChart = (chartType, senkaType, chartBody, senkaLine) =>{
  if(senkaType=='calendar'){
    return
  }

  const day = new Date().getDate()
  let labels = [], mySenkaData = [], no5SenkaData = [], no20SenkaData = [], no100SenkaData = [], no501SenkaData = []
  for(let i = 1; i <= day; i++){
    labels.push(i)
  }
  const no5Senka = senkaLine.r5his, no20Senka = senkaLine.r20his, no100Senka = senkaLine.r100his, no501Senka = senkaLine.r501his, mySenka = senkaLine.myhis;
  labels.map(day => {
    //mySenkaData.push(((expadd[day * 2 - 1] ? expadd[day * 2 - 1] : 0) + (expadd[day * 2] ? expadd[day * 2] : 0)).toFixed(1))
    mySenkaData.push(mySenka[day * 2 - 1] ? mySenka[day * 2 - 1] : mySenka[day * 2 - 2] ? mySenka[day * 2 - 2] : (day === 1) ? 0 : NaN)
    no5SenkaData.push(no5Senka[day * 2 - 1] ? no5Senka[day * 2 - 1] : no5Senka[day * 2 - 2] ? no5Senka[day * 2 - 2] : (day === 1) ? 0 : NaN)
    no20SenkaData.push(no20Senka[day * 2 - 1] ? no20Senka[day * 2 - 1] : no20Senka[day * 2 - 2] ? no20Senka[day * 2 - 2] : (day === 1) ? 0 : NaN)
    no100SenkaData.push(no100Senka[day * 2 - 1] ? no100Senka[day * 2 - 1] : no100Senka[day * 2 - 2] ? no100Senka[day * 2 - 2] : (day === 1) ? 0 : NaN)
    no501SenkaData.push(no501Senka[day * 2 - 1] ? no501Senka[day * 2 - 1] : no501Senka[day * 2 - 2] ? no501Senka[day * 2 - 2] : (day === 1) ? 0 : NaN)
  })
  delete chartBody.options.scales.yAxes[0].ticks.max

  if(chartType === 'day'){
    [mySenkaData, no5SenkaData, no20SenkaData, no100SenkaData, no501SenkaData].map(data => {
      // data.reduce((cur, pre, idx, arr) => {
      //   arr[idx] = (parseFloat(pre) > parseFloat(cur) ? parseFloat(pre) - parseFloat(cur) : 0).toFixed(2)
      //   return pre ? pre : cur ? cur : 0;
      // })
      let count = 1, lastData = 0
      data.forEach((ele, idx, arr) => {
        if(isNaN(ele)){
          count ++
        } else {
          let saveData = arr[idx]
          arr[idx] = Math.round((ele - lastData) / count)
          count = 1
          lastData = saveData
        }
      })
    })
    chartBody.options.scales.yAxes[0].ticks.max = 200
  }

  chartBody.data.datasets[0].data = mySenkaData
  chartBody.data.datasets[1].data = no5SenkaData
  chartBody.data.datasets[2].data = no20SenkaData
  chartBody.data.datasets[3].data = no100SenkaData
  chartBody.data.datasets[4].data = no501SenkaData
  chartBody.data.labels = labels
  chartBody.update(0,true)
}


export default class SenkaCalendar extends Component {
  handleTypeChange = e => {
    e.preventDefault()
    e.stopPropagation()
    this.props.backstate({
      senkaType: e.currentTarget.value,
    }, ()=>{
      drawChart(this.props.chartType ,this.props.senkaType, this.props.lineChart, this.props.senkaLine)
    })
  };

  handleChartType = e => {
    e.preventDefault()
    e.stopPropagation()
    const type = this.props.chartType === 'mon' ? 'day' : 'mon'
    switch(this.props.chartType){
    case 'mon':
      drawChart('day',this.props.senkaType, this.props.lineChart, this.props.senkaLine)
      break
    case 'day':
      drawChart('mon',this.props.senkaType, this.props.lineChart, this.props.senkaLine)
      break
    }
    this.props.backstate({
      chartType: type,
    })
  };

  generateCalendarFromExpadd(expadd){
    const firstday = new Date()
    const month = firstday.getMonth()
    firstday.setDate(1)
    const firstdayofWeek = firstday.getDay()
    const calendar = []
    const frontblanknum=(6+firstdayofWeek)%7
    const days = dayofMonth[month]
    const lines = Math.ceil((days+frontblanknum)/7)
    for(let i=0;i<lines;i++){
      const weeks = []
      for(let j=1;j<=7;j++){
        const day = i*7+j-frontblanknum
        if(day<1){
          weeks.push(<td><div></div><div></div></td>)
        }else if(day>days){
          weeks.push(<td><div></div><div></div></td>)
        }else{
          const expmorning = expadd[day*2-1]?expadd[day*2-1]:0
          const expafternoon = expadd[day*2]?expadd[day*2]:0
          const totalexp = expmorning+expafternoon
          weeks.push(<td><div><font size={"4"}>{day}</font></div><div>{
            totalexp>0.1?totalexp.toFixed(1):'--'
          }</div></td>)
        }
      }
      calendar.push(<tr>{weeks}</tr>)
    }
    return calendar
  }



  render() {
    try {
      return this.render_D()
    } catch (e) {
      console.log(e)
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
    const exphis = this.props.exphis
    const expadd = senkaOfDay(exphis,this.props.tmpexp,this.props.tmpno)
    const calendar = this.generateCalendarFromExpadd(expadd)
    return(
      <Col xs={this.props.lt?6:12}>
        <Panel header={
          <ButtonGroup>
            <Button onClick={this.handleTypeChange} value="calendar" bsStyle={this.props.senkaType === 'calendar' ? 'info' : 'default'}>
              <FontAwesome name="calendar"/> 战果日历
            </Button>
            <Button onClick={this.handleTypeChange} value="chart" bsStyle={this.props.senkaType === 'chart' ? 'info' : 'default'}>
              <FontAwesome name="area-chart"/> 战果趋势
            </Button>
          </ButtonGroup>
        } className={'btn-panel-title ' + this.props.senkaType}>
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

















