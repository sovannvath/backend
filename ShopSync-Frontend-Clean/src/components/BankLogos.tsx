import React from "react";

export const AceledaBankLogo = ({
  className = "w-8 h-8",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 100 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* ACELEDA Bank Logo - Simplified */}
    <rect width="100" height="40" rx="6" fill="#1e40af" />
    <text
      x="50"
      y="14"
      textAnchor="middle"
      className="text-white font-bold text-xs"
      fill="white"
      fontSize="8"
    >
      ACELEDA
    </text>
    <text
      x="50"
      y="28"
      textAnchor="middle"
      className="text-white text-xs"
      fill="white"
      fontSize="6"
    >
      BANK
    </text>
    <circle cx="15" cy="20" r="3" fill="white" opacity="0.8" />
    <circle cx="85" cy="20" r="3" fill="white" opacity="0.8" />
  </svg>
);

export const ABaBankLogo = ({
  className = "w-8 h-8",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 100 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* ABA Bank Logo - Simplified */}
    <rect width="100" height="40" rx="6" fill="#dc2626" />
    <text
      x="50"
      y="18"
      textAnchor="middle"
      className="text-white font-bold"
      fill="white"
      fontSize="12"
    >
      ABA
    </text>
    <text
      x="50"
      y="30"
      textAnchor="middle"
      className="text-white text-xs"
      fill="white"
      fontSize="6"
    >
      BANK
    </text>
    <rect x="10" y="10" width="4" height="20" fill="white" opacity="0.8" />
    <rect x="86" y="10" width="4" height="20" fill="white" opacity="0.8" />
  </svg>
);

export const CreditCardLogo = ({
  className = "w-8 h-8",
}: {
  className?: string;
}) => (
  <svg
    className={className}
    viewBox="0 0 100 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Generic Credit Card Logo */}
    <rect width="100" height="40" rx="6" fill="#374151" />
    <rect x="8" y="12" width="84" height="4" fill="white" />
    <rect x="8" y="20" width="30" height="3" fill="white" opacity="0.8" />
    <rect x="8" y="26" width="20" height="2" fill="white" opacity="0.6" />
    <text
      x="92"
      y="35"
      textAnchor="end"
      className="text-white text-xs"
      fill="white"
      fontSize="8"
    >
      CARD
    </text>
  </svg>
);
