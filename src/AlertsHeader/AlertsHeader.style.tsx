import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface RotationProps {
  angledeg?: number;
}

export const Container = styled.div({});

export const DropDownHeader = styled.div({
  height: "1em",
  backgroundColor: "#FCCC0A",
  padding: "1em",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
});

export const DropDownBody = styled.div({});

export const NumberOfAlertsSpan = styled.span({
  fontWeight: "bold",
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
});

export const RotatableIcon = styled(FontAwesomeIcon)<RotationProps>(
  (props) => ({
    transition: "0.15s ease",
    transform: `rotate(${props.angledeg ? props.angledeg : 0}deg)`,
  })
);
