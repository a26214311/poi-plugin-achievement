import React, {Component} from 'react'
import _ from 'lodash'
import {Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {exlist,dayofMonth} from '../lib/util'
import { debug } from '../debug'


export default class SenkaCalculator extends Component {
  handleChangeTarget = e =>{
    let value = e.target.value
    if(parseInt(value)>66666){
      value=66666
    }
    if(parseInt(value)<0){
      value=0
    }
    this.props.backstate({targetsenka:value})
  }

  handleExChange = e =>{
    const value = e.currentTarget.value
    const ignoreex = this.props.ignoreex
    if(ignoreex[value] == 'undefined')
      ignoreex[value] = true
    else
      ignoreex[value] = !ignoreex[value]
    this.props.backstate({ignoreex:ignoreex})
  }


  handleExtraSenkaChange = e => {
    e.preventDefault()
    e.stopPropagation()
    if(!this.props.zclearts){
      const es = (this.props.extraSenka + 1) % 3
      this.props.backstate({extraSenka:es})
    }
  }

  handleExtra2SenkaChange = e => {
    e.preventDefault()
    e.stopPropagation()
    if(!this.props.z2clearts){
      const es = (this.props.extra2Senka + 1) % 3
      this.props.backstate({extra2Senka:es})
    }
  }

  handleExtra3SenkaChange = e => {
    e.preventDefault()
    e.stopPropagation()
    if(!this.props.z3clearts){
      const es = (this.props.extra3Senka + 1) % 3
      this.props.backstate({extra3Senka:es})
    }
  }

  render() {
    try {
      return this.render_D()
    } catch (e) {
      debug.log(e)
      return (
        <div>
          {e.message}
        </div>
      )
    }
  }

  renderExButton = exid => {
    const {maps, ignoreex} = this.props
    const mapId = exid.split('-').join('')
    if(maps[mapId] && maps[mapId].api_cleared == 1){
      return (
        <Button
          key={exid}
          bsStyle='info'>
          <FontAwesome name="star"/>
          {exid}
        </Button>
      )
    } else {
      return (
        <Button
          key={exid}
          bsStyle={ignoreex[exid] ? 'danger' : 'success'}
          value={exid}
          onClick={this.handleExChange}>
          <FontAwesome
            name={ignoreex[exid] ? 'close' : 'check'}
          />
          {exid}
        </Button>
      )
    }
  }

  renderExtraSenkaButton = extraSenka => (
    <Button
      key="extraSenka"
      bsStyle={
        extraSenka == 0 ? 'success' :
        extraSenka == 1 ? 'danger' :
        'info'
      }
      onClick={this.handleExtraSenkaChange}>
      {
        extraSenka == 0 ?
          <FontAwesome name="check"/> :
        extraSenka == 1 ?
          <FontAwesome name="close"/> :
          <FontAwesome name="star"/>
      }
      Z作战
    </Button>
  )

  renderExtra2SenkaButton = extra2Senka => (
    <Button
      key="extra2Senka"
      bsStyle={
        extra2Senka == 0 ? 'success' :
          extra2Senka == 1 ? 'danger' :
            'info'
      }
      onClick={this.handleExtra2SenkaChange}>
      {
        extra2Senka == 0 ?
          <FontAwesome name="check"/> :
          extra2Senka == 1 ?
            <FontAwesome name="close"/> :
            <FontAwesome name="star"/>
      }
      三川
    </Button>
  )


  renderExtra3SenkaButton = extra3Senka => (
    <Button
      key="extra3Senka"
      bsStyle={
        extra3Senka == 0 ? 'success' :
          extra3Senka == 1 ? 'danger' :
            'info'
      }
      onClick={this.handleExtra3SenkaChange}>
      {
        extra3Senka == 0 ?
          <FontAwesome name="check"/> :
          extra3Senka == 1 ?
            <FontAwesome name="close"/> :
            <FontAwesome name="star"/>
      }
      泊地警戒
    </Button>
  )

  render_D(){
    const now = new Date()
    const day = now.getDate()
    const month = now.getMonth()
    const daysleft = dayofMonth[month] - day + 1
    const senkaleft = this.props.senkaleft
    const extraSenka = this.props.extraSenka
    const extra2Senka = this.props.extra2Senka
    const extra3Senka = this.props.extra3Senka
    return(
      <Col xs={this.props.lt?3:6}>
        <Panel
          className="info senka-calc">
          <Panel.Heading>
            <span>
              <FontAwesome name="calculator"/> 战果计算器
            </span>
          </Panel.Heading>
          <Panel.Body>
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
                {
                  [
                    ['1-5', 0.91],
                    ['7-1', 1.42],
                    ['4-4', 1.995],
                    ['4-5', 2.31],
                  ].map(([hd, dv]) => (
                    <tr key={hd}>
                      <td>{hd}</td>
                      <td>{Math.ceil(senkaleft/dv)}</td>
                      <td>{(senkaleft/daysleft/dv).toFixed(1)}</td>
                    </tr>
                  ))
                }
              </tbody>
            </Table>
            <OverlayTrigger placement="top" overlay={
              <Tooltip>
                {
                  [
                    ['success', 'check', '计划攻略'],
                    ['danger', 'close', '计划不攻略'],
                    ['info', 'star', '已完成'],
                  ].map(([bsStyle, faName, content],ind) => (
                    <p key={ind} className="text-left">
                      <Button bsStyle={bsStyle} bsSize="xsmall">
                        <FontAwesome name={faName}/>
                      </Button>：{content}
                    </p>
                  ))
                }
              </Tooltip>
            }>
              <div>
                {
                  _.chunk(
                    [
                      ...exlist.map(this.renderExButton),
                      this.renderExtraSenkaButton(extraSenka),
                      this.renderExtra2SenkaButton(extra2Senka),
                      this.renderExtra3SenkaButton(extra3Senka),
                    ],
                    4).map((btns,groupInd) => (
                      <ButtonGroup
                        key={groupInd}
                        bsSize="xsmall"
                        className="justified-group">
                        {
                          btns
                        }
                      </ButtonGroup>
                    ))
                }
              </div>
            </OverlayTrigger>
          </Panel.Body>
        </Panel>
      </Col>
    )
  }
}
