import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export interface SubmitButtonProps {
  textColor: string;
}

export interface ColoredCircleProps {
  color: string;
  animate?: boolean | string;
}

export interface MaxHeightProps {
  maxHeight: number | undefined;
}

export interface ShuttleTextProps {
  color: string;
  isBold: boolean;
  increaseVisibility?: boolean;
}

export const AlertsHeaderContainer = styled.div<MaxHeightProps>((props) => ({
  maxHeight: props.maxHeight,
  scrollbarWidth: "none",
  overflow: "scroll",
  "::-webkit-scrollbar": {
    display: "none",
  },
}));

export const Container = styled.div({
  overflow: "scroll",
  height: "100%",
  scrollbarWidth: "none",
  backgroundColor: "black",
  "::-webkit-scrollbar": {
    display: "none",
  },
});

export const CenterContainer = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const ArrowsContainer = styled.div({
  width: "100%",
  display: "flex",
  position: "sticky",
  top: "0",
  zIndex: 100,
});

export const ArrowContainer = styled.div({
  fontSize: "30px",
  height: "2.5em",
  width: "50%",
  textAlign: "center",
  justifyContent: "center",
  alignItems: "center",
  display: "flex",
  backgroundColor: "black",
});

export const ShuttleText = styled.span<ShuttleTextProps>((props) => ({
  fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
  fontSize: "40px",
  color: `white`,
  fontWeight: `${props.isBold ? "bold" : "normal"}`,
  opacity: `${props.isBold ? "100%" : "40%"}`,
}));

export const SubmitButton = styled.button<SubmitButtonProps>((props) => ({
  backgroundColor: "black",
  color: props.textColor,
  bottom: "0",
  position: "sticky",
  margin: "auto",
  width: "100%",
  height: "50px",
  zIndex: 100,
  fontFamily: '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
  textAlign: "center",
  fontSize: "1.5em",
  fontWeight: "bold",
  border: "0",
}));

export const RoutesContainer = styled.div({
  margin: "0.5em",
});

export const IconContainer = styled.div({
  marginLeft: "15px",
  display: "flex",
  "& > *:not(:first-of-type)": {
    marginLeft: "15px",
  },
  paddingTop: "0.5em",
});

export const SubwayIconContainer = styled.div({
  position: "relative",
});

const flickerKeyFrames = keyframes`
  0%   { opacity:1; }
  100%  { opacity:0.6; }
`;

export const UpperRightIcon = styled(FontAwesomeIcon)<ColoredCircleProps>(
  (props) => ({
    width: "30%",
    height: "30%",
    right: "-7%",
    top: "-7%",
    borderRadius: "100%",
    position: "absolute",
    zIndex: 50,
    ...(props.animate && {
      animation: `${flickerKeyFrames} 1.5s infinite alternate`,
      animationTimingFunction: "ease-in-out",
    }),
  })
);

export const SpanWithBlackText = styled.span({
  color: "black",
});
