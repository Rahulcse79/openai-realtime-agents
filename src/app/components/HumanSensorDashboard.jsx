"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import MicIcon from "@mui/icons-material/Mic";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import ScienceIcon from "@mui/icons-material/Science";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import sensorData from "../Data/SensorData.json";
import employeeData from "../Data/employeeData.json";
import employeeImage from "../Data/Images/ER225.jpg";

const heartWave = sensorData.heart_blood.ECG.waveform.map((v, i) => ({
  t: i + 1,
  v,
}));

const brainActivityData = [
  { category: "Alpha", value: sensorData.brain_nervous_system.EEG.alpha },
  { category: "Beta", value: sensorData.brain_nervous_system.EEG.beta },
  { category: "Theta", value: sensorData.brain_nervous_system.EEG.theta },
  { category: "Focus", value: sensorData.brain_nervous_system.EEG.focusLevel },
  {
    category: "Stress",
    value: sensorData.brain_nervous_system.EEG.stressLevel,
  },
];

const vitalSignsData = [
  {
    name: "Heart Rate",
    value: sensorData.heart_blood.heartRatePPG.bpm,
    unit: "BPM",
  },
  { name: "SpO₂", value: sensorData.heart_blood.spo2.oxygenPercent, unit: "%" },
  {
    name: "Systolic BP",
    value: sensorData.heart_blood.bloodPressure.systolic,
    unit: "mmHg",
  },
  {
    name: "Diastolic BP",
    value: sensorData.heart_blood.bloodPressure.diastolic,
    unit: "mmHg",
  },
  {
    name: "Resp. Rate",
    value: sensorData.respiration_lungs.respirationRate,
    unit: "/min",
  },
  {
    name: "Body Temp",
    value: sensorData.temperature_sweat.bodyTemperature,
    unit: "°C",
  },
];

export default function HumanSensorDashboard() {
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date(sensorData.timestamp).toLocaleString());
  }, []);

  // Indian Air Force - Advanced Aerospace Theme Colors
  const iafColors = {
    deepSpace: "#0a0e1a",
    cockpitBlue: "#0d1b2a",
    skyBlue: "#1b263b",
    neonCyan: "#00f5ff",
    neonBlue: "#00a8ff",
    hologramGreen: "#00ff88",
    warningOrange: "#ff6b35",
    alertRed: "#ff2e63",
    gold: "#ffd700",
    silver: "#c0c0c0",
    saffron: "#ff9933",
    white: "#ffffff",
    green: "#138808",
  };

  const glassCardStyle = {
    borderRadius: 3,
    background:
      "linear-gradient(145deg, rgba(13, 27, 42, 0.95), rgba(10, 14, 26, 0.98))",
    backdropFilter: "blur(25px)",
    boxShadow:
      "0 8px 32px rgba(0, 245, 255, 0.15), inset 0 1px 0 rgba(0, 245, 255, 0.1), 0 0 60px rgba(0, 168, 255, 0.05)",
    border: "1px solid rgba(0, 245, 255, 0.2)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "2px",
      background:
        "linear-gradient(90deg, transparent, #00f5ff, #00ff88, #00f5ff, transparent)",
      opacity: 0.8,
    },
    "&:hover": {
      transform: "translateY(-4px) scale(1.01)",
      boxShadow:
        "0 16px 48px rgba(0, 245, 255, 0.25), inset 0 1px 0 rgba(0, 245, 255, 0.2), 0 0 80px rgba(0, 168, 255, 0.1)",
      border: "1px solid rgba(0, 245, 255, 0.4)",
    },
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    mb: 2,
    pb: 1,
    borderBottom: "2px solid",
    borderImage: "linear-gradient(90deg, #ff9933, #00f5ff, #138808) 1",
  };

  return (
    <Box
      sx={{
        p: 3,
        background:
          "linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 25%, #1b263b 50%, #0d1b2a 75%, #0a0e1a 100%)",
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(0, 245, 255, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(0, 168, 255, 0.03) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(0, 255, 136, 0.02) 0%, transparent 70%),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 100px,
              rgba(0, 245, 255, 0.02) 100px,
              rgba(0, 245, 255, 0.02) 101px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 100px,
              rgba(0, 245, 255, 0.02) 100px,
              rgba(0, 245, 255, 0.02) 101px
            )
          `,
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "linear-gradient(180deg, rgba(0, 245, 255, 0.05) 0%, transparent 100%)",
          pointerEvents: "none",
        },
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          background:
            "linear-gradient(135deg, #0d1b2a 0%, #1b263b 50%, #0d1b2a 100%)",
          color: "#00f5ff",
          boxShadow:
            "0 10px 40px rgba(0, 245, 255, 0.2), inset 0 1px 0 rgba(0, 245, 255, 0.1)",
          overflow: "hidden",
          position: "relative",
          border: "2px solid rgba(0, 245, 255, 0.3)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background:
              "linear-gradient(90deg, #ff9933, #00f5ff, #00ff88, #00f5ff, #138808)",
            animation: "scanline 3s linear infinite",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 15,
            right: 15,
            width: 80,
            height: 80,
            opacity: 0.6,
            animation: "pulse 2s ease-in-out infinite",
          },
          "@keyframes scanline": {
            "0%": {
              background:
                "linear-gradient(90deg, #ff9933, #00f5ff, #00ff88, #00f5ff, #138808)",
            },
            "50%": {
              background:
                "linear-gradient(90deg, #138808, #00f5ff, #00ff88, #00f5ff, #ff9933)",
            },
            "100%": {
              background:
                "linear-gradient(90deg, #ff9933, #00f5ff, #00ff88, #00f5ff, #138808)",
            },
          },
          "@keyframes pulse": {
            "0%, 100%": { opacity: 0.6, transform: "scale(1)" },
            "50%": { opacity: 0.9, transform: "scale(1.05)" },
          },
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1, py: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Box
                sx={{
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #d4af37, rgba(212, 175, 55, 0.3))",
                    zIndex: -1,
                  },
                }}
              >
                <Image
                  src={employeeImage}
                  alt={employeeData.name}
                  width={90}
                  height={90}
                  style={{
                    borderRadius: "50%",
                    border: "4px solid #d4af37",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  color: "#c3b091",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                {employeeData.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(195, 176, 145, 0.9)", mt: 0.5 }}
              >
                {employeeData.position} | {employeeData.department}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(195, 176, 145, 0.75)", mt: 0.5 }}
              >
                ID: {employeeData.employeeNumber} | Team:{" "}
                {employeeData.currentTask}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: "auto" }}>
              <Chip
                label={employeeData.employmentStatus}
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: "24px 20px",
                  background:
                    "linear-gradient(135deg, #138808 0%, #0d5c06 100%)",
                  color: "#ffffff",
                  boxShadow: "0 4px 15px rgba(19, 136, 8, 0.4)",
                  border: "2px solid rgba(212, 175, 55, 0.5)",
                  "& .MuiChip-label": {
                    px: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {vitalSignsData.map((vital, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card
                  sx={{
                    ...glassCardStyle,
                    background: `linear-gradient(135deg, ${
                      idx === 0
                        ? "#8b0000, #5c1010"
                        : idx === 1
                        ? "#1e3a5f, #0d1f33"
                        : idx === 2
                        ? "#2d5016, #1a2f0d"
                        : idx === 3
                        ? "#4a3728, #2d2118"
                        : idx === 4
                        ? "#1a3d3d, #0d1f1f"
                        : "#3d4a2d, #2d3524"
                    })`,
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{
                        color: "#d4af37",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        fontSize: "0.65rem",
                      }}
                    >
                      {vital.name}
                    </Typography>
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{
                        my: 1,
                        color: "#c3b091",
                        textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
                      }}
                    >
                      {vital.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(195, 176, 145, 0.7)" }}
                    >
                      {vital.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ ...glassCardStyle }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    color: "#00f5ff",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  🛡️ BIOMETRIC HOLOGRAM
                </Typography>
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "450px",
                  background:
                    "radial-gradient(ellipse at center, #0d1b2a 0%, #0a0e1a 50%, #000000 100%)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  border: "2px solid rgba(0, 245, 255, 0.3)",
                  boxShadow: "inset 0 0 100px rgba(0, 245, 255, 0.1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    inset: 0,
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        rgba(0, 245, 255, 0.03) 2px,
                        rgba(0, 245, 255, 0.03) 4px
                      )
                    `,
                    animation: "scanlines 8s linear infinite",
                    "@keyframes scanlines": {
                      "0%": { transform: "translateY(0)" },
                      "100%": { transform: "translateY(100%)" },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: "320px",
                    height: "320px",
                    border: "2px solid rgba(0, 245, 255, 0.3)",
                    borderRadius: "50%",
                    animation: "rotate 20s linear infinite",
                    "@keyframes rotate": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -5,
                      left: "50%",
                      width: 10,
                      height: 10,
                      background: "#00f5ff",
                      borderRadius: "50%",
                      boxShadow: "0 0 20px #00f5ff",
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    width: "280px",
                    height: "280px",
                    border: "1px dashed rgba(0, 255, 136, 0.4)",
                    borderRadius: "50%",
                    animation: "rotateReverse 15s linear infinite",
                    "@keyframes rotateReverse": {
                      "0%": { transform: "rotate(360deg)" },
                      "100%": { transform: "rotate(0deg)" },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    width: "360px",
                    height: "360px",
                    border: "1px solid rgba(255, 153, 51, 0.2)",
                    borderRadius: "50%",
                    animation: "rotate 25s linear infinite",
                  }}
                />

                <Box
                  sx={{
                    position: "relative",
                    textAlign: "center",
                    zIndex: 10,
                    animation: `${
                      sensorData.emotion_ai.stressLevel > 50
                        ? "alertFloat"
                        : "smoothFloat"
                    } 3s ease-in-out infinite`,
                    "@keyframes smoothFloat": {
                      "0%, 100%": { transform: "translateY(0) scale(1)" },
                      "50%": { transform: "translateY(-15px) scale(1.02)" },
                    },
                    "@keyframes alertFloat": {
                      "0%, 100%": { transform: "translateX(0)" },
                      "25%": { transform: "translateX(-8px)" },
                      "75%": { transform: "translateX(8px)" },
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "200px",
                      height: "200px",
                      background:
                        "radial-gradient(circle, rgba(0,245,255,0.3) 0%, transparent 70%)",
                      borderRadius: "50%",
                      filter: "blur(20px)",
                      animation: "glowPulse 2s ease-in-out infinite",
                      "@keyframes glowPulse": {
                        "0%, 100%": {
                          opacity: 0.5,
                          transform: "translate(-50%, -50%) scale(1)",
                        },
                        "50%": {
                          opacity: 1,
                          transform: "translate(-50%, -50%) scale(1.2)",
                        },
                      },
                    }}
                  />

                  <Box
                    sx={{
                      position: "relative",
                      width: "180px",
                      height: "180px",
                      margin: "0 auto",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #00f5ff, #00ff88, #ff9933)",
                      padding: "4px",
                      boxShadow:
                        "0 0 40px rgba(0, 245, 255, 0.5), 0 0 80px rgba(0, 255, 136, 0.3)",
                      animation: "borderRotate 4s linear infinite",
                      "@keyframes borderRotate": {
                        "0%": { filter: "hue-rotate(0deg)" },
                        "100%": { filter: "hue-rotate(360deg)" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        overflow: "hidden",
                        background: "#0a0e1a",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={employeeImage}
                        alt={employeeData.name}
                        width={172}
                        height={172}
                        style={{
                          borderRadius: "50%",
                          objectFit: "cover",
                          filter: "contrast(1.1) brightness(1.1)",
                        }}
                      />
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      top: "35%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "25px",
                      height: "25px",
                      background:
                        "radial-gradient(circle, #ff2e63 0%, transparent 70%)",
                      borderRadius: "50%",
                      boxShadow: "0 0 30px rgba(255, 46, 99, 0.8)",
                      animation: `heartbeat ${
                        60 / sensorData.heart_blood.heartRatePPG.bpm
                      }s ease-in-out infinite`,
                      "@keyframes heartbeat": {
                        "0%, 100%": {
                          transform: "translate(-50%, -50%) scale(1)",
                          opacity: 1,
                        },
                        "50%": {
                          transform: "translate(-50%, -50%) scale(1.5)",
                          opacity: 0.6,
                        },
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    color: "#00f5ff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    ┌─ LOCATION DATA ─────────
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "#00ff88",
                    }}
                  >
                    LAT: {sensorData.location.gps.latitude}° N
                  </Typography>
                  <br />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "#00ff88",
                    }}
                  >
                    LON: {sensorData.location.gps.longitude}° E
                  </Typography>
                  <br />
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "#ff9933",
                    }}
                  >
                    ALT: {sensorData.location.gps.altitude}m MSL
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    textAlign: "right",
                    color: "#00f5ff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    ───────── SYSTEM ─┐
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "#00ff88",
                    }}
                  >
                    SIGNAL: ████████ 98%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    color: "#00f5ff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    └─ VITALS ───────────────
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          color: "#ff2e63",
                        }}
                      >
                        ♥ HR
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          color: "#ff2e63",
                        }}
                      >
                        {sensorData.heart_blood.heartRatePPG.bpm}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          color: "#00ff88",
                        }}
                      >
                        O₂
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          color: "#00ff88",
                        }}
                      >
                        {sensorData.heart_blood.spo2.oxygenPercent}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          color: "#ff9933",
                        }}
                      >
                        TEMP
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          color: "#ff9933",
                        }}
                      >
                        {sensorData.temperature_sweat.bodyTemperature}°
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 20,
                    right: 20,
                    textAlign: "right",
                    color: "#00f5ff",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      display: "block",
                    }}
                  >
                    ──────── MISSION ─┘
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.65rem",
                      color: "#ff9933",
                    }}
                  >
                    TASK: {employeeData.currentTask}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background:
                      "linear-gradient(90deg, transparent, #00f5ff, transparent)",
                    animation: "scanLine 3s linear infinite",
                    "@keyframes scanLine": {
                      "0%": { top: "0%" },
                      "100%": { top: "100%" },
                    },
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: "rgba(0, 245, 255, 0.2)" }} />

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(255, 46, 99, 0.1)",
                      border: "1px solid rgba(255, 46, 99, 0.3)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ff2e63",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                      }}
                    >
                      ♥ Heart Rate
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#ff2e63" }}
                    >
                      {sensorData.heart_blood.heartRatePPG.bpm}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 46, 99, 0.7)" }}
                    >
                      BPM
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(255, 153, 51, 0.1)",
                      border: "1px solid rgba(255, 153, 51, 0.3)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#ff9933",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                      }}
                    >
                      ⚡ Stress Level
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#ff9933" }}
                    >
                      {sensorData.emotion_ai.stressLevel}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255, 153, 51, 0.7)" }}
                    >
                      INDEX
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(0, 255, 136, 0.1)",
                      border: "1px solid rgba(0, 255, 136, 0.3)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#00ff88",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                      }}
                    >
                      🎯 Movement
                    </Typography>
                    <Chip
                      label={
                        sensorData.touch_motion.touch.contact
                          ? "ACTIVE"
                          : "STANDBY"
                      }
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: sensorData.touch_motion.touch.contact
                          ? "rgba(0, 255, 136, 0.2)"
                          : "rgba(100,100,100,0.2)",
                        color: sensorData.touch_motion.touch.contact
                          ? "#00ff88"
                          : "#888",
                        border: `1px solid ${
                          sensorData.touch_motion.touch.contact
                            ? "#00ff88"
                            : "#555"
                        }`,
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(0, 245, 255, 0.1)",
                      border: "1px solid rgba(0, 245, 255, 0.3)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#00f5ff",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                        fontWeight: "bold",
                      }}
                    >
                      🧠 Mental State
                    </Typography>
                    <Chip
                      label={sensorData.emotion_ai.emotionState}
                      size="small"
                      sx={{
                        mt: 0.5,
                        background: "rgba(0, 245, 255, 0.2)",
                        color: "#00f5ff",
                        border: "1px solid rgba(0, 245, 255, 0.5)",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <PsychologyIcon sx={{ mr: 1, color: "#9c27b0" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Brain & Nervous System
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={brainActivityData}>
                  <PolarGrid stroke="rgba(102, 126, 234, 0.3)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#666", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "#999", fontSize: 10 }}
                  />
                  <Radar
                    name="Brain Activity"
                    dataKey="value"
                    stroke="#667eea"
                    fill="url(#brainGradient)"
                    fillOpacity={0.7}
                  />
                  <defs>
                    <linearGradient
                      id="brainGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#764ba2"
                        stopOpacity={0.3}
                      />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    Focus Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.focusLevel}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(102, 126, 234, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #667eea, #764ba2)",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="primary"
                  >
                    {sensorData.brain_nervous_system.EEG.focusLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    Stress Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.stressLevel}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(255, 152, 0, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #ff9800, #f44336)",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    {sensorData.brain_nervous_system.EEG.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    Muscle Activity
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EMG.muscleActivity}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #4caf50, #8bc34a)",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="success.main"
                  >
                    {sensorData.brain_nervous_system.EMG.muscleActivity}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    Alertness
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EOG.alertnessScore}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: "rgba(33, 150, 243, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #2196f3, #03a9f4)",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    color="info.main"
                  >
                    {sensorData.brain_nervous_system.EOG.alertnessScore}%
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Cognitive Load: ${sensorData.brain_nervous_system.fNIRS.cognitiveLoad}`}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white",
                  }}
                />
                <Chip
                  label={`Sleep State: ${sensorData.brain_nervous_system.EEG.sleepState}`}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #00b894, #00cec9)",
                    color: "white",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#d4af37", letterSpacing: 1 }}
                >
                  ❤️ Heart MONITOR
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={heartWave}>
                  <defs>
                    <linearGradient
                      id="heartGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#8b0000" stopOpacity={0.8} />
                      <stop
                        offset="100%"
                        stopColor="#ff9933"
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(212, 175, 55, 0.2)"
                  />
                  <XAxis
                    dataKey="t"
                    tick={{ fontSize: 10, fill: "#c3b091" }}
                    stroke="rgba(212, 175, 55, 0.3)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#c3b091" }}
                    stroke="rgba(212, 175, 55, 0.3)"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(26, 31, 22, 0.95)",
                      borderRadius: 4,
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      color: "#c3b091",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#8b0000"
                    strokeWidth={3}
                    dot={false}
                    fill="url(#heartGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2, borderColor: "rgba(212, 175, 55, 0.3)" }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 1.5,
                      background:
                        "linear-gradient(135deg, rgba(139,0,0,0.2), rgba(139,0,0,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(139,0,0,0.4)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#8b0000" }}
                    >
                      {sensorData.heart_blood.heartRatePPG.bpm}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                      }}
                    >
                      Heart Rate (BPM)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 1.5,
                      background:
                        "linear-gradient(135deg, rgba(30,58,95,0.3), rgba(30,58,95,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(30,58,95,0.4)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#3d6a9f" }}
                    >
                      {sensorData.heart_blood.spo2.oxygenPercent}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                      }}
                    >
                      SpO₂
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      textAlign: "center",
                      p: 1.5,
                      background:
                        "linear-gradient(135deg, rgba(19,136,8,0.2), rgba(19,136,8,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(19,136,8,0.4)",
                    }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: "#138808" }}
                    >
                      {sensorData.heart_blood.bloodPressure.systolic}/
                      {sensorData.heart_blood.bloodPressure.diastolic}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                      }}
                    >
                      BP (mmHg)
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  gap: 1,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <Chip
                  label={`⚡ ECG: ${sensorData.heart_blood.ECG.rhythm}`}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #138808, #0d5c06)",
                    color: "#c3b091",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                  }}
                />
                <Chip
                  label={`📊 HRV: ${sensorData.heart_blood.hrv.rmssd} ms`}
                  size="small"
                  sx={{
                    background: "linear-gradient(135deg, #1e3a5f, #0d1f33)",
                    color: "#d4af37",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Respiration & Lungs - Field Oxygen */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#d4af37", letterSpacing: 1 }}
                >
                  🫁 RESPIRATORY FIELD MONITOR
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(30,58,95,0.3), rgba(30,58,95,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(30,58,95,0.4)",
                    }}
                  >
                    <Typography
                      variant="h2"
                      fontWeight="bold"
                      sx={{ color: "#3d6a9f" }}
                    >
                      {sensorData.respiration_lungs.respirationRate}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                      }}
                    >
                      Breaths per Minute
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(212, 175, 55, 0.08)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#d4af37",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                      }}
                    >
                      Airflow Volume
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "#c3b091" }}
                    >
                      {sensorData.respiration_lungs.airflow.volume} L/min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(212, 175, 55, 0.08)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#d4af37",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.65rem",
                      }}
                    >
                      Lung Capacity
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: "#c3b091" }}
                    >
                      {sensorData.respiration_lungs.spirometer.lungCapacity} L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d4af37",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    Exhaled CO₂
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (sensorData.respiration_lungs.co2.exhaledCO2 / 50) * 100
                    }
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "rgba(30, 58, 95, 0.2)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #1e3a5f, #3d6a9f)",
                        borderRadius: 6,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    fontWeight="bold"
                    sx={{ color: "#3d6a9f" }}
                  >
                    {sensorData.respiration_lungs.co2.exhaledCO2} mmHg
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature & Sweat - Environmental Adaptation */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <ThermostatIcon sx={{ mr: 1, color: "#ff9933" }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#d4af37", letterSpacing: 1 }}
                >
                  THERMAL ADAPTATION UNIT
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(255,153,51,0.2), rgba(255,153,51,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(255,153,51,0.4)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#ff9933" }}
                    >
                      {sensorData.temperature_sweat.bodyTemperature}°C
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                      }}
                    >
                      Core Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1))",
                      borderRadius: 2,
                      border: "1px solid rgba(212,175,55,0.4)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#d4af37" }}
                    >
                      {sensorData.temperature_sweat.skinTemperature}°C
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#c3b091",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        fontSize: "0.6rem",
                      }}
                    >
                      Surface Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(212, 175, 55, 0.3)" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d4af37",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    GSR/EDA Readings
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, color: "#c3b091" }}
                  >
                    Conductance:{" "}
                    <strong>
                      {sensorData.temperature_sweat.gsrEda.conductance} µS
                    </strong>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.temperature_sweat.gsrEda.stressLevel}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      my: 1,
                      backgroundColor: "rgba(255, 153, 51, 0.1)",
                      "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #ff9933, #8b0000)",
                        borderRadius: 5,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: "#ff9933", fontWeight: "bold" }}
                  >
                    Combat Stress:{" "}
                    {sensorData.temperature_sweat.gsrEda.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#d4af37",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    Sweat Analysis
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mt: 0.5, color: "#c3b091" }}
                  >
                    Sodium:{" "}
                    <strong>
                      {sensorData.temperature_sweat.sweatSensor.sodiumLevel}{" "}
                      mmol/L
                    </strong>
                  </Typography>
                  <Chip
                    label={`💧 Hydration: ${sensorData.temperature_sweat.sweatSensor.hydrationStatus}`}
                    size="small"
                    sx={{
                      mt: 1,
                      background: "linear-gradient(135deg, #138808, #0d5c06)",
                      color: "#c3b091",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emotion & AI Analysis - Psychological Ops */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...glassCardStyle,
              height: "100%",
              background:
                "linear-gradient(135deg, rgba(45, 53, 36, 0.95), rgba(74, 55, 40, 0.9))",
            }}
          >
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <PsychologyIcon sx={{ mr: 1, color: "#d4af37" }} />
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: "#d4af37", letterSpacing: 1 }}
                >
                   PSYCH-OPS ANALYSIS
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", my: 3 }}>
                <Typography
                  variant="h2"
                  fontWeight="bold"
                  sx={{
                    background: "linear-gradient(135deg, #d4af37, #ff9933)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {sensorData.emotion_ai.emotionState}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#c3b091",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Current Mental State
                </Typography>
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Chip
                    label={`⚠️ Stress: ${sensorData.emotion_ai.stressLevel}`}
                    sx={{
                      width: "100%",
                      py: 2,
                      background: "linear-gradient(135deg, #ff9933, #8b0000)",
                      color: "#fff",
                      fontWeight: "bold",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`😴 Fatigue: ${sensorData.emotion_ai.fatigueIndex}%`}
                    sx={{
                      width: "100%",
                      py: 2,
                      background: "linear-gradient(135deg, #1e3a5f, #0d1f33)",
                      color: "#d4af37",
                      fontWeight: "bold",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`😟 Anxiety: ${sensorData.emotion_ai.anxietyScore}%`}
                    sx={{
                      width: "100%",
                      py: 2,
                      background: "linear-gradient(135deg, #4a3728, #2d2118)",
                      color: "#c3b091",
                      fontWeight: "bold",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={
                      sensorData.emotion_ai.panicDetected
                        ? "🚨 ALERT: PANIC"
                        : "✅ COMBAT READY"
                    }
                    sx={{
                      width: "100%",
                      py: 2,
                      background: sensorData.emotion_ai.panicDetected
                        ? "linear-gradient(135deg, #8b0000, #5c1010)"
                        : "linear-gradient(135deg, #138808, #0d5c06)",
                      color: "#fff",
                      fontWeight: "bold",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Blood & Biochemical - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <BloodtypeIcon sx={{ mr: 1, color: "#c62828" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Blood & Biochemical
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={180} color="white">
                <BarChart
                  data={[
                    {
                      name: "Glucose",
                      value: sensorData.blood_biochemical.glucose.value,
                      normal: 100,
                    },
                    {
                      name: "Lactate",
                      value: sensorData.blood_biochemical.lactate.value * 10,
                      normal: 20,
                    },
                    {
                      name: "Cholesterol",
                      value: sensorData.blood_biochemical.cholesterol.value,
                      normal: 200,
                    },
                    {
                      name: "Hemoglobin",
                      value: sensorData.blood_biochemical.hemoglobin.value * 10,
                      normal: 140,
                    },
                  ]}
                >
                  <defs>
                    <linearGradient
                      id="valueGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#764ba2"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                    <linearGradient
                      id="normalGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#00b894" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#00cec9"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(0,0,0,0.1)"
                  />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="value"
                    fill="url(#valueGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="normal"
                    fill="url(#normalGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(102, 126, 234, 0.08)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Glucose
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {sensorData.blood_biochemical.glucose.value} mg/dL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(102, 126, 234, 0.08)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Cholesterol
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {sensorData.blood_biochemical.cholesterol.value} mg/dL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(102, 126, 234, 0.08)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Lactate
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {sensorData.blood_biochemical.lactate.value} mmol/L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      background: "rgba(102, 126, 234, 0.08)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Hemoglobin
                    </Typography>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color="primary"
                    >
                      {sensorData.blood_biochemical.hemoglobin.value} g/dL
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ ...glassCardStyle }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <MicIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Voice & Audio Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)",
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
                      {sensorData.audio_voice.pitch.hz}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Pitch (Hz)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(76,175,80,0.2)",
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      sx={{ color: "#4caf50" }}
                    >
                      {sensorData.audio_voice.speechRate.wordsPerMinute}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Words Per Minute
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)",
                    }}
                  >
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      sx={{ color: "#2196f3" }}
                    >
                      {sensorData.audio_voice.energy.db}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Energy (dB)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    <Chip
                      label={`🎭 Emotion: ${sensorData.audio_voice.voiceEmotionModel.emotion}`}
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`🎙️ Voice: ${
                        sensorData.audio_voice.microphone.voiceDetected
                          ? "Detected"
                          : "Not Detected"
                      }`}
                      sx={{
                        background: "linear-gradient(135deg, #00b894, #00cec9)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`⏸️ Pause: ${sensorData.audio_voice.silence.pauseDuration}s`}
                      sx={{
                        background: "linear-gradient(135deg, #0984e3, #74b9ff)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`😰 Stress: ${(
                        sensorData.audio_voice.voiceEmotionModel
                          .stressProbability * 100
                      ).toFixed(0)}%`}
                      sx={{
                        background: "linear-gradient(135deg, #ff9800, #f44336)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <ScienceIcon sx={{ mr: 1, color: "#388e3c" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Chemical & Sensory Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
                      {sensorData.smell_taste_chemical.gasSensor.smellIntensity}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Smell Intensity
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(76,175,80,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#4caf50" }}
                    >
                      {sensorData.smell_taste_chemical.phSensor.phValue}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      pH Value
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,193,7,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(255,152,0,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#ff9800" }}
                    >
                      {
                        sensorData.smell_taste_chemical.salivaSensor
                          .cortisolLevel
                      }
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Cortisol (µg/dL)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#2196f3" }}
                    >
                      {sensorData.smell_taste_chemical.breathSensor.ketoneLevel}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Ketone Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box
                    sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}
                  >
                    <Chip
                      label={`👅 Taste: ${sensorData.smell_taste_chemical.chemicalSensor.tasteProfile}`}
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`🍺 Alcohol: ${sensorData.smell_taste_chemical.breathSensor.alcoholLevel}`}
                      sx={{
                        background:
                          sensorData.smell_taste_chemical.breathSensor
                            .alcoholLevel === 0.0
                            ? "linear-gradient(135deg, #00b894, #00cec9)"
                            : "linear-gradient(135deg, #f44336, #d32f2f)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <Typography variant="h6" fontWeight="bold" color="white">
                  👁️ Vision & Eye Tracking
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(156,39,176,0.1), rgba(103,58,183,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(156,39,176,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#9c27b0" }}
                    >
                      {sensorData.vision_eye.irEyeTracker.focusLevel}%
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Focus Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#667eea" }}
                    >
                      {sensorData.vision_eye.pupilSensor.dilation}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Pupil (mm)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card
                    sx={{
                      p: 2,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)",
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ color: "#2196f3" }}
                    >
                      {sensorData.vision_eye.blinkRate.blinksPerMinute}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Blinks/Min
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`👤 Face: ${
                        sensorData.vision_eye.camera.faceDetected
                          ? "Detected"
                          : "Not Detected"
                      }`}
                      sx={{
                        background: "linear-gradient(135deg, #00b894, #00cec9)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`😊 Emotion: ${sensorData.vision_eye.camera.emotion}`}
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`😫 Fatigue: ${sensorData.vision_eye.blinkRate.fatigueScore}%`}
                      sx={{
                        background: "linear-gradient(135deg, #ff9800, #f44336)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <TouchAppIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold" color="white">
                  Touch & Motion
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(102, 126, 234, 0.08)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Pressure Force
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {sensorData.touch_motion.pressure.force} N
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(76, 175, 80, 0.08)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Load
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {sensorData.touch_motion.fsr.load} kg
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: "rgba(255, 152, 0, 0.08)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="white"
                      fontWeight="bold"
                    >
                      Tremor
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {sensorData.touch_motion.vibration.tremorLevel}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    📊 Accelerometer
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`X: ${sensorData.touch_motion.accelerometer.x}`}
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.15)",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`Y: ${sensorData.touch_motion.accelerometer.y}`}
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.15)",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`Z: ${sensorData.touch_motion.accelerometer.z}`}
                      size="small"
                      sx={{
                        background: "rgba(102, 126, 234, 0.15)",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="white"
                    fontWeight="bold"
                  >
                    🔄 Gyroscope
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`Roll: ${sensorData.touch_motion.gyroscope.roll}°`}
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`Pitch: ${sensorData.touch_motion.gyroscope.pitch}°`}
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`Yaw: ${sensorData.touch_motion.gyroscope.yaw}°`}
                      size="small"
                      sx={{
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`👆 Touch: ${
                        sensorData.touch_motion.touch.contact
                          ? "Active"
                          : "Inactive"
                      }`}
                      sx={{
                        background: sensorData.touch_motion.touch.contact
                          ? "linear-gradient(135deg, #00b894, #00cec9)"
                          : "rgba(0,0,0,0.1)",
                        color: sensorData.touch_motion.touch.contact
                          ? "white"
                          : "text.secondary",
                        fontWeight: "bold",
                      }}
                    />
                    <Chip
                      label={`🧭 Heading: ${sensorData.touch_motion.magnetometer.heading}°`}
                      sx={{
                        background: "linear-gradient(135deg, #0984e3, #74b9ff)",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
     

      <Box
        sx={{
          mt: 4,
          py: 2,
          textAlign: "center",
          borderRadius: 3,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}
        >
          🕐 Last Updated: {lastUpdated} | 👤 User ID: {sensorData.userId}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5, display: "block" }}
        >
          Real-time biometric monitoring powered by advanced sensor technology
        </Typography>
      </Box>
    </Box>
  );
}
