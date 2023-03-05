import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/pro-solid-svg-icons";
import * as S from "./ErrorPage.styles";

export interface ErrorPageProps {
  error: JSX.Element;
  errorDetails?: JSX.Element;
}

export const ErrorPage: React.FC<ErrorPageProps> = (props) => {
  return (
    <S.Container>
      <S.ErrorTextContainer>
        <FontAwesomeIcon size={"lg"} icon={faExclamationTriangle} />
        <p>{props.error}</p>
      </S.ErrorTextContainer>
      {props.errorDetails}
    </S.Container>
  );
};
