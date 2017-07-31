import { bindActionCreators } from 'redux'

const initState = {
}

const reducer = (state = initState, action) => {
  if (action.type === '@poi-plugin-achievement@Modify') {
    const {modifier} = action
    return modifier(state)
  }

  return state
}

const actionCreator = {
  modify: modifier => ({
    type: '@poi-plugin-achievement@Modify',
    modifier,
  }),
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(actionCreator, dispatch)

export {
  reducer,
  mapDispatchToProps,
}
