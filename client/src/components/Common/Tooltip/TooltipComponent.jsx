/* eslint-disable react/prop-types */
import { Children } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const TooltipComponent = ({
  placement = "top",
  trigger = ["hover", "focus"],
  tooltipText,
  children,
}) => {
  return (
    <OverlayTrigger
      placement={placement}
      trigger={trigger}
      overlay={<Tooltip id={`tooltip-${placement}`}>{tooltipText}</Tooltip>}
    >
      {children}
    </OverlayTrigger>
  );
};

export default TooltipComponent;