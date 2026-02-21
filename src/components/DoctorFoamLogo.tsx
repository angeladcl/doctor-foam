"use client";

import React from "react";

interface DoctorFoamLogoProps {
    width?: number;
    height?: number;
    className?: string;
    showText?: boolean;
}

export default function DoctorFoamLogo({
    width = 48,
    height = 48,
    className = "",
    showText = true,
}: DoctorFoamLogoProps) {
    return (
        <span
            className={className}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.6rem",
            }}
        >
            {/* ─── Animated Foam Icon ─── */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 120 120"
                width={width}
                height={height}
                aria-label="Doctor Foam Logo"
                role="img"
                style={{ flexShrink: 0 }}
            >
                <defs>
                    {/* Gold gradient for the main elements */}
                    <linearGradient id="df-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4a853" />
                        <stop offset="50%" stopColor="#f0d48a" />
                        <stop offset="100%" stopColor="#c9952a" />
                    </linearGradient>

                    {/* Blue accent gradient */}
                    <linearGradient id="df-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>

                    {/* Subtle glow filter */}
                    <filter id="df-glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Foam bubble glow */}
                    <radialGradient id="df-bubble" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="rgba(240, 212, 138, 0.6)" />
                        <stop offset="50%" stopColor="rgba(212, 168, 83, 0.3)" />
                        <stop offset="100%" stopColor="rgba(201, 149, 42, 0.1)" />
                    </radialGradient>

                    <radialGradient id="df-bubble-blue" cx="35%" cy="35%" r="65%">
                        <stop offset="0%" stopColor="rgba(96, 165, 250, 0.5)" />
                        <stop offset="50%" stopColor="rgba(37, 99, 235, 0.25)" />
                        <stop offset="100%" stopColor="rgba(37, 99, 235, 0.05)" />
                    </radialGradient>
                </defs>

                {/* ─── Background circle ─── */}
                <circle cx="60" cy="60" r="56" fill="rgba(10, 22, 40, 0.9)" stroke="url(#df-gold)" strokeWidth="2" />

                {/* ─── Car silhouette (simplified top-view) ─── */}
                <g transform="translate(60, 68)" filter="url(#df-glow)">
                    {/* Car body */}
                    <path
                        d="M-22,0 C-22,-4 -20,-8 -16,-10 L-8,-12 C-4,-14 4,-14 8,-12 L16,-10 C20,-8 22,-4 22,0 C22,4 20,6 16,6 L-16,6 C-20,6 -22,4 -22,0 Z"
                        fill="none"
                        stroke="url(#df-gold)"
                        strokeWidth="1.5"
                        opacity="0.8"
                    />
                    {/* Windshield */}
                    <path
                        d="M-8,-12 L-5,-6 L5,-6 L8,-12"
                        fill="none"
                        stroke="url(#df-gold)"
                        strokeWidth="1"
                        opacity="0.5"
                    />
                </g>

                {/* ─── Foam Bubbles — Animated ─── */}

                {/* Large bubble 1 — floats up-left */}
                <circle cx="40" cy="45" r="10" fill="url(#df-bubble)" stroke="rgba(212,168,83,0.3)" strokeWidth="0.7">
                    <animate attributeName="cy" values="45;38;45" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="r" values="10;11.5;10" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="3s" repeatCount="indefinite" />
                </circle>
                {/* Specular highlight on large bubble 1 */}
                <ellipse cx="37" cy="41" rx="3" ry="2" fill="rgba(255,255,255,0.35)" transform="rotate(-25,37,41)">
                    <animate attributeName="cy" values="41;34;41" dur="3s" repeatCount="indefinite" />
                </ellipse>

                {/* Large bubble 2 — floats up-right */}
                <circle cx="78" cy="40" r="12" fill="url(#df-bubble)" stroke="rgba(212,168,83,0.25)" strokeWidth="0.7">
                    <animate attributeName="cy" values="40;32;40" dur="3.8s" repeatCount="indefinite" />
                    <animate attributeName="r" values="12;13;12" dur="3.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.75;1;0.75" dur="3.8s" repeatCount="indefinite" />
                </circle>
                {/* Specular highlight */}
                <ellipse cx="74" cy="35" rx="4" ry="2.5" fill="rgba(255,255,255,0.3)" transform="rotate(-20,74,35)">
                    <animate attributeName="cy" values="35;27;35" dur="3.8s" repeatCount="indefinite" />
                </ellipse>

                {/* Medium bubble 3 — center top */}
                <circle cx="58" cy="30" r="8" fill="url(#df-bubble-blue)" stroke="rgba(96,165,250,0.25)" strokeWidth="0.5">
                    <animate attributeName="cy" values="30;24;30" dur="4.2s" repeatCount="indefinite" />
                    <animate attributeName="r" values="8;9;8" dur="4.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0.95;0.7" dur="4.2s" repeatCount="indefinite" />
                </circle>
                <ellipse cx="55" cy="27" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.3)" transform="rotate(-15,55,27)">
                    <animate attributeName="cy" values="27;21;27" dur="4.2s" repeatCount="indefinite" />
                </ellipse>

                {/* Small bubble 4 */}
                <circle cx="30" cy="32" r="5" fill="url(#df-bubble-blue)" stroke="rgba(96,165,250,0.2)" strokeWidth="0.4">
                    <animate attributeName="cy" values="32;27;32" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="r" values="5;5.8;5" dur="2.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0.9;0.6" dur="2.8s" repeatCount="indefinite" />
                </circle>

                {/* Small bubble 5 */}
                <circle cx="88" cy="28" r="5.5" fill="url(#df-bubble)" stroke="rgba(212,168,83,0.2)" strokeWidth="0.4">
                    <animate attributeName="cy" values="28;22;28" dur="3.3s" repeatCount="indefinite" />
                    <animate attributeName="r" values="5.5;6.5;5.5" dur="3.3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.65;0.95;0.65" dur="3.3s" repeatCount="indefinite" />
                </circle>

                {/* Tiny bubble 6 */}
                <circle cx="48" cy="22" r="3" fill="url(#df-bubble)" stroke="rgba(212,168,83,0.15)" strokeWidth="0.3">
                    <animate attributeName="cy" values="22;17;22" dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.85;0.5" dur="2.5s" repeatCount="indefinite" />
                </circle>

                {/* Tiny bubble 7 */}
                <circle cx="70" cy="20" r="3.5" fill="url(#df-bubble-blue)" stroke="rgba(96,165,250,0.15)" strokeWidth="0.3">
                    <animate attributeName="cy" values="20;14;20" dur="2.9s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2.9s" repeatCount="indefinite" />
                </circle>

                {/* Tiny bubble 8 — very small, fast */}
                <circle cx="52" cy="16" r="2" fill="url(#df-bubble)" opacity="0.4">
                    <animate attributeName="cy" values="16;10;16" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Tiny bubble 9 */}
                <circle cx="82" cy="18" r="2.2" fill="url(#df-bubble-blue)" opacity="0.4">
                    <animate attributeName="cy" values="18;12;18" dur="2.3s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.65;0.3" dur="2.3s" repeatCount="indefinite" />
                </circle>

                {/* ─── "DF" Monogram ─── */}
                <text
                    x="60"
                    y="95"
                    textAnchor="middle"
                    fontFamily="'Inter', 'Montserrat', sans-serif"
                    fontWeight="900"
                    fontSize="18"
                    fill="url(#df-gold)"
                    letterSpacing="3"
                >
                    DF
                </text>
            </svg>

            {/* ─── Text wordmark ─── */}
            {showText && (
                <span
                    style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "1.3rem",
                        color: "white",
                        lineHeight: 1.1,
                        letterSpacing: "-0.01em",
                    }}
                >
                    DOCTOR{" "}
                    <span className="gradient-text">FOAM</span>
                </span>
            )}
        </span>
    );
}
