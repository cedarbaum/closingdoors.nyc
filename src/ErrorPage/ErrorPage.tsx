import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/pro-solid-svg-icons";
import * as S from "./ErrorPage.styles";

export interface ErrorPageProps {
  error: JSX.Element;
}

export const ErrorPage: React.FC<ErrorPageProps> = (props) => {
  return (
    <S.Container>
      <FontAwesomeIcon size={"lg"} icon={faExclamationTriangle} />
      <p>{props.error}</p>
    </S.Container>
  );
};
