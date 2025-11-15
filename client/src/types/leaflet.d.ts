import 'leaflet';

declare module 'leaflet' {
  namespace control {
    interface FullscreenOptions extends L.ControlOptions {
      position?: L.ControlPosition;
      title?: string;
      titleCancel?: string;
      forceSeparateButton?: boolean;
      forcePseudoFullscreen?: boolean;
      fullscreenElement?: false | HTMLElement;
    }

    function fullscreen(options?: FullscreenOptions): L.Control;
  }

  interface Map {
    fullscreenControl?: L.Control;
    toggleFullscreen(): void;
    isFullscreen(): boolean;
  }
}
