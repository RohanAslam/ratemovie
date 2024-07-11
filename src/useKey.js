import { useEffect } from "react";

export function useKey(eventName, handler, element = window) {
  useEffect(function () {
    element.addEventListener(eventName, handler);

    return function () {
      element.removeEventListener(eventName, handler);
    };
  }, []);
}
