import styled from "@emotion/styled";

export interface SubwayIconContainerProps {
  sizeEm?: number;
  clickable?: boolean;
}

export interface SubwayIconColorProps {
  color: string;
  textColor?: string;
}

export interface FilteredImageProps {
  filter?: string;
  opacity?: number;
  border?: string;
}

export const FilteredImage = styled.img<FilteredImageProps>((props) => ({
  ...(props.filter && { filter: props.filter }),
  ...(props.opacity && { opacity: props.opacity }),
  ...(props.border && {
    border: props.border,
    borderRadius: "100%",
  }),
}));

export const SubwayIconContainer = styled.span<SubwayIconContainerProps>(
  (props) => ({
    display: "inline-block",
    position: "relative",
    verticalAlign: "middle",
    width: props.sizeEm ? `${props.sizeEm}em` : "3.1em",
    height: props.sizeEm ? `${props.sizeEm}em` : "3.1em",
    ...(props.clickable && { cursor: "pointer" }),
  })
);
