import {
  createSelector,
} from 'reselect'
import { _ } from 'lodash'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  basicSelector,
  constSelector,
  mapsSelector,
} from 'views/utils/selectors'

import { exlist } from './lib/util'

const shipChecksumSelector = createSelector(
  constSelector,
  ({$ships}) =>
    _.sum(Object.keys($ships||{}).map(mstIdStr =>
      parseInt(mstIdStr,10))))

const unclearedExListSelector = createSelector(
  mapsSelector,
  maps => _.flatMap(
    exlist,
    (exStr, index) => {
      const mapIdStr = exStr.split('-').join('')
      const cleared = _.get(maps, `${mapIdStr}.api_cleared`) === 1
      return cleared ? [] : [exStr]
    }))

const mainUISelector = createSelector(
  configLayoutSelector,
  configDoubleTabbedSelector,
  basicSelector,
  shipChecksumSelector,
  mapsSelector,
  unclearedExListSelector,
  (layout, doubleTabbed, basic, shipChecksum, maps, unclearedExList) => ({
    layout, doubleTabbed,
    basic, maps,
    shipChecksum,
    unclearedExList,
  }))

export {
  mainUISelector,
}
