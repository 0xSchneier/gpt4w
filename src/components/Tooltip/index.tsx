// https://www.npmjs.com/package/rc-tooltip
import RCTooltip from 'rc-tooltip'
import clss from 'classnames'
import { TooltipProps } from 'rc-tooltip/lib/Tooltip'
import './tooltip.scss'

export interface Props extends TooltipProps {
  children?: JSX.Element
  text?: string
  className?: string
  hideArrow?: boolean
}

const Tooltip = ({ children, className, text, hideArrow, ...props }: Props) => {
  return (
    <div
      className={className}
      onClick={e => {
        e.stopPropagation()
      }}>
      <RCTooltip prefixCls={clss({ 'hide-arrow': hideArrow }, 'ex-tooltip')} {...props}>
        <span className="relative text-inherit bg-inherit flex" style={{ fontSize: 'inherit' }}>
          {children || text}
        </span>
      </RCTooltip>
    </div>
  )
}

export default Tooltip
