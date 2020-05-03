import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import classNames from 'classnames'
import AtComponent from '../../../common/component'
import { delayQuerySelector } from '../../../common/utils'
interface IProps {
    componentId?: any,
    onQueryedDom?: any,
    options?: any,
    className?: any,
}
export default class AtSwiperActionOptions extends AtComponent<IProps> {
  static defaultProps: IProps
  trrigerOptionsDomUpadte () {
    delayQuerySelector(
      this,
      `#swipeActionOptions-${this.props.componentId}`
    ).then(res => {
      this.props.onQueryedDom(res[0])
    })
  }

  componentDidMount () {
    this.trrigerOptionsDomUpadte()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.options !== this.props.options) {
      this.trrigerOptionsDomUpadte()
    }
  }

  render () {
    const rootClass = classNames(
      'at-swipe-action__options',
      this.props.className
    )

    return (
      <View
        id={`swipeActionOptions-${this.props.componentId}`}
        className={rootClass}
      >
        {this.props.children}
      </View>
    )
  }
}

AtSwiperActionOptions.defaultProps = {}

