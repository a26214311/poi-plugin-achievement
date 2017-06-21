import {
  createSelector,
} from 'reselect'

import {
  configLayoutSelector,
  configDoubleTabbedSelector,
  basicSelector,
  constSelector,
  mapsSelector,
} from 'views/utils/selectors'

const mainUISelector = createSelector(
  configLayoutSelector,
  configDoubleTabbedSelector,
  basicSelector,
  constSelector,
  mapsSelector,
  (layout, doubleTabbed, basic, {$maps,$ships}, maps) => ({
    layout, doubleTabbed,
    basic, maps,
    $maps, $ships,
  }))

export {
  mainUISelector,
}
