"use client";

import { useSessionValidation } from "@/lib/useSessionValidation";

export default function SessionValidator() {
  useSessionValidation();
  return null;
}
