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
    // Set the timestamp only on the client side to prevent hydration mismatch
    setLastUpdated(new Date(sensorData.timestamp).toLocaleString());
  }, []);

  return (
    <Box
      sx={{
        p: 2,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Image
                src={employeeImage}
                alt={employeeData.name}
                width={80}
                height={80}
                style={{ borderRadius: "50%", border: "3px solid white" }}
              />
            </Grid>
            <Grid item xs>
              <Typography variant="h5" fontWeight="bold">
                {employeeData.name}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {employeeData.position} | {employeeData.department}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Employee ID: {employeeData.employeeNumber} | Current Task:{" "}
                {employeeData.currentTask}
              </Typography>
            </Grid>
            <Grid item sx={{ marginLeft: 'auto' }}>
              <Chip
                label={employeeData.employmentStatus}
                color="success"
                sx={{ 
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                  padding: "20px 16px"
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
        sx={{ color: "white", textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
      >
        🧠 Human Sensor Monitoring Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {vitalSignsData.map((vital, idx) => (
              <Grid item xs={6} sm={4} md={2} key={idx}>
                <Card
                  sx={{
                    borderRadius: 3,
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
                    boxShadow: 3,
                  }}
                >
                  <CardContent sx={{ textAlign: "center", py: 2 }}>
                    <Typography
                      color="text.secondary"
                      variant="caption"
                      fontWeight="bold"
                    >
                      {vital.name}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {vital.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PsychologyIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🧠 Brain & Nervous System
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={brainActivityData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="category" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Brain Activity"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Focus Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.focusLevel}
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {sensorData.brain_nervous_system.EEG.focusLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Stress Level
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EEG.stressLevel}
                    color="warning"
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {sensorData.brain_nervous_system.EEG.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Muscle Activity
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EMG.muscleActivity}
                    color="success"
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {sensorData.brain_nervous_system.EMG.muscleActivity}%
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Alertness
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.brain_nervous_system.EOG.alertnessScore}
                    color="info"
                    sx={{ height: 8, borderRadius: 5 }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {sensorData.brain_nervous_system.EOG.alertnessScore}%
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Chip
                  label={`Cognitive Load: ${sensorData.brain_nervous_system.fNIRS.cognitiveLoad}`}
                  color="primary"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={`Sleep State: ${sensorData.brain_nervous_system.EEG.sleepState}`}
                  color="success"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Heart & Blood System - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <FavoriteIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  ❤️ Heart & Blood System
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={heartWave}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="#ff4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="h4" color="error" fontWeight="bold">
                      {sensorData.heart_blood.heartRatePPG.bpm}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Heart Rate (BPM)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {sensorData.heart_blood.spo2.oxygenPercent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      SpO₂
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ textAlign: "center", p: 1 }}>
                    <Typography
                      variant="h5"
                      color="success.main"
                      fontWeight="bold"
                    >
                      {sensorData.heart_blood.bloodPressure.systolic}/
                      {sensorData.heart_blood.bloodPressure.diastolic}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      BP (mmHg)
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  ECG Rhythm:{" "}
                </Typography>
                <Chip
                  label={sensorData.heart_blood.ECG.rhythm}
                  color="success"
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="caption" color="text.secondary">
                  HRV RMSSD:{" "}
                </Typography>
                <Chip
                  label={`${sensorData.heart_blood.hrv.rmssd} ms`}
                  color="info"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Respiration & Lungs - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AirIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🫁 Respiration & Lungs
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card
                    variant="outlined"
                    sx={{ p: 2, textAlign: "center", background: "#e3f2fd" }}
                  >
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {sensorData.respiration_lungs.respirationRate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Breaths per Minute
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Airflow Volume
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {sensorData.respiration_lungs.airflow.volume} L/min
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lung Capacity
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {sensorData.respiration_lungs.spirometer.lungCapacity} L
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Exhaled CO₂
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (sensorData.respiration_lungs.co2.exhaledCO2 / 50) * 100
                    }
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                  <Typography variant="caption" fontWeight="bold">
                    {sensorData.respiration_lungs.co2.exhaledCO2} mmHg
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature & Sweat - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ThermostatIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🌡️ Temperature & Sweat
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card
                    variant="outlined"
                    sx={{ p: 1, textAlign: "center", background: "#ffebee" }}
                  >
                    <Typography variant="h5" fontWeight="bold" color="error">
                      {sensorData.temperature_sweat.bodyTemperature}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Body Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card
                    variant="outlined"
                    sx={{ p: 1, textAlign: "center", background: "#fff3e0" }}
                  >
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {sensorData.temperature_sweat.skinTemperature}°C
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Skin Temp
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    GSR/EDA
                  </Typography>
                  <Typography variant="body2">
                    Conductance:{" "}
                    {sensorData.temperature_sweat.gsrEda.conductance} µS
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={sensorData.temperature_sweat.gsrEda.stressLevel}
                    color="warning"
                    sx={{ height: 8, borderRadius: 5, my: 1 }}
                  />
                  <Typography variant="caption">
                    Stress Level:{" "}
                    {sensorData.temperature_sweat.gsrEda.stressLevel}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                  >
                    Sweat Analysis
                  </Typography>
                  <Typography variant="body2">
                    Sodium:{" "}
                    {sensorData.temperature_sweat.sweatSensor.sodiumLevel}{" "}
                    mmol/L
                  </Typography>
                  <Chip
                    label={`Hydration: ${sensorData.temperature_sweat.sweatSensor.hydrationStatus}`}
                    color="success"
                    size="small"
                    sx={{ mt: 1 }}
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
              borderRadius: 3,
              boxShadow: 4,
              height: "100%",
              background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <PsychologyIcon sx={{ mr: 1, color: "#d32f2f" }} />
                <Typography variant="h6" fontWeight="bold">
                  😊 Emotion & AI Analysis
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center", my: 2 }}>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {sensorData.emotion_ai.emotionState}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Emotion
                </Typography>
              </Box>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Chip
                    label={`Stress: ${sensorData.emotion_ai.stressLevel}`}
                    color="warning"
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`Fatigue: ${sensorData.emotion_ai.fatigueIndex}%`}
                    color="info"
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={`Anxiety: ${sensorData.emotion_ai.anxietyScore}%`}
                    color="secondary"
                    sx={{ width: "100%" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Chip
                    label={
                      sensorData.emotion_ai.panicDetected
                        ? "⚠️ Panic"
                        : "✅ Normal"
                    }
                    color={
                      sensorData.emotion_ai.panicDetected ? "error" : "success"
                    }
                    sx={{ width: "100%" }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Blood & Biochemical - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <BloodtypeIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🩸 Blood & Biochemical
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={200}>
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                  <Bar dataKey="normal" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Glucose
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {sensorData.blood_biochemical.glucose.value} mg/dL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Cholesterol
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {sensorData.blood_biochemical.cholesterol.value} mg/dL
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lactate
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {sensorData.blood_biochemical.lactate.value} mmol/L
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Hemoglobin
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {sensorData.blood_biochemical.hemoglobin.value} g/dL
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Voice & Audio Analysis - Full Width */}
        <Grid item xs={12} md={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <MicIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🎤 Voice & Audio Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {sensorData.audio_voice.pitch.hz}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pitch (Hz)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {sensorData.audio_voice.speechRate.wordsPerMinute}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      WPM
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="info.main"
                    >
                      {sensorData.audio_voice.energy.db}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Energy (dB)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`Emotion: ${sensorData.audio_voice.voiceEmotionModel.emotion}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Voice Detected: ${
                        sensorData.audio_voice.microphone.voiceDetected
                          ? "Yes"
                          : "No"
                      }`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`Pause: ${sensorData.audio_voice.silence.pauseDuration}s`}
                      color="info"
                      size="small"
                    />
                    <Chip
                      label={`Stress: ${(
                        sensorData.audio_voice.voiceEmotionModel
                          .stressProbability * 100
                      ).toFixed(0)}%`}
                      color="warning"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Chemical & Sensory Analysis - Left */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <ScienceIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  🧪 Chemical & Sensory Analysis
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {sensorData.smell_taste_chemical.gasSensor.smellIntensity}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Smell Intensity
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                    >
                      {sensorData.smell_taste_chemical.phSensor.phValue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      pH Value
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="warning.main"
                    >
                      {
                        sensorData.smell_taste_chemical.salivaSensor
                          .cortisolLevel
                      }
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Cortisol (µg/dL)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Card variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="info.main"
                    >
                      {sensorData.smell_taste_chemical.breathSensor.ketoneLevel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ketone Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`Taste: ${sensorData.smell_taste_chemical.chemicalSensor.tasteProfile}`}
                      color="primary"
                    />
                    <Chip
                      label={`Alcohol: ${sensorData.smell_taste_chemical.breathSensor.alcoholLevel}`}
                      color={
                        sensorData.smell_taste_chemical.breathSensor
                          .alcoholLevel === 0.0
                          ? "success"
                          : "error"
                      }
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Vision & Eye Tracking - Right */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <RemoveRedEyeIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  👁️ Vision & Eye Tracking
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="secondary"
                    >
                      {sensorData.vision_eye.irEyeTracker.focusLevel}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Focus Level
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {sensorData.vision_eye.pupilSensor.dilation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pupil Size (mm)
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={4}>
                  <Card variant="outlined" sx={{ p: 1, textAlign: "center" }}>
                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      color="info.main"
                    >
                      {sensorData.vision_eye.blinkRate.blinksPerMinute}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Blinks/Min
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`Face: ${
                        sensorData.vision_eye.camera.faceDetected
                          ? "Detected"
                          : "Not Detected"
                      }`}
                      color="success"
                      size="small"
                    />
                    <Chip
                      label={`Emotion: ${sensorData.vision_eye.camera.emotion}`}
                      color="primary"
                      size="small"
                    />
                    <Chip
                      label={`Fatigue: ${sensorData.vision_eye.blinkRate.fatigueScore}%`}
                      color="warning"
                      size="small"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Touch & Motion */}
        <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <TouchAppIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                🖐️ Touch & Motion
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Pressure Force
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {sensorData.touch_motion.pressure.force} N
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Load
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {sensorData.touch_motion.fsr.load} kg
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">
                  Tremor
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {sensorData.touch_motion.vibration.tremorLevel}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Accelerometer
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Chip
                    label={`X: ${sensorData.touch_motion.accelerometer.x}`}
                    size="small"
                  />
                  <Chip
                    label={`Y: ${sensorData.touch_motion.accelerometer.y}`}
                    size="small"
                  />
                  <Chip
                    label={`Z: ${sensorData.touch_motion.accelerometer.z}`}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                >
                  Gyroscope
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Chip
                    label={`Roll: ${sensorData.touch_motion.gyroscope.roll}°`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`Pitch: ${sensorData.touch_motion.gyroscope.pitch}°`}
                    size="small"
                    color="primary"
                  />
                  <Chip
                    label={`Yaw: ${sensorData.touch_motion.gyroscope.yaw}°`}
                    size="small"
                    color="primary"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Chip
                  label={`Touch: ${
                    sensorData.touch_motion.touch.contact
                      ? "Active"
                      : "Inactive"
                  }`}
                  color={
                    sensorData.touch_motion.touch.contact
                      ? "success"
                      : "default"
                  }
                />
                <Chip
                  label={`Heading: ${sensorData.touch_motion.magnetometer.heading}°`}
                  color="info"
                  sx={{ ml: 1 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      </Grid>

      <Box sx={{ mt: 3, textAlign: "center", color: "white" }}>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          Last Updated: {new Date(sensorData.timestamp).toLocaleString()} | User
          ID: {sensorData.userId}
        </Typography>
      </Box>
    </Box>
  );
}
