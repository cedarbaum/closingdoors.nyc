import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface ContainerProps {
  showBottomBorder?: boolean;
  paddingBottom?: string | number
}

export const Container = styled.div<ContainerProps>((props) => ({
  backgroundColor: "#FCCC0A",
  ...(props.paddingBottom && { paddingBottom: props.paddingBottom }),
  ...(props.showBottomBorder && { borderBottom: "2px dotted black" }),
}));

export const AlertHeader = styled.div({
  backgroundColor: "#FCCC0A",
  paddingRight: "1em",
  paddingLeft: "1em",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
  alignItems: "center",
  justifyContent: "space-between",
  overflow: "hidden",
});

export const AlertBody = styled.div({
  backgroundColor: "#FCCC0A",
  paddingRight: "1em",
  paddingLeft: "1em",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
});

export const NumberOfAlertsSpan = styled.span({
  fontWeight: "bold",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
});

export const RotatableIcon = styled(FontAwesomeIcon)({
  transition: "0.15s ease",
});
