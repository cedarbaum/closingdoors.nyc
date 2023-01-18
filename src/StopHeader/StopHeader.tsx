import React from "react";

import * as S from "./StopHeader.styles";

export interface StopHeaderProps {
  stopName: string;
}

export const StopHeader: React.FC<StopHeaderProps> = (props) => {
  return (
    <S.Container>
      <S.StopText>{props.stopName}</S.StopText>
    </S.Container>
  );
};
