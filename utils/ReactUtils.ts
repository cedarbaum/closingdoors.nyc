import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";

export function convertReactComponentToHtml(component: React.ReactNode) {
  const div = document.createElement("div");
  const root = createRoot(div);
  flushSync(() => {
    root.render(component);
  });
  return div.innerHTML;
}
