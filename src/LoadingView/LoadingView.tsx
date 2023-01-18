import React from "react";
import * as S from "./LoadingView.styles";
import { range } from "lodash";
import { allLines } from "../utils/SubwayLines";

const animationDelays = [0, -0.4, -0.8, -0.4, -0.8, -1.2, -0.8, -1.2, -1.6];

export const LoadingView: React.FC = () => {
  return (
    <S.Container>
      <S.LoadingGrid>
        {range(9).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const top = 8 + row * 24;
          const left = 8 + col * 24;

          return (
            <S.Circle
              key={idx}
              top={top}
              left={left}
              color={allLines[idx].color}
              animationDelaySeconds={animationDelays[idx]}
            />
          );
        })}
      </S.LoadingGrid>
    </S.Container>
  );
};
