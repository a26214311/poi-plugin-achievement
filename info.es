import React, {Component} from 'react'
import {Row, Col, Panel, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'
import {getRankDateNo,MAGIC_L_NUMS} from './util'

export default class SenkaInfo extends Component {

  generateRankHtml(order,rx,rxtime,rxlast,rxlasttime){
    rx=rx?rx:0;
    rxlast = rxlast?rxlast:0;
    rxtime = new Date(rxtime);
    var rxno = getRankDateNo(rxtime);
    var rxtsstr = ["更新时间: " + (Math.floor((parseInt(rxno))/2)+1) + "日", parseInt(rxno)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>];
    return(
      <tr>
        <td className="pob">
          <div>{order}位</div>
          <div className="pos bg-primary">{rxtsstr}</div>
        </td>
        <td className="pob">
          <OverlayTrigger placement="bottom" overlay={
            <Tooltip>
              <div>战果增加： <FontAwesome name="arrow-up"/>{(rx-rxlast).toFixed(0)}</div>
              <div>
                {"上次更新: " + (Math.floor((parseInt(rxlasttime))/2)+1) + "日"}
                {(parseInt(rxlasttime)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
              </div>
            </Tooltip>
          }>
            <div>{rx.toFixed(0)}<span className="senka-up">(<FontAwesome name="arrow-up"/>{(rx-rxlast).toFixed(0)})</span></div>
          </OverlayTrigger>
        </td>
      </tr>
    )
  }

  handleRevise = e => {
    e.preventDefault();
    e.stopPropagation();
    var revise;
    if(this.props.achieve.reviseType)
      revise=0;
    else
      revise=1;
    this.props.backstate({reviseType:revise});
  };

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
    var achieve = this.props.achieve;
    var member_id = this.props.member_id;
    var upsenka = this.props.upsenka;

    var ranktime =new Date(achieve.ranktime?achieve.ranktime:0);
    var mysenka = achieve.mysenka?achieve.mysenka:0;
    var no = getRankDateNo(ranktime);

    return(
      <Col xs={6}>
        <Panel header={
          <span>
              <FontAwesome name="list-ol"/> 战果信息
                <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>
                    <p className="text-left">
                      {achieve.reviseType ?
                        <span>
                      榜单不准确时点击此按钮自动校准<br/>
                      当前战果系数为{achieve.mymagic>9?achieve.mymagic:MAGIC_L_NUMS[member_id % 10]}<br/><br/>
                      游戏更新后，战果榜单可能不准确<br/>
                      榜单不准确时，点击此按钮<br/>
                      进入游戏刷新战果榜的任意一页<br/>
                      则会自动校准战果系数<br/>
                      如果战果榜单依然不准，请再次点击此按钮<br/>
                      进入战果榜单的另外一页以校准战果榜单<br/>
                      </span>
                        :
                        <span>
                      更新中<br/>
                      请刷新战果
                      </span>}
                    </p>
                  </Tooltip>
                }>
                  <FontAwesome name="refresh" className={achieve.reviseType? 'revise': 'revise active'} onClick={this.handleRevise}/>
                </OverlayTrigger>
            </span>
        } className="info senka-info">
          <Table striped bordered condensed hover>
            <thead>
            <tr>
              <th className="senka-title">顺位</th>
              <th>战果</th>
            </tr>
            </thead>
            <tbody>
            {this.generateRankHtml(5,achieve.r5,achieve.r5time,achieve.r5last,achieve.r5lasttime)}
            {this.generateRankHtml(20,achieve.r20,achieve.r20time,achieve.r20last,achieve.r20lasttime)}
            {this.generateRankHtml(100,achieve.r1,achieve.r1time,achieve.r1last,achieve.r1lasttime)}
            {this.generateRankHtml(501,achieve.r501,achieve.r501time,achieve.r501last,achieve.r501lasttime)}
            <tr>
              <td className="pob">
                <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>
                    <div>
                      本次变化：{
                      (achieve.mylastno>achieve.myno?
                        <FontAwesome name="arrow-up"/>:<FontAwesome name="arrow-down"/>)}
                      {Math.abs(achieve.mylastno-achieve.myno)}
                    </div>
                    <div>上次排名： {achieve.mylastno}</div>
                    <div>
                      {"上次更新: " + (Math.floor((parseInt(achieve.mylastranktime))/2)+1) + "日"}
                      {(parseInt(achieve.mylastranktime)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>)}
                    </div>
                  </Tooltip>
                }>
                  <div>{achieve.myno}位</div>
                </OverlayTrigger>
                <div className="pos bg-primary">
                  更新时间:{(Math.floor((parseInt(no))/2)+1)}日
                  {parseInt(no)%2!=0?<FontAwesome name="sun-o"/> : <FontAwesome name="moon-o"/>}
                </div>
              </td>
              <td>
                <OverlayTrigger placement="bottom" overlay={
                  <Tooltip>
                    <div>预想战果增加： <FontAwesome name="arrow-up"/>{upsenka.toFixed(1)}</div>
                    <div>战果预测值： {(mysenka+upsenka).toFixed(1)}</div>
                  </Tooltip>
                }>
                  <div>
                    {mysenka.toFixed(0)}
                    <span className="senka-up">(<FontAwesome name="arrow-up"/>{upsenka.toFixed(1)})</span>
                  </div>
                </OverlayTrigger>
              </td>
            </tr>
            </tbody>
          </Table>
        </Panel>
      </Col>
    )
  }
}

















