import { useControl } from "react-map-gl";

class ToggleControl implements mapboxgl.IControl {
  private _map?: mapboxgl.Map;
  private _container: HTMLDivElement;
  private _button: HTMLButtonElement;
  private _onToggle: (isActive: boolean) => void;

  constructor(enabled: boolean, onToggle: (isActive: boolean) => void) {
    this._onToggle = onToggle;
    this._container = document.createElement("div");
    this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group"; // Here
    this._button = document.createElement("button");
    this._button.className = "mapboxgl-ctrl-icon mapboxgl-bus-ctrl-icon"; // And here
    this._button.setAttribute("aria-label", "Toggle Control");
    if (enabled) {
      this._button.classList.add("active");
    }
  }

  public onAdd(map: mapboxgl.Map): HTMLElement {
    this._map = map;
    this._button.onclick = () => {
      const isActive = this._button.classList.toggle("active");
      this._onToggle(isActive);
    };
    this._container.appendChild(this._button);
    return this._container;
  }

  public onRemove(): void {
    if (this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
    }
    this._map = undefined;
  }

  public getDefaultPosition(): string {
    return "top-right";
  }
}

export default function ToggleFollowBusControl({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (isActive: boolean) => void;
}) {
  useControl(() => new ToggleControl(enabled, onToggle), {
    position: "top-right",
  });
  return null;
}
