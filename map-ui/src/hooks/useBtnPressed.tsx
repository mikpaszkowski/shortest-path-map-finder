import React from "react";
import { useEffect } from "react";

export const useBtnPressed = (code: string) => {
KeyboardEvent.DOM_KEY_LOCATION_LEFT
    const [isCtrlPressed, setIsCtrlPressed] = React.useState(false);

    useEffect(() => {
      const handleWindowKeyDown = (e: KeyboardEvent) => {
        console.log(e);
        if (e.key === code) {
          setIsCtrlPressed(true);
        }
      };
  
      const handleWindowKeyUp = (e: KeyboardEvent) => {
        if (e.key === code) {
          setIsCtrlPressed(false);
        }
      };
  
      window.addEventListener("keydown", handleWindowKeyDown);
      window.addEventListener("keyup", handleWindowKeyUp);
  
      return () => {
        window.removeEventListener("keydown", handleWindowKeyDown);
        window.removeEventListener("keyup", handleWindowKeyUp);
      };
    }, []);

    return {
        isCtrlPressed,
    }
}