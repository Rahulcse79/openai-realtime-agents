"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PsychologyIcon from "@mui/icons-material/Psychology";
import MicIcon from "@mui/icons-material/Mic";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
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

  const glassCardStyle = {
    borderRadius: 4,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
    },
  };

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    mb: 2,
    pb: 1,
    borderBottom: "2px solid",
    borderImage: "linear-gradient(90deg, #667eea, #764ba2) 1",
  };

  return (
    <Box
      sx={{
        p: 3,
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Employee Profile Card */}
      <Card
        sx={{
          borderRadius: 4,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "white",
          boxShadow: "0 10px 40px rgba(102, 126, 234, 0.4)",
          overflow: "hidden",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at top right, rgba(255,255,255,0.2) 0%, transparent 60%)",
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
                    background: "linear-gradient(135deg, #fff, rgba(255,255,255,0.3))",
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
                    border: "4px solid white",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs>
              <Typography variant="h4" fontWeight="bold" sx={{ textShadow: "2px 2px 4px rgba(0,0,0,0.2)" }}>
                {employeeData.name}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, mt: 0.5 }}>
                🎯 {employeeData.position} | 🏢 {employeeData.department}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
                🆔 {employeeData.employeeNumber} | 📋 {employeeData.currentTask}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: 'auto' }}>
              <Chip
                label={employeeData.employmentStatus}
                sx={{ 
                  fontWeight: "bold",
                  fontSize: "1rem",
                  padding: "24px 20px",
                  background: "linear-gradient(135deg, #00b894 0%, #00cec9 100%)",
                  color: "white",
                  boxShadow: "0 4px 15px rgba(0, 184, 148, 0.4)",
                  border: "2px solid rgba(255,255,255,0.3)",
                  "& .MuiChip-label": {
                    px: 2,
                  },
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Dashboard Title */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ 
            color: "white", 
            textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
            background: "linear-gradient(90deg, #0066ff, #00b4d8, #48cae4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          🧠 Human Sensor Monitoring Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
          Real-time biometric and physiological monitoring system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Vital Signs Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {vitalSignsData.map((vital, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card
                  sx={{
                    ...glassCardStyle,
                    background: `linear-gradient(135deg, ${
                      idx === 0 ? '#ff6b6b, #ee5a24' :
                      idx === 1 ? '#4facfe, #00f2fe' :
                      idx === 2 ? '#43e97b, #38f9d7' :
                      idx === 3 ? '#fa709a, #fee140' :
                      idx === 4 ? '#a8edea, #fed6e3' :
                      '#667eea, #764ba2'
                    })`,
                    color: "white",
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ opacity: 0.9, textTransform: "uppercase", letterSpacing: 1 }}
                    >
                      {vital.name}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ my: 1, textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}>
                      {vital.value}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.85 }}>
                      {vital.unit}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* 3D Human Model Visualization */}
        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PsychologyIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🧍 3D Human Model
                </Typography>
              </Box>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  height: "350px",
                  background: "linear-gradient(135deg, #434343 0%, #000000 100%)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {/* Animated 3D Avatar */}
                <Box
                  sx={{
                    textAlign: "center",
                    animation: `${sensorData.emotion_ai.stressLevel > 50 ? 'shake' : 'breathe'} 2s ease-in-out infinite`,
                    "@keyframes breathe": {
                      "0%, 100%": { transform: "scale(1) translateY(0)" },
                      "50%": { transform: "scale(1.05) translateY(-10px)" },
                    },
                    "@keyframes shake": {
                      "0%, 100%": { transform: "translateX(0)" },
                      "25%": { transform: "translateX(-5px)" },
                      "75%": { transform: "translateX(5px)" },
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "150px",
                      filter: `hue-rotate(${sensorData.heart_blood.heartRatePPG.bpm * 2}deg)`,
                    }}
                  >
                    🧍
                  </Typography>
                  
                  {/* Heart Beat Indicator */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "40%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "30px",
                      height: "30px",
                      bgcolor: "red",
                      borderRadius: "50%",
                      animation: `heartbeat ${60 / sensorData.heart_blood.heartRatePPG.bpm}s ease-in-out infinite`,
                      "@keyframes heartbeat": {
                        "0%, 100%": { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
                        "50%": { transform: "translate(-50%, -50%) scale(1.3)", opacity: 0.7 },
                      },
                    }}
                  />
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Real-time Metrics */}
              <Grid container spacing={1}>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">
                    Heart Rate
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="error">
                    {sensorData.heart_blood.heartRatePPG.bpm} BPM
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">
                    Stress Level
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="warning.main">
                    {sensorData.emotion_ai.stressLevel}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">
                    Movement
                  </Typography>
                  <Chip 
                    label={sensorData.touch_motion.touch.contact ? "Active" : "Inactive"} 
                    size="small"
                    color={sensorData.touch_motion.touch.contact ? "success" : "default"}
                  />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="caption" color="text.secondary">
                    Emotion
                  </Typography>
                  <Chip 
                    label={sensorData.emotion_ai.emotionState} 
                    size="small"
                    color="primary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Brain & Nervous System - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <PsychologyIcon sx={{ mr: 1, color: "#9c27b0" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🧠 Brain & Nervous System
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={brainActivityData}>
                  <PolarGrid stroke="rgba(102, 126, 234, 0.3)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#666', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#999', fontSize: 10 }} />
                  <Radar
                    name="Brain Activity"
                    dataKey="value"
                    stroke="#667eea"
                    fill="url(#brainGradient)"
                    fillOpacity={0.7}
                  />
                  <defs>
                    <linearGradient id="brainGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#764ba2" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255,255,255,0.95)', 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                </RadarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Focus Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.focusLevel}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #667eea, #764ba2)',
                        borderRadius: 5,
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" color="primary">
                    {sensorData.brain_nervous_system.EEG.focusLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Stress Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.stressLevel}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #ff9800, #f44336)',
                        borderRadius: 5,
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" color="warning.main">
                    {sensorData.brain_nervous_system.EEG.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Muscle Activity
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EMG.muscleActivity}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                        borderRadius: 5,
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" color="success.main">
                    {sensorData.brain_nervous_system.EMG.muscleActivity}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Alertness
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EOG.alertnessScore}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5,
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #2196f3, #03a9f4)',
                        borderRadius: 5,
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" color="info.main">
                    {sensorData.brain_nervous_system.EOG.alertnessScore}%
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`Cognitive Load: ${sensorData.brain_nervous_system.fNIRS.cognitiveLoad}`}
                  size="small"
                  sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}
                />
                <Chip
                  label={`Sleep State: ${sensorData.brain_nervous_system.EEG.sleepState}`}
                  size="small"
                  sx={{ background: "linear-gradient(135deg, #00b894, #00cec9)", color: "white" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Heart & Blood System - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <FavoriteIcon sx={{ mr: 1, color: "#e91e63" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  ❤️ Heart & Blood System
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={heartWave}>
                  <defs>
                    <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ee5a24" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#999" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255,255,255,0.95)', 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#ff6b6b"
                    strokeWidth={3}
                    dot={false}
                    fill="url(#heartGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      textAlign: "center", 
                      p: 1.5, 
                      background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(238,90,36,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(255,107,107,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#e91e63" }}>
                      {sensorData.heart_blood.heartRatePPG.bpm}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Heart Rate (BPM)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      textAlign: "center", 
                      p: 1.5, 
                      background: "linear-gradient(135deg, rgba(79,172,254,0.1), rgba(0,242,254,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(79,172,254,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#2196f3" }}>
                      {sensorData.heart_blood.spo2.oxygenPercent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      SpO₂
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      textAlign: "center", 
                      p: 1.5, 
                      background: "linear-gradient(135deg, rgba(67,233,123,0.1), rgba(56,249,215,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(67,233,123,0.2)"
                    }}
                  >
                    <Typography variant="h5" fontWeight="bold" sx={{ color: "#4caf50" }}>
                      {sensorData.heart_blood.bloodPressure.systolic}/{sensorData.heart_blood.bloodPressure.diastolic}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      BP (mmHg)
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                <Chip
                  label={`ECG: ${sensorData.heart_blood.ECG.rhythm}`}
                  size="small"
                  sx={{ background: "linear-gradient(135deg, #00b894, #00cec9)", color: "white" }}
                />
                <Chip
                  label={`HRV: ${sensorData.heart_blood.hrv.rmssd} ms`}
                  size="small"
                  sx={{ background: "linear-gradient(135deg, #0984e3, #74b9ff)", color: "white" }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Respiration & Lungs - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <AirIcon sx={{ mr: 1, color: "#00bcd4" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🫁 Respiration & Lungs
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card
                    sx={{ 
                      p: 2, 
                      textAlign: "center", 
                      background: "linear-gradient(135deg, rgba(79,172,254,0.15), rgba(0,242,254,0.15))",
                      borderRadius: 3,
                      border: "1px solid rgba(79,172,254,0.3)"
                    }}
                  >
                    <Typography variant="h2" fontWeight="bold" sx={{ color: "#0097a7" }}>
                      {sensorData.respiration_lungs.respirationRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold">
                      Breaths per Minute
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: "rgba(0, 188, 212, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Airflow Volume
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {sensorData.respiration_lungs.airflow.volume} L/min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: "rgba(0, 188, 212, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Lung Capacity
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {sensorData.respiration_lungs.spirometer.lungCapacity} L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Exhaled CO₂
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={(sensorData.respiration_lungs.co2.exhaledCO2 / 50) * 100}
                    sx={{ 
                      height: 12, 
                      borderRadius: 6,
                      backgroundColor: 'rgba(0, 188, 212, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #00bcd4, #26c6da)',
                        borderRadius: 6,
                      }
                    }}
                  />
                  <Typography variant="caption" fontWeight="bold" color="info.main">
                    {sensorData.respiration_lungs.co2.exhaledCO2} mmHg
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature & Sweat - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <ThermostatIcon sx={{ mr: 1, color: "#f44336" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🌡️ Temperature & Sweat
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card
                    sx={{ 
                      p: 2, 
                      textAlign: "center", 
                      background: "linear-gradient(135deg, rgba(244,67,54,0.1), rgba(255,87,34,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(244,67,54,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#f44336" }}>
                      {sensorData.temperature_sweat.bodyTemperature}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Body Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card
                    sx={{ 
                      p: 2, 
                      textAlign: "center", 
                      background: "linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,193,7,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(255,152,0,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9800" }}>
                      {sensorData.temperature_sweat.skinTemperature}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Skin Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    GSR/EDA Readings
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Conductance: <strong>{sensorData.temperature_sweat.gsrEda.conductance} µS</strong>
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.temperature_sweat.gsrEda.stressLevel}
                    sx={{ 
                      height: 10, 
                      borderRadius: 5, 
                      my: 1,
                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #ff9800, #f44336)',
                        borderRadius: 5,
                      }
                    }}
                  />
                  <Typography variant="caption" color="warning.main" fontWeight="bold">
                    Stress Level: {sensorData.temperature_sweat.gsrEda.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    Sweat Analysis
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Sodium: <strong>{sensorData.temperature_sweat.sweatSensor.sodiumLevel} mmol/L</strong>
                  </Typography>
                  <Chip
                    label={`Hydration: ${sensorData.temperature_sweat.sweatSensor.hydrationStatus}`}
                    size="small"
                    sx={{ 
                      mt: 1, 
                      background: "linear-gradient(135deg, #00b894, #00cec9)", 
                      color: "white" 
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Emotion & AI Analysis - Left */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              ...glassCardStyle,
              height: "100%",
              background: "linear-gradient(135deg, rgba(255,236,210,0.9) 0%, rgba(252,182,159,0.9) 100%)",
            }}
          >
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <PsychologyIcon sx={{ mr: 1, color: "#e91e63" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  😊 Emotion & AI Analysis
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", my: 3 }}>
                <Typography 
                  variant="h2" 
                  fontWeight="bold" 
                  sx={{ 
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {sensorData.emotion_ai.emotionState}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Current Emotion State
                </Typography>
              </Box>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <Chip
                    label={`😰 Stress: ${sensorData.emotion_ai.stressLevel}`}
                    sx={{ 
                      width: "100%", 
                      py: 2,
                      background: "linear-gradient(135deg, #ff9800, #f44336)",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`😴 Fatigue: ${sensorData.emotion_ai.fatigueIndex}%`}
                    sx={{ 
                      width: "100%", 
                      py: 2,
                      background: "linear-gradient(135deg, #2196f3, #03a9f4)",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`😟 Anxiety: ${sensorData.emotion_ai.anxietyScore}%`}
                    sx={{ 
                      width: "100%", 
                      py: 2,
                      background: "linear-gradient(135deg, #9c27b0, #673ab7)",
                      color: "white",
                      fontWeight: "bold"
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={sensorData.emotion_ai.panicDetected ? "⚠️ Panic Detected" : "✅ Normal"}
                    sx={{ 
                      width: "100%", 
                      py: 2,
                      background: sensorData.emotion_ai.panicDetected 
                        ? "linear-gradient(135deg, #f44336, #d32f2f)"
                        : "linear-gradient(135deg, #4caf50, #8bc34a)",
                      color: "white",
                      fontWeight: "bold"
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
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🩸 Blood & Biochemical
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={[
                    { name: "Glucose", value: sensorData.blood_biochemical.glucose.value, normal: 100 },
                    { name: "Lactate", value: sensorData.blood_biochemical.lactate.value * 10, normal: 20 },
                    { name: "Cholesterol", value: sensorData.blood_biochemical.cholesterol.value, normal: 200 },
                    { name: "Hemoglobin", value: sensorData.blood_biochemical.hemoglobin.value * 10, normal: 140 },
                  ]}
                >
                  <defs>
                    <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#764ba2" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="normalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b894" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#00cec9" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#666" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(255,255,255,0.95)', 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="value" fill="url(#valueGradient)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="normal" fill="url(#normalGradient)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ p: 1, borderRadius: 2, background: "rgba(102, 126, 234, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Glucose
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {sensorData.blood_biochemical.glucose.value} mg/dL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1, borderRadius: 2, background: "rgba(102, 126, 234, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Cholesterol
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {sensorData.blood_biochemical.cholesterol.value} mg/dL
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1, borderRadius: 2, background: "rgba(102, 126, 234, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Lactate
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {sensorData.blood_biochemical.lactate.value} mmol/L
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 1, borderRadius: 2, background: "rgba(102, 126, 234, 0.08)" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Hemoglobin
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary">
                      {sensorData.blood_biochemical.hemoglobin.value} g/dL
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Voice & Audio Analysis - Full Width */}
        <Grid item xs={12}>
          <Card sx={{ ...glassCardStyle }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <MicIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🎤 Voice & Audio Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)"
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: "#667eea" }}>
                      {sensorData.audio_voice.pitch.hz}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Pitch (Hz)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(76,175,80,0.2)"
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: "#4caf50" }}>
                      {sensorData.audio_voice.speechRate.wordsPerMinute}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Words Per Minute
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)"
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold" sx={{ color: "#2196f3" }}>
                      {sensorData.audio_voice.energy.db}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Energy (dB)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
                    <Chip
                      label={`🎭 Emotion: ${sensorData.audio_voice.voiceEmotionModel.emotion}`}
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`🎙️ Voice: ${sensorData.audio_voice.microphone.voiceDetected ? "Detected" : "Not Detected"}`}
                      sx={{ background: "linear-gradient(135deg, #00b894, #00cec9)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`⏸️ Pause: ${sensorData.audio_voice.silence.pauseDuration}s`}
                      sx={{ background: "linear-gradient(135deg, #0984e3, #74b9ff)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`😰 Stress: ${(sensorData.audio_voice.voiceEmotionModel.stressProbability * 100).toFixed(0)}%`}
                      sx={{ background: "linear-gradient(135deg, #ff9800, #f44336)", color: "white", fontWeight: "bold" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Chemical & Sensory Analysis - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <ScienceIcon sx={{ mr: 1, color: "#388e3c" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🧪 Chemical & Sensory Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#667eea" }}>
                      {sensorData.smell_taste_chemical.gasSensor.smellIntensity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Smell Intensity
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(76,175,80,0.1), rgba(139,195,74,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(76,175,80,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#4caf50" }}>
                      {sensorData.smell_taste_chemical.phSensor.phValue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      pH Value
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(255,152,0,0.1), rgba(255,193,7,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(255,152,0,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#ff9800" }}>
                      {sensorData.smell_taste_chemical.salivaSensor.cortisolLevel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Cortisol (µg/dL)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#2196f3" }}>
                      {sensorData.smell_taste_chemical.breathSensor.ketoneLevel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Ketone Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                    <Chip
                      label={`👅 Taste: ${sensorData.smell_taste_chemical.chemicalSensor.tasteProfile}`}
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`🍺 Alcohol: ${sensorData.smell_taste_chemical.breathSensor.alcoholLevel}`}
                      sx={{ 
                        background: sensorData.smell_taste_chemical.breathSensor.alcoholLevel === 0.0
                          ? "linear-gradient(135deg, #00b894, #00cec9)"
                          : "linear-gradient(135deg, #f44336, #d32f2f)",
                        color: "white",
                        fontWeight: "bold"
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Vision & Eye Tracking - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <RemoveRedEyeIcon sx={{ mr: 1, color: "#7b1fa2" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  👁️ Vision & Eye Tracking
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(156,39,176,0.1), rgba(103,58,183,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(156,39,176,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#9c27b0" }}>
                      {sensorData.vision_eye.irEyeTracker.focusLevel}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Focus Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(102,126,234,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#667eea" }}>
                      {sensorData.vision_eye.pupilSensor.dilation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Pupil (mm)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card 
                    sx={{ 
                      p: 2, 
                      textAlign: "center",
                      background: "linear-gradient(135deg, rgba(33,150,243,0.1), rgba(3,169,244,0.1))",
                      borderRadius: 3,
                      border: "1px solid rgba(33,150,243,0.2)"
                    }}
                  >
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "#2196f3" }}>
                      {sensorData.vision_eye.blinkRate.blinksPerMinute}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Blinks/Min
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`👤 Face: ${sensorData.vision_eye.camera.faceDetected ? "Detected" : "Not Detected"}`}
                      sx={{ background: "linear-gradient(135deg, #00b894, #00cec9)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`😊 Emotion: ${sensorData.vision_eye.camera.emotion}`}
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`😫 Fatigue: ${sensorData.vision_eye.blinkRate.fatigueScore}%`}
                      sx={{ background: "linear-gradient(135deg, #ff9800, #f44336)", color: "white", fontWeight: "bold" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Touch & Motion */}
        <Grid item xs={12} md={6}>
          <Card sx={{ ...glassCardStyle, height: "100%" }}>
            <CardContent>
              <Box sx={sectionHeaderStyle}>
                <TouchAppIcon sx={{ mr: 1, color: "#1976d2" }} />
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  🖐️ Touch & Motion
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: "rgba(102, 126, 234, 0.08)", textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Pressure Force
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {sensorData.touch_motion.pressure.force} N
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: "rgba(76, 175, 80, 0.08)", textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Load
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      {sensorData.touch_motion.fsr.load} kg
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ p: 1.5, borderRadius: 2, background: "rgba(255, 152, 0, 0.08)", textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                      Tremor
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                      {sensorData.touch_motion.vibration.tremorLevel}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    📊 Accelerometer
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`X: ${sensorData.touch_motion.accelerometer.x}`}
                      size="small"
                      sx={{ background: "rgba(102, 126, 234, 0.15)", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`Y: ${sensorData.touch_motion.accelerometer.y}`}
                      size="small"
                      sx={{ background: "rgba(102, 126, 234, 0.15)", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`Z: ${sensorData.touch_motion.accelerometer.z}`}
                      size="small"
                      sx={{ background: "rgba(102, 126, 234, 0.15)", fontWeight: "bold" }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight="bold">
                    🔄 Gyroscope
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`Roll: ${sensorData.touch_motion.gyroscope.roll}°`}
                      size="small"
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`Pitch: ${sensorData.touch_motion.gyroscope.pitch}°`}
                      size="small"
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                    <Chip
                      label={`Yaw: ${sensorData.touch_motion.gyroscope.yaw}°`}
                      size="small"
                      sx={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", fontWeight: "bold" }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={`👆 Touch: ${sensorData.touch_motion.touch.contact ? "Active" : "Inactive"}`}
                      sx={{ 
                        background: sensorData.touch_motion.touch.contact 
                          ? "linear-gradient(135deg, #00b894, #00cec9)" 
                          : "rgba(0,0,0,0.1)",
                        color: sensorData.touch_motion.touch.contact ? "white" : "text.secondary",
                        fontWeight: "bold"
                      }}
                    />
                    <Chip
                      label={`🧭 Heading: ${sensorData.touch_motion.magnetometer.heading}°`}
                      sx={{ background: "linear-gradient(135deg, #0984e3, #74b9ff)", color: "white", fontWeight: "bold" }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

      </Grid>

      {/* Footer */}
      <Box 
        sx={{ 
          mt: 4, 
          py: 2, 
          textAlign: "center", 
          borderRadius: 3,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)"
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "bold" }}>
          🕐 Last Updated: {lastUpdated} | 👤 User ID: {sensorData.userId}
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5, display: "block" }}>
          Real-time biometric monitoring powered by advanced sensor technology
        </Typography>
      </Box>
    </Box>
  );
}
