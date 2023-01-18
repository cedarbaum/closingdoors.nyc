import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";

export const Container = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

// Based on https://github.com/loadingio/css-spinner/blob/master/dist/grid.html

export const LoadingGrid = styled.div({
  display: "inline-block",
  position: "relative",
  width: "80px",
  height: "80px",
});

export interface CircleProps {
  animationDelaySeconds: number;
  color: string;
  top: number;
  left: number;
}

const GridAnimation = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

export const Circle = styled.div<CircleProps>((props) => ({
  position: "absolute",
  width: "16px",
  height: "16px",
  top: `${props.top}px`,
  left: `${props.left}px`,
  borderRadius: "50%",
  animation: `${GridAnimation} 1.2s linear infinite`,
  background: props.color,
  animationDelay: `${props.animationDelaySeconds}s`,
}));
