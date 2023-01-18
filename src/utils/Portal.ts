import React from "react";
import ReactDOM from "react-dom";

export interface PortalProps {
  children: React.ReactNode;
  className: string;
  el: string;
}

// https://stackoverflow.com/a/59154364
export const Portal = ({ children, className, el }: PortalProps) => {
  const [container] = React.useState(() => {
    // This will be executed only on the initial render
    // https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
    return document.createElement(el);
  });

  React.useEffect(() => {
    container.classList.add(className);
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [className, container]);

  return ReactDOM.createPortal(children, container);
};
