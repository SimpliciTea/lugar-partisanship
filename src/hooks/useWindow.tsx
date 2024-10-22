import React, { useState, useLayoutEffect } from "react";

export default function useWindowDimensions() {
  function getWindowDimensions() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      width,
      height,
    };
  }

  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useLayoutEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return windowDimensions;
}

export const useDimensions = (elementRef: React.RefObject<HTMLDivElement>) => {
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const handleResize = () => {
      const rect = elementRef.current?.getBoundingClientRect();

      setDims({ width: rect?.width ?? 0, height: rect?.height ?? 0 });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return dims;
};
