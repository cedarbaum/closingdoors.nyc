import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface RotationProps {
  angledeg?: number;
}

export interface DropDownHeaderProps {
  addLeftRightPadding?: boolean;
  showBottomBorder?: boolean;
  usePointerCursor?: boolean;
}

export interface NumberOfAlertsSpanProps {
  fontSizeEm?: number;
}

export const Container = styled.div({});

export const DropDownHeader = styled.div<DropDownHeaderProps>((props) => ({
  height: "1em",
  backgroundColor: "#FCCC0A",
  ...(props.addLeftRightPadding && { paddingLeft: "1em" }),
  ...(props.addLeftRightPadding && { paddingRight: "1em" }),
  paddingTop: "1em",
  paddingBottom: "1em",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  ...(props.usePointerCursor && { cursor: "pointer" }),
  ...(props.showBottomBorder && { borderBottom: "1px dotted black" }),
}));

export const DropDownBody = styled.div({});

export const NumberOfAlertsSpan = styled.span<NumberOfAlertsSpanProps>(
  (props) => ({
    fontWeight: "bold",
    fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
    fontSize: props.fontSizeEm ? `${props.fontSizeEm}em` : "1em",
  })
);

export const RotatableIcon = styled(FontAwesomeIcon)<RotationProps>(
  (props) => ({
    transition: "0.15s ease",
    transform: `rotate(${props.angledeg ? props.angledeg : 0}deg)`,
    cursor: "pointer",
  })
);
