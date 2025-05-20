"use client";

import { useState, useEffect } from "react";

export const useIsMountedState = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
};
