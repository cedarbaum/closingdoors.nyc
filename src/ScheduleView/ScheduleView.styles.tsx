import styled from "@emotion/styled";

export const Table = styled.table({
  width: "100%",
  borderSpacing: 0,
  borderCollapse: "collapse",
});

export const Td = styled.td({
  padding: 0,
});

export const Th = styled.th({
  padding: 0,
});

export const StickyThead = styled.thead({
  padding: 0,
  position: "sticky",
  top: "0",
  zIndex: 100,
});

export const CenterContainer = styled.div({
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
});

export const Container = styled.div({});

export const AlertsErrorContainer = styled.div({});
