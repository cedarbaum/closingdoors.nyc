import styled from "@emotion/styled";

export const Container = styled.div({
  height: "100%",
  backgroundColor: "#FCCC0A",
  padding: "1.5em",
  scrollbarWidth: "none",
  overflow: "scroll",
  "::-webkit-scrollbar": {
    display: "none",
  },
  boxSizing: "border-box",
});

export const ErrorTextContainer = styled.div({
  fontFamily: 'Helvetica, Arial, "Lucida Grande", sans-serif',
  fontSize: "3em",
  fontWeight: "bold",
});

export const ErrorCode = styled.p({
  fontSize: "0.5em",
});
