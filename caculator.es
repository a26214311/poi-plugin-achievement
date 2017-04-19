import React, {Component} from 'react'
import {Row, Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'

const exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"];
const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

export default class SenkaCaculator extends Component {
  handleChangeTarget = e =>{
    var value = e.target.value;
    if(parseInt(value)>66666){
      value=66666;
    }
    if(parseInt(value)<0){
      value=0;
    }
    this.props.backstate({targetsenka:value});
  }

  handleExChange = e =>{
    var value = e.currentTarget.value;
    var ignoreex = this.props.ignoreex;
    if(ignoreex[value] == 'undefined')
      ignoreex[value] = true;
    else
      ignoreex[value] = !ignoreex[value];
    this.props.backstate({ignoreex:ignoreex});
  }


  handleExtraSenkaChange = e => {
    e.preventDefault();
    e.stopPropagation();
    if(!this.props.zclearts){
      let es = (this.props.extraSenka + 1) % 3;
      this.props.backstate({extraSenka:es});
    }
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
    var now = new Date();
    var day = now.getDate();
    var month = now.getMonth();
    var daysleft = dayofMonth[month] - day + 1;
    var maps = this.props.maps;
    var ignoreex = this.props.ignoreex;
    var senkaleft = this.props.senkaleft;
    var extraSenka = this.props.extraSenka;

    return(
      <Col xs={6}>
        <Panel header={
          <span>
            <FontAwesome name="calculator"/> 战果计算器
          </span>
        } className="info senka-calc">
          <div className="senka-ipt flex">
            <div>
              目标战果
            </div>
            <div className="flex-auto">
              <FormControl
                value={this.props.targetsenka}
                type="text"
                placeholder="目标战果"
                onChange={this.handleChangeTarget}
              />
            </div>
          </div>
          <div className="senka-eq flex">
            <div>
              剩余战果
            </div>
            <OverlayTrigger placement="top" overlay={
              <Tooltip>
                {(senkaleft/daysleft).toFixed(1)}/天
              </Tooltip>
            }>
              <div className="flex-auto">
                {senkaleft.toFixed(1)}
              </div>
            </OverlayTrigger>
          </div>
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
          <p className="short-line">预想攻略的EX图</p>
          <OverlayTrigger placement="top" overlay={
            <Tooltip>
              <p className="text-left"><Button bsStyle='success' bsSize="xsmall"><FontAwesome name="check"/></Button>：计划攻略</p>
              <p className="text-left"><Button bsStyle='danger' bsSize="xsmall"><FontAwesome name="close"/></Button>：计划不攻略</p>
              <p className="text-left"><Button bsStyle='info' bsSize="xsmall"><FontAwesome name="star"/></Button>：已完成</p>
            </Tooltip>
          }>
            <div>
              <ButtonGroup bsSize="xsmall" className="justified-group">
                {
                  exlist.map((exid, idx) =>{
                    if(idx < 4){
                      let mapId = exid.split('-').join('');
                      if(maps[mapId] && maps[mapId].api_cleared == 1){
                        return (
                          <Button bsStyle='info'>
                            <FontAwesome name="star"/>
                            {exid}
                          </Button>
                        )
                      } else {
                        return (
                          <Button bsStyle={ignoreex[exid] ? 'danger' : 'success'} value={exid} onClick={this.handleExChange}>
                            {ignoreex[exid] ? <FontAwesome name="close"/> : <FontAwesome name="check"/>}
                            {exid}
                          </Button>
                        )
                      }
                    }
                  })
                }
              </ButtonGroup>
              <ButtonGroup bsSize="xsmall" className="justified-group">
                {
                  exlist.map((exid, idx) =>{
                    if(idx >= 4){
                      let mapId = exid.split('-').join('');
                      if(maps[mapId] && maps[mapId].api_cleared == 1){
                        return (
                          <Button bsStyle='info'>
                            <FontAwesome name="star"/>
                            {exid}
                          </Button>
                        )
                      } else {
                        return (
                          <Button bsStyle={ignoreex[exid] ? 'danger' : 'success'} value={exid} onClick={this.handleExChange}>
                            {ignoreex[exid] ? <FontAwesome name="close"/> : <FontAwesome name="check"/>}
                            {exid}
                          </Button>
                        )
                      }
                    }
                  })
                }
              </ButtonGroup>
              <ButtonGroup bsSize="xsmall" className="justified-group">
                {
                  <Button bsStyle={
                    extraSenka == 0 ?
                      'success':
                      extraSenka == 1 ? 'danger' : 'info'
                  } onClick={this.handleExtraSenkaChange}>
                    {
                      extraSenka == 0 ?
                        <FontAwesome name="check"/>:
                        extraSenka == 1 ? <FontAwesome name="close"/> : <FontAwesome name="star"/>
                    }
                    {
                      extraSenka == 0 ?
                        '计划攻略Z作战':
                        extraSenka == 1 ? '计划不攻略Z作战' : '已攻略Z作战'
                    }
                  </Button>
                }
              </ButtonGroup>
            </div>
          </OverlayTrigger>
        </Panel>
      </Col>

    )
  }
}

















