import React, {Component} from 'react'
import {connect} from 'react-redux'

import {join} from 'path'
import {Row, Col, Checkbox, Panel, FormGroup, FormControl, ButtonGroup, Button, Table, OverlayTrigger, Tooltip} from 'react-bootstrap'
import FontAwesome from 'react-fontawesome'



const fs = require('fs')
const exlist=["1-5","1-6","2-5","3-5","4-5","5-5","6-5"];
const exvalue={"1-5":75,"1-6":75,"2-5":100,"3-5":150,"4-5":180,"5-5":200,"6-5":250};
const dayofMonth = [31,28,31,30,31,30,31,31,30,31,30,31];

export default connect(
  function(state){
    console.log("connect state:");
    console.log(state);
    return {};
  },
  null, null, {pure: false}
)( class SenkaCaculator extends Component {

  render(){
    return(
      <Col xs={6}>
        fulan is baka
      </Col>
    )
  }
})

















