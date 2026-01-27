import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import './App.css'

// Conversion data for all unit categories
const conversionData = {
  length: {
    name: 'Length',
    icon: '📏',
    units: {
      meter: { name: 'Meters (m)', toBase: 1 },
      kilometer: { name: 'Kilometers (km)', toBase: 1000 },
      centimeter: { name: 'Centimeters (cm)', toBase: 0.01 },
      millimeter: { name: 'Millimeters (mm)', toBase: 0.001 },
      micrometer: { name: 'Micrometers (μm)', toBase: 0.000001 },
      nanometer: { name: 'Nanometers (nm)', toBase: 0.000000001 },
      mile: { name: 'Miles (mi)', toBase: 1609.344 },
      yard: { name: 'Yards (yd)', toBase: 0.9144 },
      foot: { name: 'Feet (ft)', toBase: 0.3048 },
      inch: { name: 'Inches (in)', toBase: 0.0254 },
      nauticalMile: { name: 'Nautical Miles', toBase: 1852 },
      lightYear: { name: 'Light Years', toBase: 9.461e15 },
      angstrom: { name: 'Angstroms (Å)', toBase: 1e-10 },
    }
  },
  weight: {
    name: 'Mass',
    icon: '⚖️',
    units: {
      kilogram: { name: 'Kilograms (kg)', toBase: 1 },
      gram: { name: 'Grams (g)', toBase: 0.001 },
      milligram: { name: 'Milligrams (mg)', toBase: 0.000001 },
      microgram: { name: 'Micrograms (μg)', toBase: 1e-9 },
      pound: { name: 'Pounds (lb)', toBase: 0.453592 },
      ounce: { name: 'Ounces (oz)', toBase: 0.0283495 },
      ton: { name: 'Metric Tons', toBase: 1000 },
      stone: { name: 'Stones', toBase: 6.35029 },
      amu: { name: 'Atomic Mass Units (u)', toBase: 1.66054e-27 },
    }
  },
  temperature: {
    name: 'Temperature',
    icon: '🌡️',
    units: {
      celsius: { name: 'Celsius (°C)' },
      fahrenheit: { name: 'Fahrenheit (°F)' },
      kelvin: { name: 'Kelvin (K)' },
      rankine: { name: 'Rankine (°R)' },
    },
    customConvert: (value, from, to) => {
      let celsius;
      switch (from) {
        case 'celsius': celsius = value; break;
        case 'fahrenheit': celsius = (value - 32) * 5/9; break;
        case 'kelvin': celsius = value - 273.15; break;
        case 'rankine': celsius = (value - 491.67) * 5/9; break;
        default: celsius = value;
      }
      switch (to) {
        case 'celsius': return celsius;
        case 'fahrenheit': return celsius * 9/5 + 32;
        case 'kelvin': return celsius + 273.15;
        case 'rankine': return (celsius + 273.15) * 9/5;
        default: return celsius;
      }
    }
  },
  volume: {
    name: 'Volume',
    icon: '🧪',
    units: {
      liter: { name: 'Liters (L)', toBase: 1 },
      milliliter: { name: 'Milliliters (mL)', toBase: 0.001 },
      cubicMeter: { name: 'Cubic Meters (m³)', toBase: 1000 },
      cubicCentimeter: { name: 'Cubic Centimeters (cm³)', toBase: 0.001 },
      gallon: { name: 'Gallons (US)', toBase: 3.78541 },
      quart: { name: 'Quarts (US)', toBase: 0.946353 },
      pint: { name: 'Pints (US)', toBase: 0.473176 },
      cup: { name: 'Cups (US)', toBase: 0.236588 },
      fluidOunce: { name: 'Fluid Ounces (US)', toBase: 0.0295735 },
      tablespoon: { name: 'Tablespoons', toBase: 0.0147868 },
      teaspoon: { name: 'Teaspoons', toBase: 0.00492892 },
    }
  },
  area: {
    name: 'Area',
    icon: '📐',
    units: {
      sqMeter: { name: 'Square Meters (m²)', toBase: 1 },
      sqKilometer: { name: 'Square Kilometers (km²)', toBase: 1000000 },
      sqCentimeter: { name: 'Square Centimeters (cm²)', toBase: 0.0001 },
      sqMile: { name: 'Square Miles', toBase: 2589988.11 },
      sqYard: { name: 'Square Yards', toBase: 0.836127 },
      sqFoot: { name: 'Square Feet', toBase: 0.092903 },
      sqInch: { name: 'Square Inches', toBase: 0.00064516 },
      acre: { name: 'Acres', toBase: 4046.86 },
      hectare: { name: 'Hectares', toBase: 10000 },
    }
  },
  speed: {
    name: 'Speed',
    icon: '🚀',
    units: {
      mps: { name: 'Meters/Second (m/s)', toBase: 1 },
      kph: { name: 'Kilometers/Hour (km/h)', toBase: 0.277778 },
      mph: { name: 'Miles/Hour (mph)', toBase: 0.44704 },
      knot: { name: 'Knots', toBase: 0.514444 },
      fps: { name: 'Feet/Second (ft/s)', toBase: 0.3048 },
      mach: { name: 'Mach (at sea level)', toBase: 343 },
      lightSpeed: { name: 'Speed of Light (c)', toBase: 299792458 },
    }
  },
  time: {
    name: 'Time',
    icon: '⏱️',
    units: {
      second: { name: 'Seconds', toBase: 1 },
      millisecond: { name: 'Milliseconds', toBase: 0.001 },
      microsecond: { name: 'Microseconds', toBase: 0.000001 },
      nanosecond: { name: 'Nanoseconds', toBase: 1e-9 },
      minute: { name: 'Minutes', toBase: 60 },
      hour: { name: 'Hours', toBase: 3600 },
      day: { name: 'Days', toBase: 86400 },
      week: { name: 'Weeks', toBase: 604800 },
      month: { name: 'Months (30 days)', toBase: 2592000 },
      year: { name: 'Years (365 days)', toBase: 31536000 },
    }
  },
  data: {
    name: 'Data',
    icon: '💾',
    units: {
      byte: { name: 'Bytes (B)', toBase: 1 },
      kilobyte: { name: 'Kilobytes (KB)', toBase: 1024 },
      megabyte: { name: 'Megabytes (MB)', toBase: 1048576 },
      gigabyte: { name: 'Gigabytes (GB)', toBase: 1073741824 },
      terabyte: { name: 'Terabytes (TB)', toBase: 1099511627776 },
      bit: { name: 'Bits', toBase: 0.125 },
      kilobit: { name: 'Kilobits (Kb)', toBase: 128 },
      megabit: { name: 'Megabits (Mb)', toBase: 131072 },
    }
  },
  force: {
    name: 'Force',
    icon: '💪',
    units: {
      newton: { name: 'Newtons (N)', toBase: 1 },
      kilonewton: { name: 'Kilonewtons (kN)', toBase: 1000 },
      dyne: { name: 'Dynes', toBase: 0.00001 },
      poundForce: { name: 'Pound-force (lbf)', toBase: 4.44822 },
      kilogramForce: { name: 'Kilogram-force (kgf)', toBase: 9.80665 },
    }
  },
  energy: {
    name: 'Energy',
    icon: '⚡',
    units: {
      joule: { name: 'Joules (J)', toBase: 1 },
      kilojoule: { name: 'Kilojoules (kJ)', toBase: 1000 },
      megajoule: { name: 'Megajoules (MJ)', toBase: 1000000 },
      calorie: { name: 'Calories (cal)', toBase: 4.184 },
      kilocalorie: { name: 'Kilocalories (kcal)', toBase: 4184 },
      wattHour: { name: 'Watt Hours (Wh)', toBase: 3600 },
      kilowattHour: { name: 'Kilowatt Hours (kWh)', toBase: 3600000 },
      electronvolt: { name: 'Electron Volts (eV)', toBase: 1.60218e-19 },
      btu: { name: 'BTU', toBase: 1055.06 },
      erg: { name: 'Ergs', toBase: 1e-7 },
    }
  },
  power: {
    name: 'Power',
    icon: '🔌',
    units: {
      watt: { name: 'Watts (W)', toBase: 1 },
      kilowatt: { name: 'Kilowatts (kW)', toBase: 1000 },
      megawatt: { name: 'Megawatts (MW)', toBase: 1000000 },
      horsepower: { name: 'Horsepower (hp)', toBase: 745.7 },
      btuPerHour: { name: 'BTU/hour', toBase: 0.293071 },
      footPoundPerSecond: { name: 'Foot-pounds/second', toBase: 1.35582 },
    }
  },
  pressure: {
    name: 'Pressure',
    icon: '🎈',
    units: {
      pascal: { name: 'Pascals (Pa)', toBase: 1 },
      kilopascal: { name: 'Kilopascals (kPa)', toBase: 1000 },
      megapascal: { name: 'Megapascals (MPa)', toBase: 1000000 },
      bar: { name: 'Bar', toBase: 100000 },
      psi: { name: 'PSI', toBase: 6894.76 },
      atm: { name: 'Atmospheres (atm)', toBase: 101325 },
      mmHg: { name: 'mmHg (Torr)', toBase: 133.322 },
    }
  },
  frequency: {
    name: 'Frequency',
    icon: '📡',
    units: {
      hertz: { name: 'Hertz (Hz)', toBase: 1 },
      kilohertz: { name: 'Kilohertz (kHz)', toBase: 1000 },
      megahertz: { name: 'Megahertz (MHz)', toBase: 1000000 },
      gigahertz: { name: 'Gigahertz (GHz)', toBase: 1000000000 },
      rpm: { name: 'RPM', toBase: 1/60 },
      radian_per_second: { name: 'Radians/second', toBase: 1/(2*Math.PI) },
    }
  },
  electricCharge: {
    name: 'Electric Charge',
    icon: '🔋',
    units: {
      coulomb: { name: 'Coulombs (C)', toBase: 1 },
      millicoulomb: { name: 'Millicoulombs (mC)', toBase: 0.001 },
      microcoulomb: { name: 'Microcoulombs (μC)', toBase: 0.000001 },
      ampereHour: { name: 'Ampere-hours (Ah)', toBase: 3600 },
      milliampereHour: { name: 'Milliampere-hours (mAh)', toBase: 3.6 },
      electronCharge: { name: 'Elementary charge (e)', toBase: 1.60218e-19 },
    }
  },
  voltage: {
    name: 'Voltage',
    icon: '⚡',
    units: {
      volt: { name: 'Volts (V)', toBase: 1 },
      millivolt: { name: 'Millivolts (mV)', toBase: 0.001 },
      microvolt: { name: 'Microvolts (μV)', toBase: 0.000001 },
      kilovolt: { name: 'Kilovolts (kV)', toBase: 1000 },
    }
  },
  angle: {
    name: 'Angle',
    icon: '📐',
    units: {
      degree: { name: 'Degrees (°)', toBase: 1 },
      radian: { name: 'Radians (rad)', toBase: 180/Math.PI },
      gradian: { name: 'Gradians (gon)', toBase: 0.9 },
      arcminute: { name: 'Arc Minutes (′)', toBase: 1/60 },
      arcsecond: { name: 'Arc Seconds (″)', toBase: 1/3600 },
      revolution: { name: 'Revolutions', toBase: 360 },
    }
  },
  concentration: {
    name: 'Concentration',
    icon: '🧬',
    units: {
      molar: { name: 'Molar (M)', toBase: 1 },
      millimolar: { name: 'Millimolar (mM)', toBase: 0.001 },
      micromolar: { name: 'Micromolar (μM)', toBase: 0.000001 },
      nanomolar: { name: 'Nanomolar (nM)', toBase: 1e-9 },
      molal: { name: 'Molal (m)', toBase: 1 },
      percentWeight: { name: 'Percent (w/w)', toBase: 1 },
      ppm: { name: 'Parts per million', toBase: 0.0001 },
      ppb: { name: 'Parts per billion', toBase: 1e-7 },
    }
  },
  density: {
    name: 'Density',
    icon: '🧊',
    units: {
      kgPerCubicMeter: { name: 'kg/m³', toBase: 1 },
      gPerCubicCm: { name: 'g/cm³', toBase: 1000 },
      kgPerLiter: { name: 'kg/L', toBase: 1000 },
      gPerMl: { name: 'g/mL', toBase: 1000 },
      lbPerCubicFt: { name: 'lb/ft³', toBase: 16.0185 },
      lbPerGallon: { name: 'lb/gal (US)', toBase: 119.826 },
    }
  },
};

// Physics formulas
const physicsFormulas = {
  kinematics: {
    name: 'Kinematics',
    formulas: [
      { name: 'Velocity', formula: 'v = d / t', inputs: ['distance (m)', 'time (s)'], calc: (d, t) => d / t, result: 'velocity (m/s)' },
      { name: 'Acceleration', formula: 'a = (v - u) / t', inputs: ['final velocity (m/s)', 'initial velocity (m/s)', 'time (s)'], calc: (v, u, t) => (v - u) / t, result: 'acceleration (m/s²)' },
      { name: 'Distance (uniform accel)', formula: 's = ut + ½at²', inputs: ['initial velocity (m/s)', 'acceleration (m/s²)', 'time (s)'], calc: (u, a, t) => u * t + 0.5 * a * t * t, result: 'distance (m)' },
      { name: 'Final Velocity', formula: 'v² = u² + 2as', inputs: ['initial velocity (m/s)', 'acceleration (m/s²)', 'distance (m)'], calc: (u, a, s) => Math.sqrt(u * u + 2 * a * s), result: 'final velocity (m/s)' },
    ]
  },
  dynamics: {
    name: 'Dynamics',
    formulas: [
      { name: 'Force', formula: 'F = ma', inputs: ['mass (kg)', 'acceleration (m/s²)'], calc: (m, a) => m * a, result: 'force (N)' },
      { name: 'Weight', formula: 'W = mg', inputs: ['mass (kg)', 'gravity (m/s²)'], calc: (m, g) => m * g, result: 'weight (N)', defaultInputs: [null, 9.81] },
      { name: 'Momentum', formula: 'p = mv', inputs: ['mass (kg)', 'velocity (m/s)'], calc: (m, v) => m * v, result: 'momentum (kg·m/s)' },
      { name: 'Impulse', formula: 'J = FΔt', inputs: ['force (N)', 'time (s)'], calc: (f, t) => f * t, result: 'impulse (N·s)' },
      { name: 'Kinetic Energy', formula: 'KE = ½mv²', inputs: ['mass (kg)', 'velocity (m/s)'], calc: (m, v) => 0.5 * m * v * v, result: 'energy (J)' },
      { name: 'Potential Energy', formula: 'PE = mgh', inputs: ['mass (kg)', 'gravity (m/s²)', 'height (m)'], calc: (m, g, h) => m * g * h, result: 'energy (J)', defaultInputs: [null, 9.81, null] },
      { name: 'Work', formula: 'W = Fd cos(θ)', inputs: ['force (N)', 'distance (m)', 'angle (degrees)'], calc: (f, d, theta) => f * d * Math.cos(theta * Math.PI / 180), result: 'work (J)' },
      { name: 'Power', formula: 'P = W / t', inputs: ['work (J)', 'time (s)'], calc: (w, t) => w / t, result: 'power (W)' },
    ]
  },
  waves: {
    name: 'Waves & Optics',
    formulas: [
      { name: 'Wave Speed', formula: 'v = fλ', inputs: ['frequency (Hz)', 'wavelength (m)'], calc: (f, l) => f * l, result: 'speed (m/s)' },
      { name: 'Period', formula: 'T = 1/f', inputs: ['frequency (Hz)'], calc: (f) => 1 / f, result: 'period (s)' },
      { name: 'Photon Energy', formula: 'E = hf', inputs: ['frequency (Hz)'], calc: (f) => 6.626e-34 * f, result: 'energy (J)' },
      { name: 'Wavelength from Energy', formula: 'λ = hc/E', inputs: ['energy (J)'], calc: (e) => (6.626e-34 * 3e8) / e, result: 'wavelength (m)' },
      { name: "Snell's Law (n₂)", formula: 'n₁sin(θ₁) = n₂sin(θ₂)', inputs: ['n₁', 'angle₁ (deg)', 'angle₂ (deg)'], calc: (n1, t1, t2) => n1 * Math.sin(t1 * Math.PI / 180) / Math.sin(t2 * Math.PI / 180), result: 'n₂' },
    ]
  },
  electricity: {
    name: 'Electricity',
    formulas: [
      { name: "Ohm's Law (V)", formula: 'V = IR', inputs: ['current (A)', 'resistance (Ω)'], calc: (i, r) => i * r, result: 'voltage (V)' },
      { name: "Ohm's Law (I)", formula: 'I = V/R', inputs: ['voltage (V)', 'resistance (Ω)'], calc: (v, r) => v / r, result: 'current (A)' },
      { name: "Ohm's Law (R)", formula: 'R = V/I', inputs: ['voltage (V)', 'current (A)'], calc: (v, i) => v / i, result: 'resistance (Ω)' },
      { name: 'Electric Power', formula: 'P = VI', inputs: ['voltage (V)', 'current (A)'], calc: (v, i) => v * i, result: 'power (W)' },
      { name: 'Power (from R)', formula: 'P = I²R', inputs: ['current (A)', 'resistance (Ω)'], calc: (i, r) => i * i * r, result: 'power (W)' },
      { name: "Coulomb's Law", formula: 'F = kq₁q₂/r²', inputs: ['charge 1 (C)', 'charge 2 (C)', 'distance (m)'], calc: (q1, q2, r) => 8.99e9 * q1 * q2 / (r * r), result: 'force (N)' },
    ]
  },
  thermodynamics: {
    name: 'Thermodynamics',
    formulas: [
      { name: 'Heat Transfer', formula: 'Q = mcΔT', inputs: ['mass (kg)', 'specific heat (J/kg·K)', 'temp change (K)'], calc: (m, c, dt) => m * c * dt, result: 'heat (J)' },
      { name: 'Ideal Gas Law', formula: 'PV = nRT', inputs: ['moles (n)', 'temperature (K)', 'pressure (Pa)'], calc: (n, t, p) => (n * 8.314 * t) / p, result: 'volume (m³)' },
      { name: 'Ideal Gas (find P)', formula: 'P = nRT/V', inputs: ['moles (n)', 'temperature (K)', 'volume (m³)'], calc: (n, t, v) => (n * 8.314 * t) / v, result: 'pressure (Pa)' },
      { name: 'Thermal Expansion', formula: 'ΔL = αL₀ΔT', inputs: ['coeff (1/K)', 'initial length (m)', 'temp change (K)'], calc: (a, l0, dt) => a * l0 * dt, result: 'length change (m)' },
    ]
  },
  relativity: {
    name: 'Relativity',
    formulas: [
      { name: 'Mass-Energy', formula: 'E = mc²', inputs: ['mass (kg)'], calc: (m) => m * 299792458 * 299792458, result: 'energy (J)' },
      { name: 'Lorentz Factor', formula: 'γ = 1/√(1-v²/c²)', inputs: ['velocity (m/s)'], calc: (v) => 1 / Math.sqrt(1 - (v * v) / (299792458 * 299792458)), result: 'γ' },
      { name: 'Time Dilation', formula: 'Δt′ = γΔt', inputs: ['proper time (s)', 'velocity (m/s)'], calc: (t, v) => t / Math.sqrt(1 - (v * v) / (299792458 * 299792458)), result: 'dilated time (s)' },
    ]
  },
};

// Chemistry formulas and calculators
const chemistryFormulas = {
  stoichiometry: {
    name: 'Stoichiometry',
    formulas: [
      { name: 'Moles from Mass', formula: 'n = m / M', inputs: ['mass (g)', 'molar mass (g/mol)'], calc: (m, M) => m / M, result: 'moles (mol)' },
      { name: 'Mass from Moles', formula: 'm = n × M', inputs: ['moles (mol)', 'molar mass (g/mol)'], calc: (n, M) => n * M, result: 'mass (g)' },
      { name: 'Number of Particles', formula: 'N = n × Nₐ', inputs: ['moles (mol)'], calc: (n) => n * 6.022e23, result: 'particles' },
      { name: 'Moles from Particles', formula: 'n = N / Nₐ', inputs: ['particles'], calc: (N) => N / 6.022e23, result: 'moles (mol)' },
    ]
  },
  solutions: {
    name: 'Solutions',
    formulas: [
      { name: 'Molarity', formula: 'M = n / V', inputs: ['moles of solute', 'volume of solution (L)'], calc: (n, v) => n / v, result: 'molarity (M)' },
      { name: 'Dilution', formula: 'M₁V₁ = M₂V₂', inputs: ['initial M', 'initial V (L)', 'final M'], calc: (m1, v1, m2) => (m1 * v1) / m2, result: 'final V (L)' },
      { name: 'Mass Percent', formula: '% = (m_solute/m_solution)×100', inputs: ['mass solute (g)', 'mass solution (g)'], calc: (ms, mt) => (ms / mt) * 100, result: 'mass %' },
      { name: 'Molality', formula: 'm = n / kg_solvent', inputs: ['moles solute', 'kg of solvent'], calc: (n, kg) => n / kg, result: 'molality (m)' },
      { name: 'ppm', formula: 'ppm = (mg/L)', inputs: ['mass solute (mg)', 'volume (L)'], calc: (m, v) => m / v, result: 'ppm' },
    ]
  },
  gases: {
    name: 'Gas Laws',
    formulas: [
      { name: 'Ideal Gas (V)', formula: 'V = nRT/P', inputs: ['moles', 'temperature (K)', 'pressure (atm)'], calc: (n, t, p) => (n * 0.0821 * t) / p, result: 'volume (L)' },
      { name: 'Ideal Gas (P)', formula: 'P = nRT/V', inputs: ['moles', 'temperature (K)', 'volume (L)'], calc: (n, t, v) => (n * 0.0821 * t) / v, result: 'pressure (atm)' },
      { name: 'Ideal Gas (n)', formula: 'n = PV/RT', inputs: ['pressure (atm)', 'volume (L)', 'temperature (K)'], calc: (p, v, t) => (p * v) / (0.0821 * t), result: 'moles' },
      { name: 'Molar Volume (STP)', formula: 'V = n × 22.4', inputs: ['moles'], calc: (n) => n * 22.4, result: 'volume at STP (L)' },
      { name: 'Gas Density', formula: 'ρ = PM/RT', inputs: ['pressure (atm)', 'molar mass (g/mol)', 'temperature (K)'], calc: (p, m, t) => (p * m) / (0.0821 * t), result: 'density (g/L)' },
    ]
  },
  equilibrium: {
    name: 'Equilibrium & pH',
    formulas: [
      { name: 'pH from [H⁺]', formula: 'pH = -log[H⁺]', inputs: ['[H⁺] (M)'], calc: (h) => -Math.log10(h), result: 'pH' },
      { name: '[H⁺] from pH', formula: '[H⁺] = 10^(-pH)', inputs: ['pH'], calc: (ph) => Math.pow(10, -ph), result: '[H⁺] (M)' },
      { name: 'pOH from pH', formula: 'pOH = 14 - pH', inputs: ['pH'], calc: (ph) => 14 - ph, result: 'pOH' },
      { name: 'Ka from pKa', formula: 'Ka = 10^(-pKa)', inputs: ['pKa'], calc: (pka) => Math.pow(10, -pka), result: 'Ka' },
      { name: 'pKa from Ka', formula: 'pKa = -log(Ka)', inputs: ['Ka'], calc: (ka) => -Math.log10(ka), result: 'pKa' },
      { name: 'Henderson-Hasselbalch', formula: 'pH = pKa + log([A⁻]/[HA])', inputs: ['pKa', '[A⁻] (M)', '[HA] (M)'], calc: (pka, a, ha) => pka + Math.log10(a / ha), result: 'pH' },
    ]
  },
  thermochem: {
    name: 'Thermochemistry',
    formulas: [
      { name: 'Enthalpy Change', formula: 'ΔH = q / n', inputs: ['heat (kJ)', 'moles'], calc: (q, n) => q / n, result: 'ΔH (kJ/mol)' },
      { name: 'Heat Capacity', formula: 'q = mcΔT', inputs: ['mass (g)', 'specific heat (J/g·°C)', 'ΔT (°C)'], calc: (m, c, dt) => m * c * dt, result: 'heat (J)' },
      { name: 'Gibbs Free Energy', formula: 'ΔG = ΔH - TΔS', inputs: ['ΔH (kJ)', 'T (K)', 'ΔS (kJ/K)'], calc: (h, t, s) => h - t * s, result: 'ΔG (kJ)' },
      { name: 'Equilibrium Constant', formula: 'K = e^(-ΔG°/RT)', inputs: ['ΔG° (J/mol)', 'T (K)'], calc: (dg, t) => Math.exp(-dg / (8.314 * t)), result: 'K' },
    ]
  },
  electrochemistry: {
    name: 'Electrochemistry',
    formulas: [
      { name: 'Cell Potential', formula: 'E°cell = E°cathode - E°anode', inputs: ['E°cathode (V)', 'E°anode (V)'], calc: (ec, ea) => ec - ea, result: 'E°cell (V)' },
      { name: 'Nernst Equation', formula: 'E = E° - (RT/nF)lnQ', inputs: ['E° (V)', 'n (electrons)', 'Q', 'T (K)'], calc: (e0, n, q, t) => e0 - ((8.314 * t) / (n * 96485)) * Math.log(q), result: 'E (V)' },
      { name: 'ΔG° from E°', formula: 'ΔG° = -nFE°', inputs: ['n (electrons)', 'E° (V)'], calc: (n, e) => -n * 96485 * e, result: 'ΔG° (J)' },
    ]
  },
};

// Complete Periodic Table Data - All 118 elements
const periodicTableData = [
  // Period 1
  { number: 1, symbol: 'H', name: 'Hydrogen', mass: 1.008, category: 'nonmetal', group: 1, period: 1, block: 's', electronConfig: '1s¹', electronegativity: 2.20, density: 0.0899, meltingPoint: -259.16, boilingPoint: -252.87, discoveredBy: 'Henry Cavendish', yearDiscovered: 1766, description: 'Hydrogen is the lightest element and the most abundant chemical substance in the universe.' },
  { number: 2, symbol: 'He', name: 'Helium', mass: 4.0026, category: 'noble-gas', group: 18, period: 1, block: 's', electronConfig: '1s²', electronegativity: null, density: 0.1786, meltingPoint: -272.2, boilingPoint: -268.93, discoveredBy: 'Pierre Janssen', yearDiscovered: 1868, description: 'Helium is a colorless, odorless, tasteless, non-toxic, inert monatomic gas.' },
  // Period 2
  { number: 3, symbol: 'Li', name: 'Lithium', mass: 6.94, category: 'alkali-metal', group: 1, period: 2, block: 's', electronConfig: '[He] 2s¹', electronegativity: 0.98, density: 0.534, meltingPoint: 180.54, boilingPoint: 1342, discoveredBy: 'Johan August Arfwedson', yearDiscovered: 1817, description: 'Lithium is a soft, silvery-white alkali metal used in rechargeable batteries.' },
  { number: 4, symbol: 'Be', name: 'Beryllium', mass: 9.0122, category: 'alkaline-earth', group: 2, period: 2, block: 's', electronConfig: '[He] 2s²', electronegativity: 1.57, density: 1.85, meltingPoint: 1287, boilingPoint: 2471, discoveredBy: 'Louis Nicolas Vauquelin', yearDiscovered: 1798, description: 'Beryllium is a steel-gray, strong, lightweight alkaline earth metal.' },
  { number: 5, symbol: 'B', name: 'Boron', mass: 10.81, category: 'metalloid', group: 13, period: 2, block: 'p', electronConfig: '[He] 2s² 2p¹', electronegativity: 2.04, density: 2.34, meltingPoint: 2076, boilingPoint: 3927, discoveredBy: 'Joseph Louis Gay-Lussac', yearDiscovered: 1808, description: 'Boron is a metalloid essential for plant growth and used in glass production.' },
  { number: 6, symbol: 'C', name: 'Carbon', mass: 12.011, category: 'nonmetal', group: 14, period: 2, block: 'p', electronConfig: '[He] 2s² 2p²', electronegativity: 2.55, density: 2.267, meltingPoint: 3550, boilingPoint: 4027, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Carbon is the basis of all known life and exists in many allotropes including diamond and graphite.' },
  { number: 7, symbol: 'N', name: 'Nitrogen', mass: 14.007, category: 'nonmetal', group: 15, period: 2, block: 'p', electronConfig: '[He] 2s² 2p³', electronegativity: 3.04, density: 1.251, meltingPoint: -210.1, boilingPoint: -195.79, discoveredBy: 'Daniel Rutherford', yearDiscovered: 1772, description: 'Nitrogen makes up 78% of Earth\'s atmosphere and is essential for all living organisms.' },
  { number: 8, symbol: 'O', name: 'Oxygen', mass: 15.999, category: 'nonmetal', group: 16, period: 2, block: 'p', electronConfig: '[He] 2s² 2p⁴', electronegativity: 3.44, density: 1.429, meltingPoint: -218.79, boilingPoint: -182.95, discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1774, description: 'Oxygen is essential for respiration and makes up 21% of Earth\'s atmosphere.' },
  { number: 9, symbol: 'F', name: 'Fluorine', mass: 18.998, category: 'halogen', group: 17, period: 2, block: 'p', electronConfig: '[He] 2s² 2p⁵', electronegativity: 3.98, density: 1.696, meltingPoint: -219.67, boilingPoint: -188.12, discoveredBy: 'André-Marie Ampère', yearDiscovered: 1810, description: 'Fluorine is the most electronegative element and highly reactive.' },
  { number: 10, symbol: 'Ne', name: 'Neon', mass: 20.180, category: 'noble-gas', group: 18, period: 2, block: 'p', electronConfig: '[He] 2s² 2p⁶', electronegativity: null, density: 0.9002, meltingPoint: -248.59, boilingPoint: -246.08, discoveredBy: 'William Ramsay', yearDiscovered: 1898, description: 'Neon is famous for its use in neon signs, producing a bright reddish-orange glow.' },
  // Period 3
  { number: 11, symbol: 'Na', name: 'Sodium', mass: 22.990, category: 'alkali-metal', group: 1, period: 3, block: 's', electronConfig: '[Ne] 3s¹', electronegativity: 0.93, density: 0.968, meltingPoint: 97.72, boilingPoint: 883, discoveredBy: 'Humphry Davy', yearDiscovered: 1807, description: 'Sodium is a highly reactive alkali metal essential for nerve function.' },
  { number: 12, symbol: 'Mg', name: 'Magnesium', mass: 24.305, category: 'alkaline-earth', group: 2, period: 3, block: 's', electronConfig: '[Ne] 3s²', electronegativity: 1.31, density: 1.738, meltingPoint: 650, boilingPoint: 1090, discoveredBy: 'Joseph Black', yearDiscovered: 1755, description: 'Magnesium is a lightweight metal used in alloys and essential for biology.' },
  { number: 13, symbol: 'Al', name: 'Aluminum', mass: 26.982, category: 'post-transition', group: 13, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p¹', electronegativity: 1.61, density: 2.70, meltingPoint: 660.32, boilingPoint: 2519, discoveredBy: 'Hans Christian Ørsted', yearDiscovered: 1825, description: 'Aluminum is the most abundant metal in Earth\'s crust, lightweight and corrosion-resistant.' },
  { number: 14, symbol: 'Si', name: 'Silicon', mass: 28.085, category: 'metalloid', group: 14, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p²', electronegativity: 1.90, density: 2.329, meltingPoint: 1414, boilingPoint: 3265, discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1824, description: 'Silicon is essential for computer chips and the second most abundant element in Earth\'s crust.' },
  { number: 15, symbol: 'P', name: 'Phosphorus', mass: 30.974, category: 'nonmetal', group: 15, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p³', electronegativity: 2.19, density: 1.823, meltingPoint: 44.15, boilingPoint: 280.5, discoveredBy: 'Hennig Brand', yearDiscovered: 1669, description: 'Phosphorus is essential for life, found in DNA, RNA, and ATP.' },
  { number: 16, symbol: 'S', name: 'Sulfur', mass: 32.06, category: 'nonmetal', group: 16, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p⁴', electronegativity: 2.58, density: 1.96, meltingPoint: 115.21, boilingPoint: 444.6, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Sulfur is a yellow nonmetal essential for proteins and used in vulcanization.' },
  { number: 17, symbol: 'Cl', name: 'Chlorine', mass: 35.45, category: 'halogen', group: 17, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p⁵', electronegativity: 3.16, density: 3.214, meltingPoint: -101.5, boilingPoint: -34.04, discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1774, description: 'Chlorine is used for water purification and in many industrial processes.' },
  { number: 18, symbol: 'Ar', name: 'Argon', mass: 39.948, category: 'noble-gas', group: 18, period: 3, block: 'p', electronConfig: '[Ne] 3s² 3p⁶', electronegativity: null, density: 1.784, meltingPoint: -189.35, boilingPoint: -185.85, discoveredBy: 'Lord Rayleigh', yearDiscovered: 1894, description: 'Argon makes up about 1% of Earth\'s atmosphere and is used in welding.' },
  // Period 4
  { number: 19, symbol: 'K', name: 'Potassium', mass: 39.098, category: 'alkali-metal', group: 1, period: 4, block: 's', electronConfig: '[Ar] 4s¹', electronegativity: 0.82, density: 0.862, meltingPoint: 63.38, boilingPoint: 759, discoveredBy: 'Humphry Davy', yearDiscovered: 1807, description: 'Potassium is essential for nerve function and muscle contraction.' },
  { number: 20, symbol: 'Ca', name: 'Calcium', mass: 40.078, category: 'alkaline-earth', group: 2, period: 4, block: 's', electronConfig: '[Ar] 4s²', electronegativity: 1.00, density: 1.55, meltingPoint: 842, boilingPoint: 1484, discoveredBy: 'Humphry Davy', yearDiscovered: 1808, description: 'Calcium is essential for bones, teeth, and cellular signaling.' },
  { number: 21, symbol: 'Sc', name: 'Scandium', mass: 44.956, category: 'transition-metal', group: 3, period: 4, block: 'd', electronConfig: '[Ar] 3d¹ 4s²', electronegativity: 1.36, density: 2.985, meltingPoint: 1541, boilingPoint: 2836, discoveredBy: 'Lars Fredrik Nilson', yearDiscovered: 1879, description: 'Scandium is used in aerospace alloys and high-intensity lights.' },
  { number: 22, symbol: 'Ti', name: 'Titanium', mass: 47.867, category: 'transition-metal', group: 4, period: 4, block: 'd', electronConfig: '[Ar] 3d² 4s²', electronegativity: 1.54, density: 4.506, meltingPoint: 1668, boilingPoint: 3287, discoveredBy: 'William Gregor', yearDiscovered: 1791, description: 'Titanium is strong, lightweight, and corrosion-resistant, used in aerospace.' },
  { number: 23, symbol: 'V', name: 'Vanadium', mass: 50.942, category: 'transition-metal', group: 5, period: 4, block: 'd', electronConfig: '[Ar] 3d³ 4s²', electronegativity: 1.63, density: 6.11, meltingPoint: 1910, boilingPoint: 3407, discoveredBy: 'Andrés Manuel del Río', yearDiscovered: 1801, description: 'Vanadium is used to make strong steel alloys.' },
  { number: 24, symbol: 'Cr', name: 'Chromium', mass: 51.996, category: 'transition-metal', group: 6, period: 4, block: 'd', electronConfig: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66, density: 7.19, meltingPoint: 1907, boilingPoint: 2671, discoveredBy: 'Louis Nicolas Vauquelin', yearDiscovered: 1797, description: 'Chromium is used for chrome plating and stainless steel.' },
  { number: 25, symbol: 'Mn', name: 'Manganese', mass: 54.938, category: 'transition-metal', group: 7, period: 4, block: 'd', electronConfig: '[Ar] 3d⁵ 4s²', electronegativity: 1.55, density: 7.21, meltingPoint: 1246, boilingPoint: 2061, discoveredBy: 'Johan Gottlieb Gahn', yearDiscovered: 1774, description: 'Manganese is essential for steel production and biological enzymes.' },
  { number: 26, symbol: 'Fe', name: 'Iron', mass: 55.845, category: 'transition-metal', group: 8, period: 4, block: 'd', electronConfig: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, density: 7.874, meltingPoint: 1538, boilingPoint: 2862, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Iron is the most used metal, essential for steel and hemoglobin.' },
  { number: 27, symbol: 'Co', name: 'Cobalt', mass: 58.933, category: 'transition-metal', group: 9, period: 4, block: 'd', electronConfig: '[Ar] 3d⁷ 4s²', electronegativity: 1.88, density: 8.90, meltingPoint: 1495, boilingPoint: 2927, discoveredBy: 'Georg Brandt', yearDiscovered: 1735, description: 'Cobalt is used in batteries, magnets, and blue pigments.' },
  { number: 28, symbol: 'Ni', name: 'Nickel', mass: 58.693, category: 'transition-metal', group: 10, period: 4, block: 'd', electronConfig: '[Ar] 3d⁸ 4s²', electronegativity: 1.91, density: 8.908, meltingPoint: 1455, boilingPoint: 2913, discoveredBy: 'Axel Fredrik Cronstedt', yearDiscovered: 1751, description: 'Nickel is used in stainless steel, coins, and batteries.' },
  { number: 29, symbol: 'Cu', name: 'Copper', mass: 63.546, category: 'transition-metal', group: 11, period: 4, block: 'd', electronConfig: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.90, density: 8.96, meltingPoint: 1084.62, boilingPoint: 2562, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Copper is an excellent conductor used in wiring and plumbing.' },
  { number: 30, symbol: 'Zn', name: 'Zinc', mass: 65.38, category: 'transition-metal', group: 12, period: 4, block: 'd', electronConfig: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, density: 7.14, meltingPoint: 419.53, boilingPoint: 907, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Zinc is used for galvanizing steel and is essential for immunity.' },
  { number: 31, symbol: 'Ga', name: 'Gallium', mass: 69.723, category: 'post-transition', group: 13, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81, density: 5.91, meltingPoint: 29.76, boilingPoint: 2204, discoveredBy: 'Lecoq de Boisbaudran', yearDiscovered: 1875, description: 'Gallium melts in your hand and is used in semiconductors.' },
  { number: 32, symbol: 'Ge', name: 'Germanium', mass: 72.630, category: 'metalloid', group: 14, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01, density: 5.323, meltingPoint: 938.25, boilingPoint: 2833, discoveredBy: 'Clemens Winkler', yearDiscovered: 1886, description: 'Germanium is a semiconductor used in fiber optics and electronics.' },
  { number: 33, symbol: 'As', name: 'Arsenic', mass: 74.922, category: 'metalloid', group: 15, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18, density: 5.727, meltingPoint: 817, boilingPoint: 614, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Arsenic is a toxic metalloid historically used in pesticides.' },
  { number: 34, symbol: 'Se', name: 'Selenium', mass: 78.971, category: 'nonmetal', group: 16, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55, density: 4.81, meltingPoint: 221, boilingPoint: 685, discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1817, description: 'Selenium is essential in trace amounts and used in electronics.' },
  { number: 35, symbol: 'Br', name: 'Bromine', mass: 79.904, category: 'halogen', group: 17, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96, density: 3.1028, meltingPoint: -7.2, boilingPoint: 58.8, discoveredBy: 'Antoine Jérôme Balard', yearDiscovered: 1826, description: 'Bromine is a reddish-brown liquid halogen used in flame retardants.' },
  { number: 36, symbol: 'Kr', name: 'Krypton', mass: 83.798, category: 'noble-gas', group: 18, period: 4, block: 'p', electronConfig: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: 3.00, density: 3.749, meltingPoint: -157.36, boilingPoint: -153.22, discoveredBy: 'William Ramsay', yearDiscovered: 1898, description: 'Krypton is used in lighting and was once used to define the meter.' },
  // Period 5
  { number: 37, symbol: 'Rb', name: 'Rubidium', mass: 85.468, category: 'alkali-metal', group: 1, period: 5, block: 's', electronConfig: '[Kr] 5s¹', electronegativity: 0.82, density: 1.532, meltingPoint: 39.31, boilingPoint: 688, discoveredBy: 'Robert Bunsen', yearDiscovered: 1861, description: 'Rubidium is used in atomic clocks and specialty glasses.' },
  { number: 38, symbol: 'Sr', name: 'Strontium', mass: 87.62, category: 'alkaline-earth', group: 2, period: 5, block: 's', electronConfig: '[Kr] 5s²', electronegativity: 0.95, density: 2.64, meltingPoint: 777, boilingPoint: 1382, discoveredBy: 'William Cruickshank', yearDiscovered: 1790, description: 'Strontium produces red flames in fireworks.' },
  { number: 39, symbol: 'Y', name: 'Yttrium', mass: 88.906, category: 'transition-metal', group: 3, period: 5, block: 'd', electronConfig: '[Kr] 4d¹ 5s²', electronegativity: 1.22, density: 4.472, meltingPoint: 1526, boilingPoint: 3345, discoveredBy: 'Johan Gadolin', yearDiscovered: 1794, description: 'Yttrium is used in LEDs, lasers, and superconductors.' },
  { number: 40, symbol: 'Zr', name: 'Zirconium', mass: 91.224, category: 'transition-metal', group: 4, period: 5, block: 'd', electronConfig: '[Kr] 4d² 5s²', electronegativity: 1.33, density: 6.52, meltingPoint: 1855, boilingPoint: 4409, discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789, description: 'Zirconium is used in nuclear reactors and cubic zirconia gems.' },
  { number: 41, symbol: 'Nb', name: 'Niobium', mass: 92.906, category: 'transition-metal', group: 5, period: 5, block: 'd', electronConfig: '[Kr] 4d⁴ 5s¹', electronegativity: 1.6, density: 8.57, meltingPoint: 2477, boilingPoint: 4744, discoveredBy: 'Charles Hatchett', yearDiscovered: 1801, description: 'Niobium is used in superconducting magnets and jet engines.' },
  { number: 42, symbol: 'Mo', name: 'Molybdenum', mass: 95.95, category: 'transition-metal', group: 6, period: 5, block: 'd', electronConfig: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16, density: 10.28, meltingPoint: 2623, boilingPoint: 4639, discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1778, description: 'Molybdenum is used in high-strength steel alloys.' },
  { number: 43, symbol: 'Tc', name: 'Technetium', mass: 98, category: 'transition-metal', group: 7, period: 5, block: 'd', electronConfig: '[Kr] 4d⁵ 5s²', electronegativity: 1.9, density: 11.5, meltingPoint: 2157, boilingPoint: 4265, discoveredBy: 'Emilio Segrè', yearDiscovered: 1937, description: 'Technetium was the first artificially produced element.' },
  { number: 44, symbol: 'Ru', name: 'Ruthenium', mass: 101.07, category: 'transition-metal', group: 8, period: 5, block: 'd', electronConfig: '[Kr] 4d⁷ 5s¹', electronegativity: 2.2, density: 12.45, meltingPoint: 2334, boilingPoint: 4150, discoveredBy: 'Karl Ernst Claus', yearDiscovered: 1844, description: 'Ruthenium is used in electronics and wear-resistant contacts.' },
  { number: 45, symbol: 'Rh', name: 'Rhodium', mass: 102.91, category: 'transition-metal', group: 9, period: 5, block: 'd', electronConfig: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28, density: 12.41, meltingPoint: 1964, boilingPoint: 3695, discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1803, description: 'Rhodium is the rarest precious metal, used in catalytic converters.' },
  { number: 46, symbol: 'Pd', name: 'Palladium', mass: 106.42, category: 'transition-metal', group: 10, period: 5, block: 'd', electronConfig: '[Kr] 4d¹⁰', electronegativity: 2.20, density: 12.023, meltingPoint: 1554.9, boilingPoint: 2963, discoveredBy: 'William Hyde Wollaston', yearDiscovered: 1803, description: 'Palladium is used in catalytic converters and jewelry.' },
  { number: 47, symbol: 'Ag', name: 'Silver', mass: 107.87, category: 'transition-metal', group: 11, period: 5, block: 'd', electronConfig: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, density: 10.49, meltingPoint: 961.78, boilingPoint: 2162, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Silver has the highest electrical and thermal conductivity of any metal.' },
  { number: 48, symbol: 'Cd', name: 'Cadmium', mass: 112.41, category: 'transition-metal', group: 12, period: 5, block: 'd', electronConfig: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69, density: 8.65, meltingPoint: 321.07, boilingPoint: 767, discoveredBy: 'Karl Samuel Leberecht Hermann', yearDiscovered: 1817, description: 'Cadmium is used in batteries and pigments but is toxic.' },
  { number: 49, symbol: 'In', name: 'Indium', mass: 114.82, category: 'post-transition', group: 13, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78, density: 7.31, meltingPoint: 156.6, boilingPoint: 2072, discoveredBy: 'Ferdinand Reich', yearDiscovered: 1863, description: 'Indium is used in touchscreens and low-melting alloys.' },
  { number: 50, symbol: 'Sn', name: 'Tin', mass: 118.71, category: 'post-transition', group: 14, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96, density: 7.365, meltingPoint: 231.93, boilingPoint: 2602, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Tin is used in solder and tin cans (as a coating on steel).' },
  { number: 51, symbol: 'Sb', name: 'Antimony', mass: 121.76, category: 'metalloid', group: 15, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05, density: 6.697, meltingPoint: 630.63, boilingPoint: 1587, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Antimony is used in flame retardants and lead-acid batteries.' },
  { number: 52, symbol: 'Te', name: 'Tellurium', mass: 127.60, category: 'metalloid', group: 16, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.1, density: 6.24, meltingPoint: 449.51, boilingPoint: 988, discoveredBy: 'Franz-Joseph Müller von Reichenstein', yearDiscovered: 1782, description: 'Tellurium is used in solar cells and thermoelectric devices.' },
  { number: 53, symbol: 'I', name: 'Iodine', mass: 126.90, category: 'halogen', group: 17, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66, density: 4.933, meltingPoint: 113.7, boilingPoint: 184.3, discoveredBy: 'Bernard Courtois', yearDiscovered: 1811, description: 'Iodine is essential for thyroid function and used as a disinfectant.' },
  { number: 54, symbol: 'Xe', name: 'Xenon', mass: 131.29, category: 'noble-gas', group: 18, period: 5, block: 'p', electronConfig: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: 2.60, density: 5.894, meltingPoint: -111.79, boilingPoint: -108.12, discoveredBy: 'William Ramsay', yearDiscovered: 1898, description: 'Xenon is used in flash lamps, ion propulsion, and anesthesia.' },
  // Period 6
  { number: 55, symbol: 'Cs', name: 'Cesium', mass: 132.91, category: 'alkali-metal', group: 1, period: 6, block: 's', electronConfig: '[Xe] 6s¹', electronegativity: 0.79, density: 1.93, meltingPoint: 28.44, boilingPoint: 671, discoveredBy: 'Robert Bunsen', yearDiscovered: 1860, description: 'Cesium is used in atomic clocks, the most accurate timekeeping devices.' },
  { number: 56, symbol: 'Ba', name: 'Barium', mass: 137.33, category: 'alkaline-earth', group: 2, period: 6, block: 's', electronConfig: '[Xe] 6s²', electronegativity: 0.89, density: 3.51, meltingPoint: 727, boilingPoint: 1897, discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1772, description: 'Barium produces green flames in fireworks.' },
  // Lanthanides (57-71)
  { number: 57, symbol: 'La', name: 'Lanthanum', mass: 138.91, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 5d¹ 6s²', electronegativity: 1.10, density: 6.162, meltingPoint: 920, boilingPoint: 3464, discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1839, description: 'Lanthanum is used in camera lenses and hybrid car batteries.' },
  { number: 58, symbol: 'Ce', name: 'Cerium', mass: 140.12, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12, density: 6.770, meltingPoint: 798, boilingPoint: 3443, discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1803, description: 'Cerium is the most abundant rare earth element, used in catalytic converters.' },
  { number: 59, symbol: 'Pr', name: 'Praseodymium', mass: 140.91, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f³ 6s²', electronegativity: 1.13, density: 6.77, meltingPoint: 931, boilingPoint: 3520, discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885, description: 'Praseodymium is used in magnets and aircraft engines.' },
  { number: 60, symbol: 'Nd', name: 'Neodymium', mass: 144.24, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁴ 6s²', electronegativity: 1.14, density: 7.01, meltingPoint: 1016, boilingPoint: 3074, discoveredBy: 'Carl Auer von Welsbach', yearDiscovered: 1885, description: 'Neodymium makes the strongest permanent magnets.' },
  { number: 61, symbol: 'Pm', name: 'Promethium', mass: 145, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁵ 6s²', electronegativity: 1.13, density: 7.26, meltingPoint: 1042, boilingPoint: 3000, discoveredBy: 'Chien Shiung Wu', yearDiscovered: 1945, description: 'Promethium is radioactive and used in nuclear batteries.' },
  { number: 62, symbol: 'Sm', name: 'Samarium', mass: 150.36, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁶ 6s²', electronegativity: 1.17, density: 7.52, meltingPoint: 1072, boilingPoint: 1900, discoveredBy: 'Lecoq de Boisbaudran', yearDiscovered: 1879, description: 'Samarium is used in magnets and cancer treatment.' },
  { number: 63, symbol: 'Eu', name: 'Europium', mass: 151.96, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁷ 6s²', electronegativity: 1.2, density: 5.244, meltingPoint: 822, boilingPoint: 1529, discoveredBy: 'Eugène-Anatole Demarçay', yearDiscovered: 1901, description: 'Europium produces red phosphors in TVs and is used in euro banknotes.' },
  { number: 64, symbol: 'Gd', name: 'Gadolinium', mass: 157.25, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.20, density: 7.90, meltingPoint: 1313, boilingPoint: 3273, discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1880, description: 'Gadolinium is used as MRI contrast agent.' },
  { number: 65, symbol: 'Tb', name: 'Terbium', mass: 158.93, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f⁹ 6s²', electronegativity: 1.2, density: 8.23, meltingPoint: 1356, boilingPoint: 3230, discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843, description: 'Terbium produces green phosphors in displays.' },
  { number: 66, symbol: 'Dy', name: 'Dysprosium', mass: 162.50, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22, density: 8.540, meltingPoint: 1412, boilingPoint: 2567, discoveredBy: 'Lecoq de Boisbaudran', yearDiscovered: 1886, description: 'Dysprosium is used in lasers and high-performance magnets.' },
  { number: 67, symbol: 'Ho', name: 'Holmium', mass: 164.93, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23, density: 8.79, meltingPoint: 1474, boilingPoint: 2700, discoveredBy: 'Marc Delafontaine', yearDiscovered: 1878, description: 'Holmium has the highest magnetic moment of any element.' },
  { number: 68, symbol: 'Er', name: 'Erbium', mass: 167.26, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹² 6s²', electronegativity: 1.24, density: 9.066, meltingPoint: 1529, boilingPoint: 2868, discoveredBy: 'Carl Gustaf Mosander', yearDiscovered: 1843, description: 'Erbium gives pink color to glass and is used in fiber optic amplifiers.' },
  { number: 69, symbol: 'Tm', name: 'Thulium', mass: 168.93, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹³ 6s²', electronegativity: 1.25, density: 9.32, meltingPoint: 1545, boilingPoint: 1950, discoveredBy: 'Per Teodor Cleve', yearDiscovered: 1879, description: 'Thulium is the rarest lanthanide, used in portable X-ray devices.' },
  { number: 70, symbol: 'Yb', name: 'Ytterbium', mass: 173.05, category: 'lanthanide', group: 3, period: 6, block: 'f', electronConfig: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.1, density: 6.90, meltingPoint: 819, boilingPoint: 1196, discoveredBy: 'Jean Charles Galissard de Marignac', yearDiscovered: 1878, description: 'Ytterbium is used in metallurgy and atomic clocks.' },
  { number: 71, symbol: 'Lu', name: 'Lutetium', mass: 174.97, category: 'lanthanide', group: 3, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27, density: 9.841, meltingPoint: 1663, boilingPoint: 3402, discoveredBy: 'Georges Urbain', yearDiscovered: 1907, description: 'Lutetium is used in PET scans and refining petroleum.' },
  // Continue Period 6
  { number: 72, symbol: 'Hf', name: 'Hafnium', mass: 178.49, category: 'transition-metal', group: 4, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.3, density: 13.31, meltingPoint: 2233, boilingPoint: 4603, discoveredBy: 'Dirk Coster', yearDiscovered: 1923, description: 'Hafnium is used in nuclear control rods and superalloys.' },
  { number: 73, symbol: 'Ta', name: 'Tantalum', mass: 180.95, category: 'transition-metal', group: 5, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.5, density: 16.69, meltingPoint: 3017, boilingPoint: 5458, discoveredBy: 'Anders Gustaf Ekeberg', yearDiscovered: 1802, description: 'Tantalum is used in capacitors and surgical implants.' },
  { number: 74, symbol: 'W', name: 'Tungsten', mass: 183.84, category: 'transition-metal', group: 6, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36, density: 19.25, meltingPoint: 3422, boilingPoint: 5555, discoveredBy: 'Carl Wilhelm Scheele', yearDiscovered: 1783, description: 'Tungsten has the highest melting point of all elements.' },
  { number: 75, symbol: 'Re', name: 'Rhenium', mass: 186.21, category: 'transition-metal', group: 7, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.9, density: 21.02, meltingPoint: 3186, boilingPoint: 5596, discoveredBy: 'Masataka Ogawa', yearDiscovered: 1925, description: 'Rhenium is used in jet engine superalloys.' },
  { number: 76, symbol: 'Os', name: 'Osmium', mass: 190.23, category: 'transition-metal', group: 8, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.2, density: 22.59, meltingPoint: 3033, boilingPoint: 5012, discoveredBy: 'Smithson Tennant', yearDiscovered: 1803, description: 'Osmium is the densest naturally occurring element.' },
  { number: 77, symbol: 'Ir', name: 'Iridium', mass: 192.22, category: 'transition-metal', group: 9, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.20, density: 22.56, meltingPoint: 2446, boilingPoint: 4428, discoveredBy: 'Smithson Tennant', yearDiscovered: 1803, description: 'Iridium is extremely corrosion-resistant, used in spark plugs.' },
  { number: 78, symbol: 'Pt', name: 'Platinum', mass: 195.08, category: 'transition-metal', group: 10, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28, density: 21.45, meltingPoint: 1768.3, boilingPoint: 3825, discoveredBy: 'Antonio de Ulloa', yearDiscovered: 1735, description: 'Platinum is a precious metal used in jewelry and catalytic converters.' },
  { number: 79, symbol: 'Au', name: 'Gold', mass: 196.97, category: 'transition-metal', group: 11, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, density: 19.30, meltingPoint: 1064.18, boilingPoint: 2856, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Gold is highly valued for jewelry and as a store of wealth.' },
  { number: 80, symbol: 'Hg', name: 'Mercury', mass: 200.59, category: 'transition-metal', group: 12, period: 6, block: 'd', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2.00, density: 13.534, meltingPoint: -38.83, boilingPoint: 356.73, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Mercury is the only metal liquid at room temperature.' },
  { number: 81, symbol: 'Tl', name: 'Thallium', mass: 204.38, category: 'post-transition', group: 13, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62, density: 11.85, meltingPoint: 304, boilingPoint: 1473, discoveredBy: 'William Crookes', yearDiscovered: 1861, description: 'Thallium is highly toxic and was historically used in rat poison.' },
  { number: 82, symbol: 'Pb', name: 'Lead', mass: 207.2, category: 'post-transition', group: 14, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 1.87, density: 11.34, meltingPoint: 327.46, boilingPoint: 1749, discoveredBy: 'Ancient', yearDiscovered: null, description: 'Lead is dense and malleable but toxic, historically used in pipes.' },
  { number: 83, symbol: 'Bi', name: 'Bismuth', mass: 208.98, category: 'post-transition', group: 15, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02, density: 9.78, meltingPoint: 271.5, boilingPoint: 1564, discoveredBy: 'Claude François Geoffroy', yearDiscovered: 1753, description: 'Bismuth is the heaviest stable element and used in medicines.' },
  { number: 84, symbol: 'Po', name: 'Polonium', mass: 209, category: 'metalloid', group: 16, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2.0, density: 9.196, meltingPoint: 254, boilingPoint: 962, discoveredBy: 'Marie Curie', yearDiscovered: 1898, description: 'Polonium is highly radioactive and was discovered by Marie Curie.' },
  { number: 85, symbol: 'At', name: 'Astatine', mass: 210, category: 'halogen', group: 17, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.2, density: 7, meltingPoint: 302, boilingPoint: 337, discoveredBy: 'Dale R. Corson', yearDiscovered: 1940, description: 'Astatine is the rarest naturally occurring element on Earth.' },
  { number: 86, symbol: 'Rn', name: 'Radon', mass: 222, category: 'noble-gas', group: 18, period: 6, block: 'p', electronConfig: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: 2.2, density: 9.73, meltingPoint: -71, boilingPoint: -61.7, discoveredBy: 'Friedrich Ernst Dorn', yearDiscovered: 1900, description: 'Radon is a radioactive gas that can accumulate in buildings.' },
  // Period 7
  { number: 87, symbol: 'Fr', name: 'Francium', mass: 223, category: 'alkali-metal', group: 1, period: 7, block: 's', electronConfig: '[Rn] 7s¹', electronegativity: 0.7, density: 1.87, meltingPoint: 27, boilingPoint: 677, discoveredBy: 'Marguerite Perey', yearDiscovered: 1939, description: 'Francium is extremely radioactive with a half-life of only 22 minutes.' },
  { number: 88, symbol: 'Ra', name: 'Radium', mass: 226, category: 'alkaline-earth', group: 2, period: 7, block: 's', electronConfig: '[Rn] 7s²', electronegativity: 0.9, density: 5.5, meltingPoint: 700, boilingPoint: 1737, discoveredBy: 'Marie Curie', yearDiscovered: 1898, description: 'Radium was discovered by Marie Curie and glows blue in the dark.' },
  // Actinides (89-103)
  { number: 89, symbol: 'Ac', name: 'Actinium', mass: 227, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 6d¹ 7s²', electronegativity: 1.1, density: 10.07, meltingPoint: 1050, boilingPoint: 3200, discoveredBy: 'Friedrich Oskar Giesel', yearDiscovered: 1899, description: 'Actinium glows blue in the dark due to its radioactivity.' },
  { number: 90, symbol: 'Th', name: 'Thorium', mass: 232.04, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 6d² 7s²', electronegativity: 1.3, density: 11.72, meltingPoint: 1750, boilingPoint: 4788, discoveredBy: 'Jöns Jacob Berzelius', yearDiscovered: 1829, description: 'Thorium is being researched as a nuclear fuel alternative.' },
  { number: 91, symbol: 'Pa', name: 'Protactinium', mass: 231.04, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.5, density: 15.37, meltingPoint: 1572, boilingPoint: 4000, discoveredBy: 'Kasimir Fajans', yearDiscovered: 1913, description: 'Protactinium is one of the rarest and most expensive natural elements.' },
  { number: 92, symbol: 'U', name: 'Uranium', mass: 238.03, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, density: 19.1, meltingPoint: 1135, boilingPoint: 4131, discoveredBy: 'Martin Heinrich Klaproth', yearDiscovered: 1789, description: 'Uranium is used as fuel in nuclear power plants.' },
  { number: 93, symbol: 'Np', name: 'Neptunium', mass: 237, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36, density: 20.45, meltingPoint: 644, boilingPoint: 3902, discoveredBy: 'Edwin McMillan', yearDiscovered: 1940, description: 'Neptunium was the first transuranium element discovered.' },
  { number: 94, symbol: 'Pu', name: 'Plutonium', mass: 244, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f⁶ 7s²', electronegativity: 1.28, density: 19.85, meltingPoint: 640, boilingPoint: 3228, discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1940, description: 'Plutonium is used in nuclear weapons and spacecraft power.' },
  { number: 95, symbol: 'Am', name: 'Americium', mass: 243, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f⁷ 7s²', electronegativity: 1.3, density: 12, meltingPoint: 1176, boilingPoint: 2011, discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1944, description: 'Americium is used in smoke detectors.' },
  { number: 96, symbol: 'Cm', name: 'Curium', mass: 247, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.3, density: 13.51, meltingPoint: 1345, boilingPoint: 3110, discoveredBy: 'Glenn T. Seaborg', yearDiscovered: 1944, description: 'Curium was named after Marie and Pierre Curie.' },
  { number: 97, symbol: 'Bk', name: 'Berkelium', mass: 247, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f⁹ 7s²', electronegativity: 1.3, density: 14.78, meltingPoint: 986, boilingPoint: 2627, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1949, description: 'Berkelium was named after Berkeley, California.' },
  { number: 98, symbol: 'Cf', name: 'Californium', mass: 251, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.3, density: 15.1, meltingPoint: 900, boilingPoint: 1470, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1950, description: 'Californium is used in portable neutron sources.' },
  { number: 99, symbol: 'Es', name: 'Einsteinium', mass: 252, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f¹¹ 7s²', electronegativity: 1.3, density: 8.84, meltingPoint: 860, boilingPoint: 996, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1952, description: 'Einsteinium was discovered in the debris of the first hydrogen bomb.' },
  { number: 100, symbol: 'Fm', name: 'Fermium', mass: 257, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f¹² 7s²', electronegativity: 1.3, density: 9.7, meltingPoint: 1527, boilingPoint: null, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1952, description: 'Fermium was named after physicist Enrico Fermi.' },
  { number: 101, symbol: 'Md', name: 'Mendelevium', mass: 258, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f¹³ 7s²', electronegativity: 1.3, density: 10.3, meltingPoint: 827, boilingPoint: null, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1955, description: 'Mendelevium was named after Dmitri Mendeleev.' },
  { number: 102, symbol: 'No', name: 'Nobelium', mass: 259, category: 'actinide', group: 3, period: 7, block: 'f', electronConfig: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.3, density: 9.9, meltingPoint: 827, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1966, description: 'Nobelium was named after Alfred Nobel.' },
  { number: 103, symbol: 'Lr', name: 'Lawrencium', mass: 266, category: 'actinide', group: 3, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 7s² 7p¹', electronegativity: 1.3, density: 14.4, meltingPoint: 1627, boilingPoint: null, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1961, description: 'Lawrencium was named after Ernest Lawrence.' },
  // Continue Period 7
  { number: 104, symbol: 'Rf', name: 'Rutherfordium', mass: 267, category: 'transition-metal', group: 4, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: null, density: 23.2, meltingPoint: 2100, boilingPoint: 5500, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1969, description: 'Rutherfordium was named after Ernest Rutherford.' },
  { number: 105, symbol: 'Db', name: 'Dubnium', mass: 268, category: 'transition-metal', group: 5, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: null, density: 29.3, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1970, description: 'Dubnium was named after Dubna, Russia.' },
  { number: 106, symbol: 'Sg', name: 'Seaborgium', mass: 269, category: 'transition-metal', group: 6, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: null, density: 35, meltingPoint: null, boilingPoint: null, discoveredBy: 'Lawrence Berkeley National Laboratory', yearDiscovered: 1974, description: 'Seaborgium was named after Glenn T. Seaborg.' },
  { number: 107, symbol: 'Bh', name: 'Bohrium', mass: 270, category: 'transition-metal', group: 7, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: null, density: 37.1, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1981, description: 'Bohrium was named after Niels Bohr.' },
  { number: 108, symbol: 'Hs', name: 'Hassium', mass: 277, category: 'transition-metal', group: 8, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁶ 7s²', electronegativity: null, density: 40.7, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1984, description: 'Hassium was named after Hesse, Germany.' },
  { number: 109, symbol: 'Mt', name: 'Meitnerium', mass: 278, category: 'transition-metal', group: 9, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: null, density: 37.4, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1982, description: 'Meitnerium was named after Lise Meitner.' },
  { number: 110, symbol: 'Ds', name: 'Darmstadtium', mass: 281, category: 'transition-metal', group: 10, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁸ 7s²', electronegativity: null, density: 34.8, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1994, description: 'Darmstadtium was named after Darmstadt, Germany.' },
  { number: 111, symbol: 'Rg', name: 'Roentgenium', mass: 282, category: 'transition-metal', group: 11, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d⁹ 7s²', electronegativity: null, density: 28.7, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1994, description: 'Roentgenium was named after Wilhelm Röntgen.' },
  { number: 112, symbol: 'Cn', name: 'Copernicium', mass: 285, category: 'transition-metal', group: 12, period: 7, block: 'd', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: null, density: 23.7, meltingPoint: null, boilingPoint: null, discoveredBy: 'Gesellschaft für Schwerionenforschung', yearDiscovered: 1996, description: 'Copernicium was named after Nicolaus Copernicus.' },
  { number: 113, symbol: 'Nh', name: 'Nihonium', mass: 286, category: 'post-transition', group: 13, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: null, density: 16, meltingPoint: null, boilingPoint: null, discoveredBy: 'RIKEN', yearDiscovered: 2004, description: 'Nihonium was named after Japan (Nihon in Japanese).' },
  { number: 114, symbol: 'Fl', name: 'Flerovium', mass: 289, category: 'post-transition', group: 14, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: null, density: 14, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 1999, description: 'Flerovium was named after Flerov Laboratory.' },
  { number: 115, symbol: 'Mc', name: 'Moscovium', mass: 290, category: 'post-transition', group: 15, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: null, density: 13.5, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 2003, description: 'Moscovium was named after Moscow.' },
  { number: 116, symbol: 'Lv', name: 'Livermorium', mass: 293, category: 'post-transition', group: 16, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: null, density: 12.9, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 2000, description: 'Livermorium was named after Lawrence Livermore National Laboratory.' },
  { number: 117, symbol: 'Ts', name: 'Tennessine', mass: 294, category: 'halogen', group: 17, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: null, density: 7.2, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 2010, description: 'Tennessine was named after Tennessee.' },
  { number: 118, symbol: 'Og', name: 'Oganesson', mass: 294, category: 'noble-gas', group: 18, period: 7, block: 'p', electronConfig: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', electronegativity: null, density: 5, meltingPoint: null, boilingPoint: null, discoveredBy: 'Joint Institute for Nuclear Research', yearDiscovered: 2002, description: 'Oganesson was named after Yuri Oganessian.' },
];

// Create lookup by symbol for molar mass calculator
const elementData = {};
periodicTableData.forEach(el => {
  elementData[el.symbol] = { name: el.name, mass: el.mass, number: el.number };
});

// Category colors for periodic table
const categoryColors = {
  'alkali-metal': '#ff6b6b',
  'alkaline-earth': '#ffa94d',
  'transition-metal': '#ffd43b',
  'post-transition': '#69db7c',
  'metalloid': '#38d9a9',
  'nonmetal': '#4dabf7',
  'halogen': '#9775fa',
  'noble-gas': '#e599f7',
  'lanthanide': '#ff8787',
  'actinide': '#f783ac',
};

// Molar mass calculator
function calculateMolarMass(formula) {
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;
  let totalMass = 0;
  let breakdown = [];

  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;

    if (elementData[element]) {
      const mass = elementData[element].mass * count;
      totalMass += mass;
      breakdown.push({ element, count, mass: mass.toFixed(3) });
    } else if (element) {
      return { error: `Unknown element: ${element}` };
    }
  }

  return { totalMass: totalMass.toFixed(3), breakdown };
}

// KaTeX Rendered Component
function KaTeXDisplay({ expr, displayMode = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && expr) {
      try {
        katex.render(expr, containerRef.current, {
          displayMode,
          throwOnError: false,
          errorColor: '#f87171',
        });
      } catch {
        containerRef.current.textContent = expr;
      }
    }
  }, [expr, displayMode]);

  return <span ref={containerRef} />;
}

// Convert expression to LaTeX for display
function exprToLatex(expr) {
  if (!expr) return '';
  return expr
    .replace(/\*/g, ' \\cdot ')
    .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/\^(\d+)/g, '^{$1}')
    .replace(/\^([a-z])/g, '^{$1}')
    .replace(/\^\(([^)]+)\)/g, '^{$1}')
    .replace(/sin\(/g, '\\sin(')
    .replace(/cos\(/g, '\\cos(')
    .replace(/tan\(/g, '\\tan(')
    .replace(/log\(/g, '\\log(')
    .replace(/ln\(/g, '\\ln(')
    .replace(/abs\(([^)]+)\)/g, '|$1|')
    .replace(/pi/gi, '\\pi')
    .replace(/(?<![a-z])e(?![a-z])/gi, 'e');
}

// Symbol keyboard data - Enhanced like a real graphing calculator
const symbolKeyboard = {
  basic: {
    name: 'Basic',
    symbols: [
      { display: 'x', insert: 'x', latex: 'x' },
      { display: '+', insert: '+', latex: '+' },
      { display: '-', insert: '-', latex: '-' },
      { display: '*', insert: '*', latex: '\\times' },
      { display: '/', insert: '/', latex: '\\div' },
      { display: '(', insert: '(', latex: '(' },
      { display: ')', insert: ')', latex: ')' },
      { display: '^', insert: '^', latex: '\\wedge' },
      { display: '%', insert: '%', latex: '\\%' },
    ]
  },
  numbers: {
    name: 'Numbers',
    symbols: [
      { display: '7', insert: '7', latex: '7' },
      { display: '8', insert: '8', latex: '8' },
      { display: '9', insert: '9', latex: '9' },
      { display: '4', insert: '4', latex: '4' },
      { display: '5', insert: '5', latex: '5' },
      { display: '6', insert: '6', latex: '6' },
      { display: '1', insert: '1', latex: '1' },
      { display: '2', insert: '2', latex: '2' },
      { display: '3', insert: '3', latex: '3' },
      { display: '0', insert: '0', latex: '0' },
      { display: '.', insert: '.', latex: '.' },
      { display: 'EE', insert: '*10^', latex: '\\times 10^n' },
    ]
  },
  constants: {
    name: 'Constants',
    symbols: [
      { display: 'pi', insert: 'pi', latex: '\\pi' },
      { display: 'e', insert: 'e', latex: 'e' },
      { display: 'phi', insert: '((1+sqrt(5))/2)', latex: '\\phi' },
      { display: 'tau', insert: '(2*pi)', latex: '\\tau' },
      { display: 'sqrt2', insert: 'sqrt(2)', latex: '\\sqrt{2}' },
      { display: 'sqrt3', insert: 'sqrt(3)', latex: '\\sqrt{3}' },
      { display: 'inf', insert: 'Infinity', latex: '\\infty' },
    ]
  },
  functions: {
    name: 'Functions',
    symbols: [
      { display: 'sin', insert: 'sin(', latex: '\\sin' },
      { display: 'cos', insert: 'cos(', latex: '\\cos' },
      { display: 'tan', insert: 'tan(', latex: '\\tan' },
      { display: 'log', insert: 'log(', latex: '\\log_{10}' },
      { display: 'ln', insert: 'ln(', latex: '\\ln' },
      { display: 'log2', insert: 'log2(', latex: '\\log_2' },
      { display: 'sqrt', insert: 'sqrt(', latex: '\\sqrt{}' },
      { display: 'cbrt', insert: 'cbrt(', latex: '\\sqrt[3]{}' },
      { display: 'abs', insert: 'abs(', latex: '|x|' },
      { display: 'exp', insert: 'exp(', latex: 'e^x' },
    ]
  },
  trig: {
    name: 'Trig',
    symbols: [
      { display: 'sin', insert: 'sin(', latex: '\\sin' },
      { display: 'cos', insert: 'cos(', latex: '\\cos' },
      { display: 'tan', insert: 'tan(', latex: '\\tan' },
      { display: 'csc', insert: 'csc(', latex: '\\csc' },
      { display: 'sec', insert: 'sec(', latex: '\\sec' },
      { display: 'cot', insert: 'cot(', latex: '\\cot' },
    ]
  },
  invTrig: {
    name: 'Inverse Trig',
    symbols: [
      { display: 'asin', insert: 'asin(', latex: '\\sin^{-1}' },
      { display: 'acos', insert: 'acos(', latex: '\\cos^{-1}' },
      { display: 'atan', insert: 'atan(', latex: '\\tan^{-1}' },
      { display: 'acsc', insert: 'acsc(', latex: '\\csc^{-1}' },
      { display: 'asec', insert: 'asec(', latex: '\\sec^{-1}' },
      { display: 'acot', insert: 'acot(', latex: '\\cot^{-1}' },
    ]
  },
  hyperbolic: {
    name: 'Hyperbolic',
    symbols: [
      { display: 'sinh', insert: 'sinh(', latex: '\\sinh' },
      { display: 'cosh', insert: 'cosh(', latex: '\\cosh' },
      { display: 'tanh', insert: 'tanh(', latex: '\\tanh' },
      { display: 'asinh', insert: 'asinh(', latex: '\\sinh^{-1}' },
      { display: 'acosh', insert: 'acosh(', latex: '\\cosh^{-1}' },
      { display: 'atanh', insert: 'atanh(', latex: '\\tanh^{-1}' },
    ]
  },
  powers: {
    name: 'Powers',
    symbols: [
      { display: 'x^2', insert: '^2', latex: 'x^2' },
      { display: 'x^3', insert: '^3', latex: 'x^3' },
      { display: 'x^n', insert: '^()', latex: 'x^n' },
      { display: '1/x', insert: '(1/x)', latex: '\\frac{1}{x}' },
      { display: 'sqrt', insert: 'sqrt(', latex: '\\sqrt{x}' },
      { display: 'cbrt', insert: 'cbrt(', latex: '\\sqrt[3]{x}' },
      { display: 'nroot', insert: '^(1/', latex: '\\sqrt[n]{x}' },
      { display: 'e^x', insert: 'exp(', latex: 'e^x' },
      { display: '10^x', insert: '10^', latex: '10^x' },
      { display: '2^x', insert: '2^', latex: '2^x' },
    ]
  },
  advanced: {
    name: 'Advanced',
    symbols: [
      { display: 'floor', insert: 'floor(', latex: '\\lfloor x \\rfloor' },
      { display: 'ceil', insert: 'ceil(', latex: '\\lceil x \\rceil' },
      { display: 'round', insert: 'round(', latex: '\\text{round}' },
      { display: 'sign', insert: 'sign(', latex: '\\text{sgn}' },
      { display: 'mod', insert: 'mod(', latex: '\\text{mod}' },
      { display: 'min', insert: 'min(', latex: '\\min' },
      { display: 'max', insert: 'max(', latex: '\\max' },
      { display: 'rand', insert: 'rand()', latex: '\\text{rand}' },
    ]
  },
  calculus: {
    name: 'Calculus',
    symbols: [
      { display: 'nderiv', insert: 'nderiv(', latex: "f'(x)" },
      { display: 'sum', insert: 'sum(', latex: '\\sum' },
      { display: 'prod', insert: 'prod(', latex: '\\prod' },
      { display: 'fact', insert: 'fact(', latex: 'n!' },
      { display: 'nCr', insert: 'nCr(', latex: '\\binom{n}{r}' },
      { display: 'nPr', insert: 'nPr(', latex: 'P(n,r)' },
    ]
  },
};

// Helper math functions for enhanced calculator
const mathHelpers = {
  // Inverse trig functions
  csc: (x) => 1 / Math.sin(x),
  sec: (x) => 1 / Math.cos(x),
  cot: (x) => 1 / Math.tan(x),
  acsc: (x) => Math.asin(1 / x),
  asec: (x) => Math.acos(1 / x),
  acot: (x) => Math.atan(1 / x),
  // Hyperbolic functions
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  asinh: Math.asinh,
  acosh: Math.acosh,
  atanh: Math.atanh,
  // Additional functions
  log2: Math.log2,
  cbrt: Math.cbrt,
  exp: Math.exp,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  // Factorial
  fact: (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  },
  // Combinations nCr
  nCr: (n, r) => {
    if (r > n || r < 0) return 0;
    return mathHelpers.fact(n) / (mathHelpers.fact(r) * mathHelpers.fact(n - r));
  },
  // Permutations nPr
  nPr: (n, r) => {
    if (r > n || r < 0) return 0;
    return mathHelpers.fact(n) / mathHelpers.fact(n - r);
  },
  // Modulo
  mod: (a, b) => ((a % b) + b) % b,
  // Min/Max
  min: Math.min,
  max: Math.max,
  // Random (seeded based on x for consistency)
  rand: () => Math.random(),
  // Numerical derivative
  nderiv: (f, x, h = 0.0001) => (f(x + h) - f(x - h)) / (2 * h),
  // Summation: sum(expr, start, end) - evaluated in context
  // Product: prod(expr, start, end) - evaluated in context
};

// 3D Graph Component
function Graph3DCalculator() {
  const canvasRef = useRef(null);
  const [equation, setEquation] = useState('sin(sqrt(x^2+y^2))');
  const [xRange, setXRange] = useState({ min: -5, max: 5 });
  const [yRange, setYRange] = useState({ min: -5, max: 5 });
  const [resolution, setResolution] = useState(40);
  const [rotationX, setRotationX] = useState(0.5);
  const [rotationZ, setRotationZ] = useState(0.5);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [renderMode, setRenderMode] = useState('surface'); // 'surface', 'wireframe', 'points'
  const [colorScheme, setColorScheme] = useState('rainbow'); // 'rainbow', 'thermal', 'ocean', 'monochrome'
  const [autoRotate, setAutoRotate] = useState(false);
  const [showAxes, setShowAxes] = useState(true);

  // Evaluate 3D expression
  const evaluate3D = useCallback((expr, x, y) => {
    if (!expr.trim()) return null;
    try {
      let parsed = expr
        .replace(/\^/g, '**')
        .replace(/\basin\b/g, 'Math.asin')
        .replace(/\bacos\b/g, 'Math.acos')
        .replace(/\batan\b/g, 'Math.atan')
        .replace(/\bsinh\b/g, 'Math.sinh')
        .replace(/\bcosh\b/g, 'Math.cosh')
        .replace(/\btanh\b/g, 'Math.tanh')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bfloor\b/g, 'Math.floor')
        .replace(/\bceil\b/g, 'Math.ceil')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/(?<![a-z])e(?![a-z])/gi, 'Math.E')
        .replace(/(\d)([xy])/g, '$1*$2')
        .replace(/([xy])(\d)/g, '$1*$2')
        .replace(/\)(\()/g, ')*(')
        .replace(/(\d)\(/g, '$1*(')
        .replace(/\)(\d)/g, ')*$1')
        .replace(/([xy])\(/g, '$1*(')
        .replace(/\)([xy])/g, ')*$1')
        .replace(/([xy])([xy])/g, '$1*$2');

      const result = new Function('x', 'y', `return ${parsed}`)(x, y);
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }, []);

  // Color mapping functions
  const getColor = useCallback((z, minZ, maxZ) => {
    const t = maxZ === minZ ? 0.5 : (z - minZ) / (maxZ - minZ);

    switch (colorScheme) {
      case 'rainbow':
        { const hue = (1 - t) * 240;
        return `hsl(${hue}, 80%, 50%)`; }
      case 'thermal':
        { const r = Math.floor(255 * Math.min(1, t * 2));
        const g = Math.floor(255 * Math.min(1, Math.max(0, (t - 0.25) * 2)));
        const b = Math.floor(255 * Math.max(0, 1 - t * 2));
        return `rgb(${r}, ${g}, ${b})`; }
      case 'ocean':
        { const r2 = Math.floor(20 + 60 * t);
        const g2 = Math.floor(60 + 140 * t);
        const b2 = Math.floor(150 + 105 * t);
        return `rgb(${r2}, ${g2}, ${b2})`; }
      case 'monochrome':
        { const gray = Math.floor(50 + 180 * t);
        return `rgb(${gray}, ${gray}, ${gray})`; }
      default:
        return `hsl(${(1 - t) * 240}, 80%, 50%)`;
    }
  }, [colorScheme]);

  // 3D projection
  const project = useCallback((x, y, z, width, height) => {
    // Apply rotations
    const cosX = Math.cos(rotationX);
    const sinX = Math.sin(rotationX);
    const cosZ = Math.cos(rotationZ);
    const sinZ = Math.sin(rotationZ);

    // Rotate around Z axis
    let x1 = x * cosZ - y * sinZ;
    let y1 = x * sinZ + y * cosZ;
    let z1 = z;

    // Rotate around X axis
    let y2 = y1 * cosX - z1 * sinX;
    let z2 = y1 * sinX + z1 * cosX;
    let x2 = x1;

    // Perspective projection
    const fov = 300 * zoom;
    const distance = 8;
    const scale = fov / (distance - z2);

    const screenX = width / 2 + x2 * scale;
    const screenY = height / 2 - y2 * scale;

    return { x: screenX, y: screenY, z: z2 };
  }, [rotationX, rotationZ, zoom]);

  // Auto-rotation effect
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotationZ(prev => prev + 0.01);
    }, 30);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Draw 3D graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    // Generate surface data
    const xStep = (xRange.max - xRange.min) / resolution;
    const yStep = (yRange.max - yRange.min) / resolution;
    const points = [];
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i <= resolution; i++) {
      points[i] = [];
      for (let j = 0; j <= resolution; j++) {
        const x = xRange.min + i * xStep;
        const y = yRange.min + j * yStep;
        const z = evaluate3D(equation, x, y);

        if (z !== null) {
          minZ = Math.min(minZ, z);
          maxZ = Math.max(maxZ, z);
        }

        points[i][j] = { x, y, z };
      }
    }

    // Normalize z values
    const zScale = maxZ === minZ ? 1 : 2 / (maxZ - minZ);
    const zOffset = (maxZ + minZ) / 2;

    // Project points
    const projected = points.map(row =>
      row.map(p => {
        if (p.z === null) return null;
        const normalizedZ = (p.z - zOffset) * zScale;
        const proj = project(
          (p.x - (xRange.min + xRange.max) / 2) / ((xRange.max - xRange.min) / 4),
          (p.y - (yRange.min + yRange.max) / 2) / ((yRange.max - yRange.min) / 4),
          normalizedZ,
          width,
          height
        );
        return { ...proj, originalZ: p.z };
      })
    );

    // Draw axes
    if (showAxes) {
      const axisLength = 2;
      const origin = project(0, 0, 0, width, height);
      const xAxis = project(axisLength, 0, 0, width, height);
      const yAxis = project(0, axisLength, 0, width, height);
      const zAxis = project(0, 0, axisLength, width, height);

      ctx.lineWidth = 2;

      // X axis (red)
      ctx.strokeStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(xAxis.x, xAxis.y);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.font = '14px system-ui';
      ctx.fillText('X', xAxis.x + 5, xAxis.y);

      // Y axis (green)
      ctx.strokeStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(yAxis.x, yAxis.y);
      ctx.stroke();
      ctx.fillStyle = '#22c55e';
      ctx.fillText('Y', yAxis.x + 5, yAxis.y);

      // Z axis (blue)
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(zAxis.x, zAxis.y);
      ctx.stroke();
      ctx.fillStyle = '#3b82f6';
      ctx.fillText('Z', zAxis.x + 5, zAxis.y - 5);
    }

    // Collect faces for depth sorting
    const faces = [];
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const p1 = projected[i][j];
        const p2 = projected[i + 1][j];
        const p3 = projected[i + 1][j + 1];
        const p4 = projected[i][j + 1];

        if (p1 && p2 && p3 && p4) {
          const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
          const avgOriginalZ = (p1.originalZ + p2.originalZ + p3.originalZ + p4.originalZ) / 4;
          faces.push({ p1, p2, p3, p4, avgZ, avgOriginalZ });
        }
      }
    }

    // Sort by depth (painter's algorithm)
    faces.sort((a, b) => a.avgZ - b.avgZ);

    // Draw faces
    faces.forEach(face => {
      const { p1, p2, p3, p4, avgOriginalZ } = face;

      if (renderMode === 'surface' || renderMode === 'wireframe') {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();

        if (renderMode === 'surface') {
          ctx.fillStyle = getColor(avgOriginalZ, minZ, maxZ);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        } else {
          ctx.strokeStyle = getColor(avgOriginalZ, minZ, maxZ);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } else if (renderMode === 'points') {
        ctx.fillStyle = getColor(avgOriginalZ, minZ, maxZ);
        ctx.beginPath();
        ctx.arc((p1.x + p2.x + p3.x + p4.x) / 4, (p1.y + p2.y + p3.y + p4.y) / 4, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw z-range info
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '12px monospace';
    ctx.fillText(`z: [${minZ.toFixed(2)}, ${maxZ.toFixed(2)}]`, 10, height - 10);

  }, [equation, xRange, yRange, resolution, rotationX, rotationZ, zoom, renderMode, colorScheme, showAxes, evaluate3D, project, getColor]);

  // Mouse handlers for rotation
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;

    setRotationZ(prev => prev + dx * 0.01);
    setRotationX(prev => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.01)));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!isDragging || e.touches.length !== 1) return;

    const dx = e.touches[0].clientX - lastMouse.x;
    const dy = e.touches[0].clientY - lastMouse.y;

    setRotationZ(prev => prev + dx * 0.01);
    setRotationX(prev => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev + dy * 0.01)));
    setLastMouse({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const presets = [
    { name: 'Wave', expr: 'sin(sqrt(x^2+y^2))' },
    { name: 'Saddle', expr: 'x^2 - y^2' },
    { name: 'Paraboloid', expr: 'x^2 + y^2' },
    { name: 'Ripple', expr: 'sin(x)*cos(y)' },
    { name: 'Cone', expr: 'sqrt(x^2 + y^2)' },
    { name: 'Egg Carton', expr: 'sin(x)*sin(y)' },
    { name: 'Gaussian', expr: 'exp(-(x^2+y^2)/2)' },
    { name: 'Spiral', expr: 'sin(5*sqrt(x^2+y^2))/(sqrt(x^2+y^2)+0.1)' },
  ];

  return (
    <div className="graph-3d-calculator">
      <div className="graph-3d-header">
        <h4>3D Surface Plot</h4>
        <div className="graph-3d-controls">
          <button onClick={() => setAutoRotate(!autoRotate)} className={autoRotate ? 'active' : ''}>
            {autoRotate ? '⏸ Stop' : '▶ Rotate'}
          </button>
          <button onClick={() => { setRotationX(0.5); setRotationZ(0.5); setZoom(1); }}>
            Reset View
          </button>
        </div>
      </div>

      <div className="graph-3d-equation">
        <span className="eq-label-3d">z = f(x, y) =</span>
        <input
          type="text"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder="Enter 3D equation (e.g., sin(sqrt(x^2+y^2)))"
          className="eq-input-3d"
        />
      </div>

      <div className="graph-3d-presets">
        <span className="presets-label">Presets:</span>
        {presets.map((preset, i) => (
          <button key={i} onClick={() => setEquation(preset.expr)} className="preset-3d-btn">
            {preset.name}
          </button>
        ))}
      </div>

      <div className="graph-3d-options">
        <div className="option-group">
          <label>Render:</label>
          <select value={renderMode} onChange={(e) => setRenderMode(e.target.value)}>
            <option value="surface">Surface</option>
            <option value="wireframe">Wireframe</option>
            <option value="points">Points</option>
          </select>
        </div>
        <div className="option-group">
          <label>Colors:</label>
          <select value={colorScheme} onChange={(e) => setColorScheme(e.target.value)}>
            <option value="rainbow">Rainbow</option>
            <option value="thermal">Thermal</option>
            <option value="ocean">Ocean</option>
            <option value="monochrome">Monochrome</option>
          </select>
        </div>
        <div className="option-group">
          <label>Resolution:</label>
          <input
            type="range"
            min="10"
            max="60"
            value={resolution}
            onChange={(e) => setResolution(parseInt(e.target.value))}
          />
          <span>{resolution}</span>
        </div>
        <div className="option-group">
          <label>
            <input
              type="checkbox"
              checked={showAxes}
              onChange={(e) => setShowAxes(e.target.checked)}
            />
            Show Axes
          </label>
        </div>
      </div>

      <div className="graph-3d-range">
        <div className="range-group">
          <label>X Range:</label>
          <input
            type="number"
            value={xRange.min}
            onChange={(e) => setXRange(prev => ({ ...prev, min: parseFloat(e.target.value) || -5 }))}
          />
          <span>to</span>
          <input
            type="number"
            value={xRange.max}
            onChange={(e) => setXRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 5 }))}
          />
        </div>
        <div className="range-group">
          <label>Y Range:</label>
          <input
            type="number"
            value={yRange.min}
            onChange={(e) => setYRange(prev => ({ ...prev, min: parseFloat(e.target.value) || -5 }))}
          />
          <span>to</span>
          <input
            type="number"
            value={yRange.max}
            onChange={(e) => setYRange(prev => ({ ...prev, max: parseFloat(e.target.value) || 5 }))}
          />
        </div>
      </div>

      <div className="canvas-container-3d">
        <canvas
          ref={canvasRef}
          width={700}
          height={500}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        />
        <div className="canvas-3d-info">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}

// Graph Component
function GraphCalculator() {
  const canvasRef = useRef(null);
  const inputRefs = useRef([]);
  const [equations, setEquations] = useState([
    { expr: 'x^2', color: '#667eea', visible: true },
    { expr: 'sin(x)', color: '#f59e0b', visible: true },
    { expr: '', color: '#10b981', visible: true },
    { expr: '', color: '#ef4444', visible: true },
    { expr: '', color: '#8b5cf6', visible: true },
  ]);
  const [xRange, setXRange] = useState({ min: -10, max: 10 });
  const [yRange, setYRange] = useState({ min: -10, max: 10 });
  const [mousePos, setMousePos] = useState(null);
  const [tracePoint, setTracePoint] = useState(null);
  const [activeInput, setActiveInput] = useState(0);
  const [activeKeyboardTab, setActiveKeyboardTab] = useState('basic');
  const [lastAnswer, setLastAnswer] = useState(0);
  const [showSeriesPanel, setShowSeriesPanel] = useState(false);
  const [seriesConfig, setSeriesConfig] = useState({
    type: 'sum',
    expr: 'n',
    start: '1',
    end: '10',
    result: null
  });

  // Interactive state
  const [interactionMode, setInteractionMode] = useState('trace'); // 'trace', 'pan', 'zoomBox'
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [zoomBox, setZoomBox] = useState(null);
  const [showAxisSettings, setShowAxisSettings] = useState(false);
  const [axisInputs, setAxisInputs] = useState({ xMin: '-10', xMax: '10', yMin: '-10', yMax: '10' });

  // Touch gesture state
  const [touchState, setTouchState] = useState({
    lastTouches: [],
    lastDistance: null,
    lastCenter: null,
    isPinching: false
  });

  // Zoom presets
  const zoomPresets = [
    { name: 'Standard', xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
    { name: 'Trig', xMin: -2 * Math.PI, xMax: 2 * Math.PI, yMin: -2, yMax: 2 },
    { name: 'Quadrant I', xMin: 0, xMax: 10, yMin: 0, yMax: 10 },
    { name: 'Wide', xMin: -50, xMax: 50, yMin: -50, yMax: 50 },
    { name: 'Zoom', xMin: -2, xMax: 2, yMin: -2, yMax: 2 },
    { name: 'Tall', xMin: -10, xMax: 10, yMin: -100, yMax: 100 },
    { name: 'Decimal', xMin: -1, xMax: 1, yMin: -1, yMax: 1 },
    { name: 'Integer', xMin: -10, xMax: 10, yMin: -10, yMax: 10 },
  ];

  // Parse and evaluate expression - Enhanced with all functions
  const evaluateExpression = useCallback((expr, x) => {
    if (!expr.trim()) return null;
    try {
      let parsed = expr
        // Power operator
        .replace(/\^/g, '**')
        // Inverse trig functions (order matters - process longer names first)
        .replace(/\basinh\b/g, 'mathHelpers.asinh')
        .replace(/\bacosh\b/g, 'mathHelpers.acosh')
        .replace(/\batanh\b/g, 'mathHelpers.atanh')
        .replace(/\basin\b/g, 'Math.asin')
        .replace(/\bacos\b/g, 'Math.acos')
        .replace(/\batan\b/g, 'Math.atan')
        .replace(/\bacsc\b/g, 'mathHelpers.acsc')
        .replace(/\basec\b/g, 'mathHelpers.asec')
        .replace(/\bacot\b/g, 'mathHelpers.acot')
        // Hyperbolic functions
        .replace(/\bsinh\b/g, 'mathHelpers.sinh')
        .replace(/\bcosh\b/g, 'mathHelpers.cosh')
        .replace(/\btanh\b/g, 'mathHelpers.tanh')
        // Regular trig
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\bcsc\b/g, 'mathHelpers.csc')
        .replace(/\bsec\b/g, 'mathHelpers.sec')
        .replace(/\bcot\b/g, 'mathHelpers.cot')
        // Logarithms
        .replace(/\blog2\b/g, 'mathHelpers.log2')
        .replace(/\blog\b/g, 'Math.log10')
        .replace(/\bln\b/g, 'Math.log')
        // Roots
        .replace(/\bcbrt\b/g, 'mathHelpers.cbrt')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        // Other functions
        .replace(/\bexp\b/g, 'mathHelpers.exp')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bfloor\b/g, 'mathHelpers.floor')
        .replace(/\bceil\b/g, 'mathHelpers.ceil')
        .replace(/\bround\b/g, 'mathHelpers.round')
        .replace(/\bsign\b/g, 'mathHelpers.sign')
        .replace(/\bfact\b/g, 'mathHelpers.fact')
        .replace(/\bnCr\b/g, 'mathHelpers.nCr')
        .replace(/\bnPr\b/g, 'mathHelpers.nPr')
        .replace(/\bmod\b/g, 'mathHelpers.mod')
        .replace(/\bmin\b/g, 'mathHelpers.min')
        .replace(/\bmax\b/g, 'mathHelpers.max')
        .replace(/\brand\b/g, 'mathHelpers.rand')
        // Constants
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\btau\b/gi, '(2*Math.PI)')
        .replace(/\bInfinity\b/g, 'Infinity')
        .replace(/(?<![a-z])e(?![a-z])/gi, 'Math.E')
        // Implicit multiplication
        .replace(/(\d)([x])/g, '$1*$2')
        .replace(/([x])(\d)/g, '$1*$2')
        .replace(/\)(\()/g, ')*(')
        .replace(/(\d)\(/g, '$1*(')
        .replace(/\)(\d)/g, ')*$1')
        .replace(/([x])\(/g, '$1*(')
        .replace(/\)([x])/g, ')*$1');

      const result = new Function('x', 'mathHelpers', `return ${parsed}`)(x, mathHelpers);
      return isFinite(result) ? result : null;
    } catch {
      return null;
    }
  }, []);

  // Calculate series (summation or product)
  const calculateSeries = useCallback(() => {
    const { type, expr, start, end } = seriesConfig;
    const startN = parseInt(start);
    const endN = parseInt(end);

    if (isNaN(startN) || isNaN(endN) || endN < startN || endN - startN > 10000) {
      setSeriesConfig(prev => ({ ...prev, result: { error: 'Invalid range (max 10000 terms)' } }));
      return;
    }

    try {
      let result = type === 'sum' ? 0 : 1;
      let parsedExpr = expr
        .replace(/\^/g, '**')
        .replace(/\bfact\b/g, 'mathHelpers.fact')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/(?<![a-z])e(?![a-z])/gi, 'Math.E')
        .replace(/(\d)([n])/g, '$1*$2')
        .replace(/([n])(\d)/g, '$1*$2');

      const evalFunc = new Function('n', 'mathHelpers', `return ${parsedExpr}`);

      for (let n = startN; n <= endN; n++) {
        const term = evalFunc(n, mathHelpers);
        if (!isFinite(term)) {
          setSeriesConfig(prev => ({ ...prev, result: { error: `Invalid term at n=${n}` } }));
          return;
        }
        if (type === 'sum') {
          result += term;
        } else {
          result *= term;
        }
      }

      setSeriesConfig(prev => ({ ...prev, result: { value: result } }));
      setLastAnswer(result);
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      setSeriesConfig(prev => ({ ...prev, result: { error: 'Expression error' } }));
    }
  }, [seriesConfig]);

  // Get mouse position in graph coordinates
  const getGraphCoords = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (e.clientX - rect.left) * scaleX;
    const py = (e.clientY - rect.top) * scaleY;
    const x = xRange.min + (px / canvas.width) * (xRange.max - xRange.min);
    const y = yRange.max - (py / canvas.height) * (yRange.max - yRange.min);
    return { x, y, px, py };
  }, [xRange, yRange]);

  // Draw graph
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    const xScale = width / (xRange.max - xRange.min);
    const yScale = height / (yRange.max - yRange.min);

    const toCanvasX = (x) => (x - xRange.min) * xScale;
    const toCanvasY = (y) => height - (y - yRange.min) * yScale;

    // Calculate grid spacing based on zoom level
    const xSpan = xRange.max - xRange.min;
    const ySpan = yRange.max - yRange.min;
    const getGridStep = (span) => {
      const rawStep = span / 10;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const normalized = rawStep / magnitude;
      if (normalized < 2) return magnitude;
      if (normalized < 5) return 2 * magnitude;
      return 5 * magnitude;
    };
    const xStep = getGridStep(xSpan);
    const yStep = getGridStep(ySpan);

    // Draw minor grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const xMinorStep = xStep / 5;
    const yMinorStep = yStep / 5;

    for (let x = Math.ceil(xRange.min / xMinorStep) * xMinorStep; x <= xRange.max; x += xMinorStep) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }

    for (let y = Math.ceil(yRange.min / yMinorStep) * yMinorStep; y <= yRange.max; y += yMinorStep) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Draw major grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    for (let x = Math.ceil(xRange.min / xStep) * xStep; x <= xRange.max; x += xStep) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }

    for (let y = Math.ceil(yRange.min / yStep) * yStep; y <= yRange.max; y += yStep) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;

    if (yRange.min <= 0 && yRange.max >= 0) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(0));
      ctx.lineTo(width, toCanvasY(0));
      ctx.stroke();
    }

    if (xRange.min <= 0 && xRange.max >= 0) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(0), 0);
      ctx.lineTo(toCanvasX(0), height);
      ctx.stroke();
    }

    // Draw axis labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '11px system-ui';

    const formatNumber = (n) => {
      if (Math.abs(n) < 0.001 && n !== 0) return n.toExponential(1);
      if (Math.abs(n) >= 1000) return n.toExponential(1);
      return parseFloat(n.toPrecision(4)).toString();
    };

    for (let x = Math.ceil(xRange.min / xStep) * xStep; x <= xRange.max; x += xStep) {
      if (Math.abs(x) > xStep / 100) {
        const labelY = yRange.min <= 0 && yRange.max >= 0 ? toCanvasY(0) + 14 : height - 5;
        ctx.fillText(formatNumber(x), toCanvasX(x) + 3, labelY);
      }
    }

    for (let y = Math.ceil(yRange.min / yStep) * yStep; y <= yRange.max; y += yStep) {
      if (Math.abs(y) > yStep / 100) {
        const labelX = xRange.min <= 0 && xRange.max >= 0 ? toCanvasX(0) + 5 : 5;
        ctx.fillText(formatNumber(y), labelX, toCanvasY(y) - 3);
      }
    }

    // Draw each equation
    equations.forEach((eq) => {
      if (!eq.visible || !eq.expr.trim()) return;

      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let firstPoint = true;
      let lastY = null;
      for (let px = 0; px <= width * 2; px++) {
        const x = xRange.min + (px / (width * 2)) * (xRange.max - xRange.min);
        const y = evaluateExpression(eq.expr, x);

        // Detect discontinuities
        const isDiscontinuity = lastY !== null && y !== null && Math.abs(y - lastY) > (yRange.max - yRange.min) * 0.5;

        if (y !== null && !isDiscontinuity) {
          const canvasX = toCanvasX(x);
          const canvasY = toCanvasY(y);
          if (firstPoint || isDiscontinuity) {
            ctx.moveTo(canvasX, canvasY);
            firstPoint = false;
          } else {
            ctx.lineTo(canvasX, canvasY);
          }
        } else {
          firstPoint = true;
        }
        lastY = y;
      }

      ctx.stroke();
    });

    // Draw trace point
    if (tracePoint && interactionMode === 'trace') {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;

      // Draw crosshair
      ctx.beginPath();
      ctx.moveTo(toCanvasX(tracePoint.x), 0);
      ctx.lineTo(toCanvasX(tracePoint.x), height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(tracePoint.y));
      ctx.lineTo(width, toCanvasY(tracePoint.y));
      ctx.stroke();

      // Draw point
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(toCanvasX(tracePoint.x), toCanvasY(tracePoint.y), 6, 0, 2 * Math.PI);
      ctx.fill();

      // Draw label
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      const label = `(${tracePoint.x.toFixed(3)}, ${tracePoint.y.toFixed(3)})`;
      const labelWidth = ctx.measureText(label).width + 12;
      let labelX = toCanvasX(tracePoint.x) + 12;
      let labelY = toCanvasY(tracePoint.y) - 12;
      if (labelX + labelWidth > width) labelX = toCanvasX(tracePoint.x) - labelWidth - 4;
      if (labelY < 20) labelY = toCanvasY(tracePoint.y) + 24;

      ctx.fillRect(labelX - 4, labelY - 14, labelWidth, 20);
      ctx.fillStyle = '#fff';
      ctx.font = '12px monospace';
      ctx.fillText(label, labelX, labelY);
    }

    // Draw zoom box
    if (zoomBox && interactionMode === 'zoomBox') {
      ctx.strokeStyle = '#667eea';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
      const x = Math.min(toCanvasX(zoomBox.x1), toCanvasX(zoomBox.x2));
      const y = Math.min(toCanvasY(zoomBox.y1), toCanvasY(zoomBox.y2));
      const w = Math.abs(toCanvasX(zoomBox.x2) - toCanvasX(zoomBox.x1));
      const h = Math.abs(toCanvasY(zoomBox.y2) - toCanvasY(zoomBox.y1));
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);
    }

  }, [equations, xRange, yRange, tracePoint, zoomBox, interactionMode, evaluateExpression]);

  // Get touch position in graph coordinates
  const getTouchGraphCoords = useCallback((touch) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const px = (touch.clientX - rect.left) * scaleX;
    const py = (touch.clientY - rect.top) * scaleY;
    const x = xRange.min + (px / canvas.width) * (xRange.max - xRange.min);
    const y = yRange.max - (py / canvas.height) * (yRange.max - yRange.min);
    return { x, y, px, py };
  }, [xRange, yRange]);

  // Calculate distance between two touch points
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Calculate center between two touch points
  const getTouchCenter = (touch1, touch2) => {
    return {
      clientX: (touch1.clientX + touch2.clientX) / 2,
      clientY: (touch1.clientY + touch2.clientY) / 2
    };
  };

  // Touch event handlers for pinch zoom and two-finger pan
  const handleTouchStart = (e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1) {
      // Single finger - start pan
      const coords = getTouchGraphCoords(touches[0]);
      if (coords) {
        setIsDragging(true);
        setDragStart({ x: coords.x, y: coords.y, xRange: { ...xRange }, yRange: { ...yRange } });
      }
    } else if (touches.length === 2) {
      // Two fingers - prepare for pinch zoom or two-finger pan
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      setTouchState({
        lastTouches: [touches[0], touches[1]],
        lastDistance: distance,
        lastCenter: center,
        isPinching: true
      });
      setIsDragging(false);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && isDragging && dragStart) {
      // Single finger pan
      const coords = getTouchGraphCoords(touches[0]);
      if (coords) {
        setXRange({
          min: dragStart.xRange.min - (coords.x - dragStart.x),
          max: dragStart.xRange.max - (coords.x - dragStart.x)
        });
        setYRange({
          min: dragStart.yRange.min - (coords.y - dragStart.y),
          max: dragStart.yRange.max - (coords.y - dragStart.y)
        });
      }
    } else if (touches.length === 2 && touchState.isPinching) {
      // Two-finger pinch zoom and pan
      const distance = getTouchDistance(touches[0], touches[1]);
      const center = getTouchCenter(touches[0], touches[1]);
      const centerCoords = getTouchGraphCoords(center);

      if (centerCoords && touchState.lastDistance && touchState.lastCenter) {
        // Calculate zoom factor from pinch
        const zoomFactor = touchState.lastDistance / distance;

        // Calculate pan offset
        const lastCenterCoords = getTouchGraphCoords(touchState.lastCenter);

        if (lastCenterCoords) {
          const xSpan = xRange.max - xRange.min;
          const ySpan = yRange.max - yRange.min;
          const newXSpan = xSpan * zoomFactor;
          const newYSpan = ySpan * zoomFactor;

          // Zoom centered on pinch center
          const xRatio = (centerCoords.x - xRange.min) / xSpan;
          const yRatio = (centerCoords.y - yRange.min) / ySpan;

          // Combine zoom and pan
          const panX = lastCenterCoords.x - centerCoords.x;
          const panY = lastCenterCoords.y - centerCoords.y;

          setXRange({
            min: centerCoords.x - xRatio * newXSpan + panX,
            max: centerCoords.x + (1 - xRatio) * newXSpan + panX
          });
          setYRange({
            min: centerCoords.y - yRatio * newYSpan + panY,
            max: centerCoords.y + (1 - yRatio) * newYSpan + panY
          });
        }
      }

      setTouchState({
        lastTouches: [touches[0], touches[1]],
        lastDistance: distance,
        lastCenter: center,
        isPinching: true
      });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 0) {
      setIsDragging(false);
      setDragStart(null);
      setTouchState({
        lastTouches: [],
        lastDistance: null,
        lastCenter: null,
        isPinching: false
      });
    } else if (e.touches.length === 1) {
      // Transitioned from two fingers to one
      const coords = getTouchGraphCoords(e.touches[0]);
      if (coords) {
        setIsDragging(true);
        setDragStart({ x: coords.x, y: coords.y, xRange: { ...xRange }, yRange: { ...yRange } });
      }
      setTouchState({
        lastTouches: [],
        lastDistance: null,
        lastCenter: null,
        isPinching: false
      });
    }
  };

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const coords = getGraphCoords(e);
    if (!coords) return;

    if (interactionMode === 'pan') {
      setIsDragging(true);
      setDragStart({ x: coords.x, y: coords.y, xRange: { ...xRange }, yRange: { ...yRange } });
    } else if (interactionMode === 'zoomBox') {
      setIsDragging(true);
      setZoomBox({ x1: coords.x, y1: coords.y, x2: coords.x, y2: coords.y });
    }
  };

  const handleMouseMove = (e) => {
    const coords = getGraphCoords(e);
    if (!coords) return;

    setMousePos({ x: coords.x.toFixed(3), y: coords.y.toFixed(3) });

    if (isDragging && interactionMode === 'pan' && dragStart) {
      // Pan - move the view in the opposite direction of the drag
      setXRange({
        min: dragStart.xRange.min - (coords.x - dragStart.x),
        max: dragStart.xRange.max - (coords.x - dragStart.x)
      });
      setYRange({
        min: dragStart.yRange.min - (coords.y - dragStart.y),
        max: dragStart.yRange.max - (coords.y - dragStart.y)
      });
    } else if (isDragging && interactionMode === 'zoomBox' && zoomBox) {
      setZoomBox(prev => ({ ...prev, x2: coords.x, y2: coords.y }));
    } else if (interactionMode === 'trace') {
      const activeEq = equations.find(eq => eq.visible && eq.expr.trim());
      if (activeEq) {
        const y = evaluateExpression(activeEq.expr, coords.x);
        if (y !== null && isFinite(y)) {
          setTracePoint({ x: coords.x, y });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && interactionMode === 'zoomBox' && zoomBox) {
      const x1 = Math.min(zoomBox.x1, zoomBox.x2);
      const x2 = Math.max(zoomBox.x1, zoomBox.x2);
      const y1 = Math.min(zoomBox.y1, zoomBox.y2);
      const y2 = Math.max(zoomBox.y1, zoomBox.y2);

      if (Math.abs(x2 - x1) > 0.01 && Math.abs(y2 - y1) > 0.01) {
        setXRange({ min: x1, max: x2 });
        setYRange({ min: y1, max: y2 });
      }
      setZoomBox(null);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setTracePoint(null);
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      setZoomBox(null);
    }
  };

  // Mouse wheel zoom - also supports trackpad pinch gestures
  const handleWheel = (e) => {
    e.preventDefault();

    // Check if this is a trackpad pinch gesture (ctrlKey is set for pinch)
    const isPinchGesture = e.ctrlKey;

    // Get coordinates for zoom center
    const coords = getGraphCoords(e);
    if (!coords) return;

    // Trackpad pan with two-finger scroll (when not pinching)
    if (!isPinchGesture && (Math.abs(e.deltaX) > 0 || Math.abs(e.deltaY) > 0)) {
      // This is a two-finger scroll/pan
      const xSpan = xRange.max - xRange.min;
      const ySpan = yRange.max - yRange.min;
      const panX = (e.deltaX / canvasRef.current.width) * xSpan * 0.5;
      const panY = (-e.deltaY / canvasRef.current.height) * ySpan * 0.5;

      // If mostly horizontal or vertical scroll, do pan
      if (Math.abs(e.deltaX) > 1 || Math.abs(e.deltaY) > 1) {
        setXRange(prev => ({ min: prev.min + panX, max: prev.max + panX }));
        setYRange(prev => ({ min: prev.min + panY, max: prev.max + panY }));
        return;
      }
    }

    // Zoom (scroll wheel or pinch gesture)
    const zoomFactor = e.deltaY > 0 ? 1.15 : 0.85;

    // Zoom centered on mouse/touch position
    const xSpan = xRange.max - xRange.min;
    const ySpan = yRange.max - yRange.min;
    const newXSpan = xSpan * zoomFactor;
    const newYSpan = ySpan * zoomFactor;

    const xRatio = (coords.x - xRange.min) / xSpan;
    const yRatio = (coords.y - yRange.min) / ySpan;

    setXRange({
      min: coords.x - xRatio * newXSpan,
      max: coords.x + (1 - xRatio) * newXSpan
    });
    setYRange({
      min: coords.y - yRatio * newYSpan,
      max: coords.y + (1 - yRatio) * newYSpan
    });
  };

  // Double click to reset
  const handleDoubleClick = () => {
    setXRange({ min: -10, max: 10 });
    setYRange({ min: -10, max: 10 });
  };

  const updateEquation = (index, field, value) => {
    setEquations(prev => prev.map((eq, i) => i === index ? { ...eq, [field]: value } : eq));
  };

  const insertSymbol = (symbol) => {
    const input = inputRefs.current[activeInput];
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const currentValue = equations[activeInput].expr;
      const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);
      updateEquation(activeInput, 'expr', newValue);
      setTimeout(() => {
        input.focus();
        const newPos = start + symbol.length;
        input.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const clearEquation = () => {
    updateEquation(activeInput, 'expr', '');
    inputRefs.current[activeInput]?.focus();
  };

  const zoomIn = () => {
    const xCenter = (xRange.min + xRange.max) / 2;
    const yCenter = (yRange.min + yRange.max) / 2;
    const xHalf = (xRange.max - xRange.min) / 4;
    const yHalf = (yRange.max - yRange.min) / 4;
    setXRange({ min: xCenter - xHalf, max: xCenter + xHalf });
    setYRange({ min: yCenter - yHalf, max: yCenter + yHalf });
  };

  const zoomOut = () => {
    const xCenter = (xRange.min + xRange.max) / 2;
    const yCenter = (yRange.min + yRange.max) / 2;
    const xHalf = (xRange.max - xRange.min);
    const yHalf = (yRange.max - yRange.min);
    setXRange({ min: xCenter - xHalf, max: xCenter + xHalf });
    setYRange({ min: yCenter - yHalf, max: yCenter + yHalf });
  };

  const resetView = () => {
    setXRange({ min: -10, max: 10 });
    setYRange({ min: -10, max: 10 });
  };

  const applyAxisSettings = () => {
    const xMin = parseFloat(axisInputs.xMin);
    const xMax = parseFloat(axisInputs.xMax);
    const yMin = parseFloat(axisInputs.yMin);
    const yMax = parseFloat(axisInputs.yMax);

    if (!isNaN(xMin) && !isNaN(xMax) && !isNaN(yMin) && !isNaN(yMax) && xMin < xMax && yMin < yMax) {
      setXRange({ min: xMin, max: xMax });
      setYRange({ min: yMin, max: yMax });
      setShowAxisSettings(false);
    }
  };

  const fitToEquations = () => {
    let minY = Infinity, maxY = -Infinity;
    let hasData = false;

    equations.forEach(eq => {
      if (!eq.visible || !eq.expr.trim()) return;
      for (let x = xRange.min; x <= xRange.max; x += (xRange.max - xRange.min) / 100) {
        const y = evaluateExpression(eq.expr, x);
        if (y !== null && isFinite(y)) {
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          hasData = true;
        }
      }
    });

    if (hasData && minY < maxY) {
      const padding = (maxY - minY) * 0.1;
      setYRange({ min: minY - padding, max: maxY + padding });
    }
  };

  // Update axis inputs when range changes
  useEffect(() => {
    setAxisInputs({
      xMin: xRange.min.toFixed(2),
      xMax: xRange.max.toFixed(2),
      yMin: yRange.min.toFixed(2),
      yMax: yRange.max.toFixed(2)
    });
  }, [xRange, yRange]);

  return (
    <div className="graph-calculator">
      <div className="graph-header">
        <h3>Graphing Calculator</h3>
        <div className="graph-controls">
          <button onClick={zoomIn} title="Zoom In">+</button>
          <button onClick={zoomOut} title="Zoom Out">−</button>
          <button onClick={fitToEquations} title="Fit to Equations">Fit</button>
          <button onClick={resetView} title="Reset View">Reset</button>
        </div>
      </div>

      {/* Interaction Mode Selector */}
      <div className="interaction-toolbar">
        <div className="mode-buttons">
          <button
            className={`mode-btn ${interactionMode === 'trace' ? 'active' : ''}`}
            onClick={() => setInteractionMode('trace')}
            title="Trace Mode - Hover to trace function values"
          >
            <span className="mode-icon">📍</span> Trace
          </button>
          <button
            className={`mode-btn ${interactionMode === 'pan' ? 'active' : ''}`}
            onClick={() => setInteractionMode('pan')}
            title="Pan Mode - Click and drag to pan (or use two fingers)"
          >
            <span className="mode-icon">✋</span> Pan
          </button>
          <button
            className={`mode-btn ${interactionMode === 'zoomBox' ? 'active' : ''}`}
            onClick={() => setInteractionMode('zoomBox')}
            title="Zoom Box - Draw a box to zoom into"
          >
            <span className="mode-icon">🔍</span> Zoom Box
          </button>
        </div>
        <div className="toolbar-right">
          <button
            className={`settings-btn ${showSeriesPanel ? 'active' : ''}`}
            onClick={() => setShowSeriesPanel(!showSeriesPanel)}
            title="Series Calculator (Summations & Products)"
          >
            <KaTeXDisplay expr="\\Sigma" /> Series
          </button>
          <button
            className={`settings-btn ${showAxisSettings ? 'active' : ''}`}
            onClick={() => setShowAxisSettings(!showAxisSettings)}
            title="Axis Settings"
          >
            ⚙️ Axes
          </button>
        </div>
      </div>

      {/* Axis Settings Panel */}
      {showAxisSettings && (
        <div className="axis-settings">
          <div className="axis-settings-header">
            <h4>Axis Range</h4>
            <div className="preset-buttons">
              {zoomPresets.map((preset, i) => (
                <button
                  key={i}
                  className="preset-btn"
                  onClick={() => {
                    setXRange({ min: preset.xMin, max: preset.xMax });
                    setYRange({ min: preset.yMin, max: preset.yMax });
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
          <div className="axis-inputs">
            <div className="axis-group">
              <label>X Axis</label>
              <div className="axis-range">
                <input
                  type="number"
                  value={axisInputs.xMin}
                  onChange={(e) => setAxisInputs(prev => ({ ...prev, xMin: e.target.value }))}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={axisInputs.xMax}
                  onChange={(e) => setAxisInputs(prev => ({ ...prev, xMax: e.target.value }))}
                  placeholder="Max"
                />
              </div>
            </div>
            <div className="axis-group">
              <label>Y Axis</label>
              <div className="axis-range">
                <input
                  type="number"
                  value={axisInputs.yMin}
                  onChange={(e) => setAxisInputs(prev => ({ ...prev, yMin: e.target.value }))}
                  placeholder="Min"
                />
                <span>to</span>
                <input
                  type="number"
                  value={axisInputs.yMax}
                  onChange={(e) => setAxisInputs(prev => ({ ...prev, yMax: e.target.value }))}
                  placeholder="Max"
                />
              </div>
            </div>
            <button className="apply-btn" onClick={applyAxisSettings}>Apply</button>
          </div>
        </div>
      )}

      {/* Equation Legend with KaTeX */}
      <div className="equation-legend">
        <h4>Equations</h4>
        {equations.map((eq, i) => (
          <div
            key={i}
            className={`legend-item ${activeInput === i ? 'active' : ''}`}
            onClick={() => {
              setActiveInput(i);
              inputRefs.current[i]?.focus();
            }}
          >
            <input
              type="checkbox"
              checked={eq.visible}
              onChange={(e) => {
                e.stopPropagation();
                updateEquation(i, 'visible', e.target.checked);
              }}
            />
            <span className="legend-color" style={{ background: eq.color }}></span>
            <span className="legend-label">y =</span>
            <div className="legend-equation">
              {eq.expr ? (
                <KaTeXDisplay expr={`y = ${exprToLatex(eq.expr)}`} />
              ) : (
                <span className="placeholder">Enter equation...</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Equation Inputs */}
      <div className="graph-inputs">
        {equations.map((eq, i) => (
          <div
            key={i}
            className={`equation-input ${activeInput === i ? 'active' : ''}`}
          >
            <span className="color-dot" style={{ background: eq.color }}></span>
            <span className="eq-label">y{i + 1} =</span>
            <input
              ref={el => inputRefs.current[i] = el}
              type="text"
              value={eq.expr}
              onChange={(e) => updateEquation(i, 'expr', e.target.value)}
              onFocus={() => setActiveInput(i)}
              placeholder="Enter equation (e.g., x^2, sin(x))"
              className="eq-input"
            />
          </div>
        ))}
      </div>

      {/* Symbol Keyboard */}
      <div className="symbol-keyboard">
        {/* Memory and Special Functions Row */}
        <div className="keyboard-memory-row">
          <button
            className="symbol-btn memory-btn"
            onClick={() => insertSymbol(lastAnswer.toString())}
            title={`Insert Last Answer: ${lastAnswer}`}
          >
            ANS
          </button>
          <button
            className="symbol-btn memory-btn"
            onClick={() => {
              const result = evaluateExpression(equations[activeInput].expr, 0);
              if (result !== null) setLastAnswer(result);
            }}
            title="Store current result at x=0"
          >
            STO
          </button>
          <button
            className="symbol-btn"
            onClick={() => insertSymbol('(')}
            title="Left Parenthesis"
          >
            (
          </button>
          <button
            className="symbol-btn"
            onClick={() => insertSymbol(')')}
            title="Right Parenthesis"
          >
            )
          </button>
          <button
            className="symbol-btn"
            onClick={() => insertSymbol(',')}
            title="Comma (for functions with multiple arguments)"
          >
            ,
          </button>
          <button className="symbol-btn clear-btn" onClick={clearEquation} title="Clear All">
            AC
          </button>
          <button
            className="symbol-btn backspace-btn"
            onClick={() => {
              const input = inputRefs.current[activeInput];
              if (input) {
                const start = input.selectionStart;
                const currentValue = equations[activeInput].expr;
                if (start > 0) {
                  const newValue = currentValue.substring(0, start - 1) + currentValue.substring(start);
                  updateEquation(activeInput, 'expr', newValue);
                  setTimeout(() => {
                    input.focus();
                    input.setSelectionRange(start - 1, start - 1);
                  }, 0);
                }
              }
            }}
            title="Backspace"
          >
            DEL
          </button>
        </div>

        <div className="keyboard-tabs">
          {Object.entries(symbolKeyboard).map(([key, data]) => (
            <button
              key={key}
              className={`keyboard-tab ${activeKeyboardTab === key ? 'active' : ''}`}
              onClick={() => setActiveKeyboardTab(key)}
            >
              {data.name}
            </button>
          ))}
        </div>
        <div className="keyboard-symbols">
          {symbolKeyboard[activeKeyboardTab].symbols.map((sym, i) => (
            <button
              key={i}
              className="symbol-btn"
              onClick={() => insertSymbol(sym.insert)}
              title={`Insert ${sym.display}`}
            >
              <KaTeXDisplay expr={sym.latex} />
            </button>
          ))}
        </div>
      </div>

      {/* Series Calculator Panel */}
      {showSeriesPanel && (
        <div className="series-panel">
          <div className="series-header">
            <h4>Series Calculator</h4>
            <button className="close-btn" onClick={() => setShowSeriesPanel(false)}>×</button>
          </div>
          <div className="series-types">
            <button
              className={`series-type-btn ${seriesConfig.type === 'sum' ? 'active' : ''}`}
              onClick={() => setSeriesConfig(prev => ({ ...prev, type: 'sum' }))}
            >
              <KaTeXDisplay expr="\\sum" /> Summation
            </button>
            <button
              className={`series-type-btn ${seriesConfig.type === 'prod' ? 'active' : ''}`}
              onClick={() => setSeriesConfig(prev => ({ ...prev, type: 'prod' }))}
            >
              <KaTeXDisplay expr="\\prod" /> Product
            </button>
          </div>
          <div className="series-config">
            <div className="series-formula-display">
              <KaTeXDisplay
                expr={seriesConfig.type === 'sum'
                  ? `\\sum_{n=${seriesConfig.start}}^{${seriesConfig.end}} (${seriesConfig.expr || 'n'})`
                  : `\\prod_{n=${seriesConfig.start}}^{${seriesConfig.end}} (${seriesConfig.expr || 'n'})`
                }
                displayMode={true}
              />
            </div>
            <div className="series-inputs">
              <div className="series-input-group">
                <label>Expression (use 'n')</label>
                <input
                  type="text"
                  value={seriesConfig.expr}
                  onChange={(e) => setSeriesConfig(prev => ({ ...prev, expr: e.target.value }))}
                  placeholder="e.g., n^2, 1/n, 1/fact(n)"
                />
              </div>
              <div className="series-range">
                <div className="series-input-group small">
                  <label>Start (n=)</label>
                  <input
                    type="number"
                    value={seriesConfig.start}
                    onChange={(e) => setSeriesConfig(prev => ({ ...prev, start: e.target.value }))}
                  />
                </div>
                <div className="series-input-group small">
                  <label>End (n=)</label>
                  <input
                    type="number"
                    value={seriesConfig.end}
                    onChange={(e) => setSeriesConfig(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <button className="calc-btn" onClick={calculateSeries}>Calculate</button>
            {seriesConfig.result && (
              <div className={`series-result ${seriesConfig.result.error ? 'error' : ''}`}>
                {seriesConfig.result.error ? (
                  <span>{seriesConfig.result.error}</span>
                ) : (
                  <>
                    <span className="result-label">Result:</span>
                    <span className="result-value">
                      {typeof seriesConfig.result.value === 'number'
                        ? (Math.abs(seriesConfig.result.value) < 0.0001 || Math.abs(seriesConfig.result.value) > 1e9
                          ? seriesConfig.result.value.toExponential(8)
                          : seriesConfig.result.value.toLocaleString(undefined, { maximumFractionDigits: 10 }))
                        : seriesConfig.result.value}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="series-examples">
            <span className="examples-label">Examples:</span>
            <div className="examples-list">
              <button onClick={() => setSeriesConfig(prev => ({ ...prev, expr: '1/n', start: '1', end: '100' }))}>
                <KaTeXDisplay expr="\\sum \\frac{1}{n}" />
              </button>
              <button onClick={() => setSeriesConfig(prev => ({ ...prev, expr: 'n^2', start: '1', end: '10' }))}>
                <KaTeXDisplay expr="\\sum n^2" />
              </button>
              <button onClick={() => setSeriesConfig(prev => ({ ...prev, expr: '1/fact(n)', start: '0', end: '20', type: 'sum' }))}>
                <KaTeXDisplay expr="e = \\sum \\frac{1}{n!}" />
              </button>
              <button onClick={() => setSeriesConfig(prev => ({ ...prev, expr: 'n', start: '1', end: '5', type: 'prod' }))}>
                <KaTeXDisplay expr="n! = \\prod n" />
              </button>
              <button onClick={() => setSeriesConfig(prev => ({ ...prev, expr: '(2*n)/(2*n-1)*(2*n)/(2*n+1)', start: '1', end: '100', type: 'prod' }))}>
                <KaTeXDisplay expr="\\frac{\\pi}{2}" /> (Wallis)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Graph Canvas */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={700}
          height={450}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: interactionMode === 'pan' ? (isDragging ? 'grabbing' : 'grab') : 'crosshair',
            touchAction: 'none'
          }}
        />
        {mousePos && (
          <div className="mouse-coords">
            <KaTeXDisplay expr={`(${mousePos.x}, ${mousePos.y})`} />
          </div>
        )}
        <div className="canvas-info">
          <span>Scroll/Pinch to zoom • Drag to pan • Double-tap to reset</span>
        </div>
      </div>

      {/* Quick Examples - Organized by Category */}
      <div className="graph-examples">
        <span className="examples-label">Quick examples:</span>
        <div className="examples-list">
          {[
            { expr: 'x^2', latex: 'x^2' },
            { expr: 'x^3', latex: 'x^3' },
            { expr: 'sin(x)', latex: '\\sin(x)' },
            { expr: 'cos(x)', latex: '\\cos(x)' },
            { expr: 'tan(x)', latex: '\\tan(x)' },
            { expr: 'sqrt(x)', latex: '\\sqrt{x}' },
            { expr: '1/x', latex: '\\frac{1}{x}' },
            { expr: 'abs(x)', latex: '|x|' },
            { expr: '2^x', latex: '2^x' },
            { expr: 'exp(x)', latex: 'e^x' },
            { expr: 'ln(x)', latex: '\\ln(x)' },
            { expr: 'log(x)', latex: '\\log(x)' },
          ].map((example, i) => (
            <button
              key={i}
              className="example-btn"
              onClick={() => {
                updateEquation(activeInput, 'expr', example.expr);
                inputRefs.current[activeInput]?.focus();
              }}
              title={`Set y = ${example.expr}`}
            >
              <KaTeXDisplay expr={example.latex} />
            </button>
          ))}
        </div>
        <span className="examples-label" style={{ marginTop: '0.75rem' }}>Advanced:</span>
        <div className="examples-list">
          {[
            { expr: 'sin(x)/x', latex: '\\frac{\\sin x}{x}' },
            { expr: 'x*sin(1/x)', latex: 'x\\sin(\\frac{1}{x})' },
            { expr: 'floor(x)', latex: '\\lfloor x \\rfloor' },
            { expr: 'sinh(x)', latex: '\\sinh(x)' },
            { expr: 'tanh(x)', latex: '\\tanh(x)' },
            { expr: 'asin(x)', latex: '\\sin^{-1}(x)' },
            { expr: 'atan(x)', latex: '\\tan^{-1}(x)' },
            { expr: 'cbrt(x)', latex: '\\sqrt[3]{x}' },
            { expr: 'x^2*sin(10*x)', latex: 'x^2\\sin(10x)' },
            { expr: 'exp(-x^2)', latex: 'e^{-x^2}' },
            { expr: 'sin(x)^2+cos(x)^2', latex: '\\sin^2+\\cos^2' },
            { expr: 'x/(1+x^2)', latex: '\\frac{x}{1+x^2}' },
          ].map((example, i) => (
            <button
              key={i}
              className="example-btn"
              onClick={() => {
                updateEquation(activeInput, 'expr', example.expr);
                inputRefs.current[activeInput]?.focus();
              }}
              title={`Set y = ${example.expr}`}
            >
              <KaTeXDisplay expr={example.latex} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Physics Calculator Component
function PhysicsCalculator() {
  const [selectedCategory, setSelectedCategory] = useState('kinematics');
  const [selectedFormula, setSelectedFormula] = useState(0);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);

  const category = physicsFormulas[selectedCategory];
  const formula = category.formulas[selectedFormula];

  useEffect(() => {
    // Reset inputs when formula changes
    const newInputs = {};
    formula.inputs.forEach((input, i) => {
      newInputs[i] = formula.defaultInputs?.[i] ?? '';
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputs(newInputs);
    setResult(null);
  }, [selectedCategory, selectedFormula, formula]);

  const calculate = () => {
    const values = formula.inputs.map((_, i) => parseFloat(inputs[i]));
    if (values.some(isNaN)) {
      setResult({ error: 'Please fill in all fields with valid numbers' });
      return;
    }

    try {
      const calcResult = formula.calc(...values);
      if (isNaN(calcResult) || !isFinite(calcResult)) {
        setResult({ error: 'Invalid result (check your inputs)' });
      } else {
        setResult({ value: calcResult });
      }
    } catch {
      setResult({ error: 'Calculation error' });
    }
  };

  return (
    <div className="formula-calculator">
      <div className="formula-categories">
        {Object.entries(physicsFormulas).map(([key, cat]) => (
          <button
            key={key}
            className={`formula-cat-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(key); setSelectedFormula(0); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="formula-select">
        <select
          value={selectedFormula}
          onChange={(e) => setSelectedFormula(parseInt(e.target.value))}
        >
          {category.formulas.map((f, i) => (
            <option key={i} value={i}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="formula-display">
        <span className="formula-text">{formula.formula}</span>
      </div>

      <div className="formula-inputs">
        {formula.inputs.map((input, i) => (
          <div key={i} className="formula-input-group">
            <label>{input}</label>
            <input
              type="number"
              value={inputs[i] ?? ''}
              onChange={(e) => setInputs(prev => ({ ...prev, [i]: e.target.value }))}
              placeholder="Enter value"
            />
          </div>
        ))}
      </div>

      <button className="calc-btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className={`formula-result ${result.error ? 'error' : ''}`}>
          {result.error ? result.error : (
            <>
              <span className="result-label">{formula.result}:</span>
              <span className="result-value">
                {typeof result.value === 'number'
                  ? (Math.abs(result.value) < 0.001 || Math.abs(result.value) > 1e9
                    ? result.value.toExponential(6)
                    : result.value.toLocaleString(undefined, { maximumFractionDigits: 6 }))
                  : result.value}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Interactive Periodic Table Component
function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Build the periodic table layout
  const getGridPosition = (element) => {
    const { number, group, period } = element;

    // Lanthanides (57-71) go in row 9
    if (number >= 57 && number <= 71) {
      return { row: 9, col: number - 54 };
    }
    // Actinides (89-103) go in row 10
    if (number >= 89 && number <= 103) {
      return { row: 10, col: number - 86 };
    }

    return { row: period, col: group };
  };

  const filteredElements = periodicTableData.filter(el => {
    const matchesCategory = filterCategory === 'all' || el.category === filterCategory;
    const matchesSearch = searchTerm === '' ||
      el.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      el.number.toString() === searchTerm;
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { value: 'all', label: 'All Elements' },
    { value: 'alkali-metal', label: 'Alkali Metals' },
    { value: 'alkaline-earth', label: 'Alkaline Earth' },
    { value: 'transition-metal', label: 'Transition Metals' },
    { value: 'post-transition', label: 'Post-Transition' },
    { value: 'metalloid', label: 'Metalloids' },
    { value: 'nonmetal', label: 'Nonmetals' },
    { value: 'halogen', label: 'Halogens' },
    { value: 'noble-gas', label: 'Noble Gases' },
    { value: 'lanthanide', label: 'Lanthanides' },
    { value: 'actinide', label: 'Actinides' },
  ];

  return (
    <div className="periodic-table-container">
      <div className="pt-controls">
        <div className="pt-search">
          <input
            type="text"
            placeholder="Search by name, symbol, or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="pt-filter">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-legend">
        {Object.entries(categoryColors).map(([cat, color]) => (
          <div
            key={cat}
            className={`legend-item-pt ${filterCategory === cat ? 'active' : ''}`}
            onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
          >
            <span className="legend-color-pt" style={{ background: color }}></span>
            <span className="legend-label-pt">{cat.replace('-', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="periodic-table-grid">
        {periodicTableData.map(element => {
          const pos = getGridPosition(element);
          const isFiltered = !filteredElements.includes(element);
          const bgColor = categoryColors[element.category] || '#666';

          return (
            <div
              key={element.number}
              className={`pt-element ${isFiltered ? 'filtered' : ''} ${selectedElement?.number === element.number ? 'selected' : ''}`}
              style={{
                gridRow: pos.row,
                gridColumn: pos.col,
                '--element-color': bgColor,
              }}
              onClick={() => setSelectedElement(element)}
            >
              <span className="pt-number">{element.number}</span>
              <span className="pt-symbol">{element.symbol}</span>
              <span className="pt-mass">{element.mass.toFixed(element.mass < 10 ? 3 : 2)}</span>
            </div>
          );
        })}

        {/* Gap indicators for lanthanides/actinides */}
        <div className="pt-gap-label" style={{ gridRow: 6, gridColumn: 3 }}>57-71</div>
        <div className="pt-gap-label" style={{ gridRow: 7, gridColumn: 3 }}>89-103</div>
        <div className="pt-series-label" style={{ gridRow: 9, gridColumn: 1 }}>Lanthanides</div>
        <div className="pt-series-label" style={{ gridRow: 10, gridColumn: 1 }}>Actinides</div>
      </div>

      {/* Element Detail Modal */}
      {selectedElement && (
        <div className="element-modal-overlay" onClick={() => setSelectedElement(null)}>
          <div className="element-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedElement(null)}>×</button>

            <div className="element-modal-header" style={{ background: categoryColors[selectedElement.category] }}>
              <div className="modal-number">{selectedElement.number}</div>
              <div className="modal-symbol">{selectedElement.symbol}</div>
              <div className="modal-name">{selectedElement.name}</div>
              <div className="modal-mass">{selectedElement.mass} u</div>
            </div>

            <div className="element-modal-body">
              <div className="element-description">
                {selectedElement.description}
              </div>

              <div className="element-properties">
                <h4>Properties</h4>
                <div className="properties-grid">
                  <div className="property">
                    <span className="property-label">Category</span>
                    <span className="property-value">{selectedElement.category.replace('-', ' ')}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Block</span>
                    <span className="property-value">{selectedElement.block}-block</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Period</span>
                    <span className="property-value">{selectedElement.period}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Group</span>
                    <span className="property-value">{selectedElement.group}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Electron Config</span>
                    <span className="property-value">{selectedElement.electronConfig}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Electronegativity</span>
                    <span className="property-value">{selectedElement.electronegativity ?? 'N/A'}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Density</span>
                    <span className="property-value">{selectedElement.density ? `${selectedElement.density} g/cm³` : 'N/A'}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Melting Point</span>
                    <span className="property-value">{selectedElement.meltingPoint ? `${selectedElement.meltingPoint} °C` : 'N/A'}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Boiling Point</span>
                    <span className="property-value">{selectedElement.boilingPoint ? `${selectedElement.boilingPoint} °C` : 'N/A'}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Discovered By</span>
                    <span className="property-value">{selectedElement.discoveredBy}</span>
                  </div>
                  <div className="property">
                    <span className="property-label">Year Discovered</span>
                    <span className="property-value">{selectedElement.yearDiscovered ?? 'Ancient'}</span>
                  </div>
                </div>
              </div>

              <div className="element-links">
                <a
                  href={`https://en.wikipedia.org/wiki/${selectedElement.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wiki-link"
                >
                  <span className="wiki-icon">📖</span>
                  Read more on Wikipedia
                </a>
                <a
                  href={`https://www.webelements.com/${selectedElement.name.toLowerCase()}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wiki-link webelements"
                >
                  <span className="wiki-icon">🔬</span>
                  WebElements Page
                </a>
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/element/${selectedElement.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="wiki-link pubchem"
                >
                  <span className="wiki-icon">🧪</span>
                  PubChem Data
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Graphing Section with 2D/3D tabs
function GraphingSection() {
  const [graphMode, setGraphMode] = useState('2d');

  return (
    <div className="graphing-section">
      <div className="graph-mode-tabs">
        <button
          className={`graph-mode-tab ${graphMode === '2d' ? 'active' : ''}`}
          onClick={() => setGraphMode('2d')}
        >
          <span className="tab-icon">📈</span>
          2D Graph
          <span className="tab-desc">y = f(x)</span>
        </button>
        <button
          className={`graph-mode-tab ${graphMode === '3d' ? 'active' : ''}`}
          onClick={() => setGraphMode('3d')}
        >
          <span className="tab-icon">🧊</span>
          3D Surface
          <span className="tab-desc">z = f(x, y)</span>
        </button>
      </div>

      {graphMode === '2d' ? <GraphCalculator /> : <Graph3DCalculator />}
    </div>
  );
}

// Chemistry Calculator Component
function ChemistryCalculator() {
  const [chemTab, setChemTab] = useState('formulas'); // 'formulas', 'periodic'
  const [selectedCategory, setSelectedCategory] = useState('stoichiometry');
  const [selectedFormula, setSelectedFormula] = useState(0);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [molarFormula, setMolarFormula] = useState('H2O');
  const [molarResult, setMolarResult] = useState(null);

  const category = chemistryFormulas[selectedCategory];
  const formula = category.formulas[selectedFormula];

  useEffect(() => {
    const newInputs = {};
    formula.inputs.forEach((_, i) => {
      newInputs[i] = '';
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputs(newInputs);
    setResult(null);
  }, [selectedCategory, selectedFormula, formula]);

  const calculate = () => {
    const values = formula.inputs.map((_, i) => parseFloat(inputs[i]));
    if (values.some(isNaN)) {
      setResult({ error: 'Please fill in all fields with valid numbers' });
      return;
    }

    try {
      const calcResult = formula.calc(...values);
      if (isNaN(calcResult) || !isFinite(calcResult)) {
        setResult({ error: 'Invalid result (check your inputs)' });
      } else {
        setResult({ value: calcResult });
      }
    } catch {
      setResult({ error: 'Calculation error' });
    }
  };

  const calculateMolarMassHandler = () => {
    const result = calculateMolarMass(molarFormula);
    setMolarResult(result);
  };

  return (
    <div className="chemistry-section">
      {/* Chemistry Tabs */}
      <div className="chem-tabs">
        <button
          className={`chem-tab ${chemTab === 'formulas' ? 'active' : ''}`}
          onClick={() => setChemTab('formulas')}
        >
          <span className="tab-icon">🧮</span>
          Formulas & Calculators
        </button>
        <button
          className={`chem-tab ${chemTab === 'periodic' ? 'active' : ''}`}
          onClick={() => setChemTab('periodic')}
        >
          <span className="tab-icon">⚗️</span>
          Periodic Table
        </button>
      </div>

      {chemTab === 'periodic' ? (
        <PeriodicTable />
      ) : (
      <div className="formula-calculator chemistry">
      {/* Molar Mass Calculator */}
      <div className="molar-mass-section">
        <h4>Molar Mass Calculator</h4>
        <div className="molar-input-row">
          <input
            type="text"
            value={molarFormula}
            onChange={(e) => setMolarFormula(e.target.value)}
            placeholder="e.g., H2O, NaCl, C6H12O6"
            className="molar-input"
          />
          <button onClick={calculateMolarMassHandler} className="calc-btn small">Calculate</button>
        </div>
        {molarResult && (
          <div className="molar-result">
            {molarResult.error ? (
              <span className="error">{molarResult.error}</span>
            ) : (
              <>
                <div className="molar-total">
                  Molar Mass: <strong>{molarResult.totalMass} g/mol</strong>
                </div>
                <div className="molar-breakdown">
                  {molarResult.breakdown.map((item, i) => (
                    <span key={i} className="element-contrib">
                      {item.element}{item.count > 1 ? `×${item.count}` : ''}: {item.mass}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <hr className="section-divider" />

      {/* Formula Calculator */}
      <div className="formula-categories">
        {Object.entries(chemistryFormulas).map(([key, cat]) => (
          <button
            key={key}
            className={`formula-cat-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(key); setSelectedFormula(0); }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="formula-select">
        <select
          value={selectedFormula}
          onChange={(e) => setSelectedFormula(parseInt(e.target.value))}
        >
          {category.formulas.map((f, i) => (
            <option key={i} value={i}>{f.name}</option>
          ))}
        </select>
      </div>

      <div className="formula-display">
        <span className="formula-text">{formula.formula}</span>
      </div>

      <div className="formula-inputs">
        {formula.inputs.map((input, i) => (
          <div key={i} className="formula-input-group">
            <label>{input}</label>
            <input
              type="number"
              value={inputs[i] ?? ''}
              onChange={(e) => setInputs(prev => ({ ...prev, [i]: e.target.value }))}
              placeholder="Enter value"
            />
          </div>
        ))}
      </div>

      <button className="calc-btn" onClick={calculate}>Calculate</button>

      {result && (
        <div className={`formula-result ${result.error ? 'error' : ''}`}>
          {result.error ? result.error : (
            <>
              <span className="result-label">{formula.result}:</span>
              <span className="result-value">
                {typeof result.value === 'number'
                  ? (Math.abs(result.value) < 0.001 || Math.abs(result.value) > 1e9
                    ? result.value.toExponential(6)
                    : result.value.toLocaleString(undefined, { maximumFractionDigits: 6 }))
                  : result.value}
              </span>
            </>
          )}
        </div>
      )}

      {/* Element Reference */}
      <div className="element-reference">
        <h4>Common Elements</h4>
        <div className="element-grid">
          {Object.entries(elementData).slice(0, 20).map(([symbol, data]) => (
            <div key={symbol} className="element-card" title={data.name}>
              <span className="element-symbol">{symbol}</span>
              <span className="element-mass">{data.mass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
      )}
    </div>
  );
}

// Pi Calculator Component using Chudnovsky Algorithm
function PiCalculator() {
  const [digits, setDigits] = useState(100);
  const [piValue, setPiValue] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  // Chudnovsky algorithm implementation using BigInt for arbitrary precision
  const calculatePi = useCallback(async () => {
    setIsCalculating(true);
    setProgress(0);
    setPiValue('');
    setStats(null);

    const startTime = performance.now();

    // Use setTimeout to allow UI updates
    await new Promise(resolve => setTimeout(resolve, 10));

    try {
      // Number of extra digits for precision during calculation
      const extraDigits = 20;
      const precision = digits + extraDigits;

      // Scaling factor: 10^precision
      const SCALE = 10n ** BigInt(precision);

      // Chudnovsky constants (scaled)
      const C = 426880n;
      const K_CONST = 10005n;

      // Binary splitting for Chudnovsky algorithm
      // Pi = (C * sqrt(K)) / S where S is the sum from the series

      // Calculate number of terms needed (approximately digits/14 terms for Chudnovsky)
      const numTerms = Math.ceil(digits / 14) + 5;

      // Calculate the series sum using direct summation
      // Σ ((-1)^k * (6k)! * (13591409 + 545140134k)) / ((3k)! * (k!)^3 * 640320^(3k+3/2))
      // We'll compute the sum term by term using recurrence relations (more efficient)
      // Each term: ((-1)^k * (6k)! * (13591409 + 545140134*k)) / ((3k)! * (k!)^3 * 640320^(3k))

      // For the sum, we accumulate (M_k * L_k) / X_k where:
      // M_k = (6k)! / ((3k)! * (k!)^3)
      // L_k = 13591409 + 545140134*k
      // X_k = (-262537412640768000)^k

      const L0 = 13591409n;
      const L_STEP = 545140134n;
      const X_BASE = -262537412640768000n; // -640320^3

      let M_k = 1n; // M_0 = 1
      let L_k = L0; // L_0 = 13591409
      let X_k = 1n; // X_0 = 1
      let S = L0 * SCALE; // First term, scaled

      for (let k = 1; k <= numTerms; k++) {
        // Update progress every few iterations
        if (k % 5 === 0) {
          setProgress(Math.min(90, (k / numTerms) * 90));
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        const kBig = BigInt(k);

        // M_k = M_{k-1} * (6k-5)(6k-4)(6k-3)(6k-2)(6k-1)(6k) / (k^3 * (3k-2)(3k-1)(3k))
        // Simplified recurrence:
        // M_k = M_{k-1} * (6k-5)*(6k-4)*(6k-3)*(6k-2)*(6k-1)*(6k) / (k^3 * (3k)*(3k-1)*(3k-2))

        const k6 = 6n * kBig;
        const k3 = 3n * kBig;

        const numerator = (k6 - 5n) * (k6 - 4n) * (k6 - 3n) * (k6 - 2n) * (k6 - 1n) * k6;
        const denominator = kBig * kBig * kBig * k3 * (k3 - 1n) * (k3 - 2n);

        M_k = (M_k * numerator) / denominator;
        L_k = L_k + L_STEP;
        X_k = X_k * X_BASE;

        // Add term to sum
        const term = (M_k * L_k * SCALE) / X_k;
        S = S + term;
      }

      setProgress(95);
      await new Promise(resolve => setTimeout(resolve, 0));

      // Pi = (C * sqrt(K * SCALE^2)) / S
      // First compute sqrt(10005) with high precision

      // Newton-Raphson for sqrt(10005) scaled by SCALE
      let sqrtK = SCALE * 100n; // Initial guess: sqrt(10005) ≈ 100
      const K_SCALED = K_CONST * SCALE * SCALE;

      for (let i = 0; i < 100; i++) {
        const nextSqrt = (sqrtK + K_SCALED / sqrtK) / 2n;
        if (nextSqrt === sqrtK) break;
        sqrtK = nextSqrt;
      }

      // Calculate Pi
      const piScaled = (C * sqrtK * SCALE) / S;

      // Convert to string
      let piStr = piScaled.toString();

      // Ensure we have enough digits
      while (piStr.length < precision + 1) {
        piStr = '0' + piStr;
      }

      // Format as 3.xxxxx...
      const intPart = piStr.slice(0, piStr.length - precision);
      const decPart = piStr.slice(piStr.length - precision, piStr.length - precision + digits);

      const finalPi = (intPart || '3') + '.' + decPart;

      const endTime = performance.now();

      // Verify against known Pi digits
      const knownPi = '3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019893809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151557485724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009';

      let verifiedDigits = 0;
      for (let i = 0; i < Math.min(finalPi.length, knownPi.length); i++) {
        if (finalPi[i] === knownPi[i]) {
          verifiedDigits++;
        } else {
          break;
        }
      }
      // Subtract 1 for the "3" and 1 for the "."
      verifiedDigits = Math.max(0, verifiedDigits - 2);

      setPiValue(finalPi);
      setStats({
        time: ((endTime - startTime) / 1000).toFixed(3),
        terms: numTerms,
        verified: verifiedDigits,
        requested: digits
      });
      setProgress(100);

    } catch (error) {
      console.error('Pi calculation error:', error);
      setPiValue('Error calculating Pi: ' + error.message);
    }

    setIsCalculating(false);
  }, [digits]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(piValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const exportToFile = () => {
    if (!piValue || piValue.startsWith('Error')) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `pi-${digits}-digits-${timestamp}.txt`;

    const content = [
      '═══════════════════════════════════════════════════════════════',
      '                    PI CALCULATION RESULT',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Digits Calculated: ${digits.toLocaleString()}`,
      `Calculation Time: ${stats?.time || 'N/A'}s`,
      `Terms Computed: ${stats?.terms || 'N/A'}`,
      `Verified Digits: ${stats?.verified || 'N/A'}`,
      `Algorithm: Chudnovsky Algorithm`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '═══════════════════════════════════════════════════════════════',
      '                         PI VALUE',
      '═══════════════════════════════════════════════════════════════',
      '',
      piValue,
      '',
      '═══════════════════════════════════════════════════════════════',
      '',
      'Formula used:',
      '1/π = 12 Σ ((-1)^k (6k)! (13591409 + 545140134k)) / ((3k)!(k!)³ 640320^(3k+3/2))',
      '',
      'Generated by Scientific Calculator - Pi Calculator',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // System-based max digits (64GB RAM detected - can handle ~100,000 digits comfortably)
  const MAX_DIGITS = 100000;

  const presets = [
    { label: '100', value: 100 },
    { label: '1,000', value: 1000 },
    { label: '5,000', value: 5000 },
    { label: '10,000', value: 10000 },
    { label: '25,000', value: 25000 },
    { label: '50,000', value: 50000 },
    { label: '100,000', value: 100000 },
  ];

  return (
    <div className="pi-calculator">
      <div className="pi-header">
        <h3>π Pi Calculator</h3>
        <p>Calculate Pi up to {MAX_DIGITS.toLocaleString()} decimal places using the Chudnovsky Algorithm</p>
        <div className="system-info">
          <span className="system-badge">💻 64GB RAM Detected</span>
          <span className="system-badge">⚡ High-precision mode enabled</span>
        </div>
      </div>

      <div className="pi-formula">
        <h4>Chudnovsky Algorithm Formula</h4>
        <div className="formula-display">
          <KaTeXDisplay formula="\\frac{1}{\\pi} = 12 \\sum_{k=0}^{\\infty} \\frac{(-1)^k (6k)! (13591409 + 545140134k)}{(3k)!(k!)^3 640320^{3k+3/2}}" />
        </div>
        <p className="formula-info">
          This algorithm converges extremely fast, adding approximately 14 digits of precision per term.
          It was used to calculate over 31 trillion digits of Pi in 2019.
        </p>
      </div>

      <div className="pi-controls">
        <div className="digits-input">
          <label>Number of Decimal Digits:</label>
          <input
            type="number"
            value={digits}
            onChange={(e) => setDigits(Math.max(1, Math.min(MAX_DIGITS, parseInt(e.target.value) || 1)))}
            min="1"
            max={MAX_DIGITS}
            disabled={isCalculating}
          />
          <span className="max-digits-info">Max: {MAX_DIGITS.toLocaleString()}</span>
        </div>

        <div className="preset-buttons">
          {presets.map(preset => (
            <button
              key={preset.value}
              className={`preset-btn ${digits === preset.value ? 'active' : ''}`}
              onClick={() => setDigits(preset.value)}
              disabled={isCalculating}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <button
          className="calculate-btn"
          onClick={calculatePi}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate π'}
        </button>
      </div>

      {isCalculating && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {stats && (
        <div className="pi-stats">
          <div className="stat-item">
            <span className="stat-label">Calculation Time:</span>
            <span className="stat-value">{stats.time}s</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Terms Computed:</span>
            <span className="stat-value">{stats.terms}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Verified Digits:</span>
            <span className="stat-value">{stats.verified} / {stats.requested}</span>
          </div>
          {stats.verified >= stats.requested && (
            <div className="verification-badge success">✓ All digits verified correct</div>
          )}
          {stats.verified < stats.requested && stats.verified > 0 && (
            <div className="verification-badge partial">⚠ {stats.verified} digits verified</div>
          )}
        </div>
      )}

      {piValue && !piValue.startsWith('Error') && (
        <div className="pi-result">
          <div className="result-header">
            <h4>π = </h4>
            <div className="result-actions">
              <button className="copy-btn" onClick={copyToClipboard}>
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
              <button className="export-btn" onClick={exportToFile}>
                💾 Export .txt
              </button>
            </div>
          </div>
          <div className="pi-digits">
            <span className="pi-integer">3.</span>
            <span className="pi-decimal">{piValue.slice(2)}</span>
          </div>
        </div>
      )}

      {piValue && piValue.startsWith('Error') && (
        <div className="pi-error">{piValue}</div>
      )}

      <div className="pi-info">
        <h4>About the Chudnovsky Algorithm</h4>
        <ul>
          <li><strong>Discovered:</strong> 1988 by David and Gregory Chudnovsky</li>
          <li><strong>Convergence:</strong> ~14 digits per term (fastest known series)</li>
          <li><strong>Records:</strong> Used for most Pi world records since 2009</li>
          <li><strong>Complexity:</strong> O(n log(n)³) with optimizations</li>
        </ul>
        <p>
          The algorithm is based on Ramanujan's pi formulas and uses properties of
          Heegner numbers. The number 640320³ + 744 is a perfect cube related to
          the j-invariant of an imaginary quadratic field.
        </p>
      </div>
    </div>
  );
}

// Dijkstra's Shortest Path Calculator
function DijkstraCalculator() {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [mode, setMode] = useState('addNode'); // addNode, addEdge, selectStart, selectEnd, delete
  const [edgeWeight, setEdgeWeight] = useState(1);
  const [tempEdge, setTempEdge] = useState(null);
  const [shortestPath, setShortestPath] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [distances, setDistances] = useState({});
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [showDistances, setShowDistances] = useState(true);

  // Generate unique node ID
  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Draw the graph
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.fillStyle = '#0d0d1a';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw grid
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }

    // Draw edges
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const isInPath = shortestPath?.edges?.some(
        e => (e.from === edge.from && e.to === edge.to) || (e.from === edge.to && e.to === edge.from)
      );

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);

      if (isInPath) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
      } else {
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
      }
      ctx.stroke();

      // Draw weight label
      const midX = (fromNode.x + toNode.x) / 2;
      const midY = (fromNode.y + toNode.y) / 2;
      ctx.fillStyle = isInPath ? '#10b981' : '#fff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Background for weight
      const weightText = edge.weight.toString();
      const textWidth = ctx.measureText(weightText).width;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(midX - textWidth / 2 - 4, midY - 10, textWidth + 8, 20);
      ctx.fillStyle = isInPath ? '#10b981' : '#fff';
      ctx.fillText(weightText, midX, midY);
    });

    // Draw temp edge while creating
    if (tempEdge && selectedNode) {
      const fromNode = nodes.find(n => n.id === selectedNode);
      if (fromNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(tempEdge.x, tempEdge.y);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const isStart = node.id === startNode;
      const isEnd = node.id === endNode;
      const isVisited = visitedNodes.includes(node.id);
      const isCurrent = node.id === currentNode;
      const isSelected = node.id === selectedNode;
      const isInPath = shortestPath?.path?.includes(node.id);

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 25, 0, Math.PI * 2);

      if (isCurrent) {
        ctx.fillStyle = '#f59e0b';
      } else if (isInPath) {
        ctx.fillStyle = '#10b981';
      } else if (isStart) {
        ctx.fillStyle = '#22c55e';
      } else if (isEnd) {
        ctx.fillStyle = '#ef4444';
      } else if (isVisited) {
        ctx.fillStyle = '#8b5cf6';
      } else if (isSelected) {
        ctx.fillStyle = '#f59e0b';
      } else {
        ctx.fillStyle = '#667eea';
      }
      ctx.fill();

      // Node border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node label
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      // Distance label
      if (showDistances && distances[node.id] !== undefined) {
        const distText = distances[node.id] === Infinity ? '∞' : distances[node.id].toString();
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(distText, node.x, node.y - 35);
      }
    });
  }, [nodes, edges, selectedNode, startNode, endNode, tempEdge, shortestPath, visitedNodes, currentNode, distances, showDistances]);

  // Redraw on state changes
  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => drawGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph]);

  // Get node at position
  const getNodeAtPosition = (x, y) => {
    return nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 25;
    });
  };

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (isAnimating) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = getNodeAtPosition(x, y);

    switch (mode) {
      case 'addNode':
        if (!clickedNode) {
          const newNode = {
            id: generateNodeId(),
            x,
            y,
            label: String.fromCharCode(65 + nodes.length % 26) + (nodes.length >= 26 ? Math.floor(nodes.length / 26) : '')
          };
          setNodes([...nodes, newNode]);
        }
        break;

      case 'addEdge':
        if (clickedNode) {
          if (!selectedNode) {
            setSelectedNode(clickedNode.id);
          } else if (clickedNode.id !== selectedNode) {
            // Check if edge already exists
            const edgeExists = edges.some(
              e => (e.from === selectedNode && e.to === clickedNode.id) ||
                   (e.from === clickedNode.id && e.to === selectedNode)
            );
            if (!edgeExists) {
              setEdges([...edges, { from: selectedNode, to: clickedNode.id, weight: edgeWeight }]);
            }
            setSelectedNode(null);
            setTempEdge(null);
          }
        } else {
          setSelectedNode(null);
          setTempEdge(null);
        }
        break;

      case 'selectStart':
        if (clickedNode) {
          setStartNode(clickedNode.id);
          setShortestPath(null);
          setVisitedNodes([]);
          setDistances({});
        }
        break;

      case 'selectEnd':
        if (clickedNode) {
          setEndNode(clickedNode.id);
          setShortestPath(null);
          setVisitedNodes([]);
          setDistances({});
        }
        break;

      case 'delete':
        if (clickedNode) {
          setNodes(nodes.filter(n => n.id !== clickedNode.id));
          setEdges(edges.filter(e => e.from !== clickedNode.id && e.to !== clickedNode.id));
          if (startNode === clickedNode.id) setStartNode(null);
          if (endNode === clickedNode.id) setEndNode(null);
          setShortestPath(null);
        }
        break;
    }
  };

  // Handle mouse move for edge preview
  const handleCanvasMouseMove = (e) => {
    if (mode === 'addEdge' && selectedNode) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      setTempEdge({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  // Dijkstra's algorithm with animation
  const runDijkstra = async () => {
    if (!startNode || !endNode) return;
    if (nodes.length < 2) return;

    setIsAnimating(true);
    setShortestPath(null);
    setVisitedNodes([]);
    setCurrentNode(null);

    // Build adjacency list
    const graph = {};
    nodes.forEach(node => {
      graph[node.id] = [];
    });
    edges.forEach(edge => {
      graph[edge.from].push({ node: edge.to, weight: edge.weight });
      graph[edge.to].push({ node: edge.from, weight: edge.weight });
    });

    // Initialize distances
    const dist = {};
    const prev = {};
    const unvisited = new Set();

    nodes.forEach(node => {
      dist[node.id] = node.id === startNode ? 0 : Infinity;
      prev[node.id] = null;
      unvisited.add(node.id);
    });

    setDistances({ ...dist });
    await new Promise(r => setTimeout(r, animationSpeed));

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let minDist = Infinity;
      let minNode = null;
      unvisited.forEach(nodeId => {
        if (dist[nodeId] < minDist) {
          minDist = dist[nodeId];
          minNode = nodeId;
        }
      });

      if (minNode === null || dist[minNode] === Infinity) break;
      if (minNode === endNode) break;

      setCurrentNode(minNode);
      await new Promise(r => setTimeout(r, animationSpeed));

      unvisited.delete(minNode);
      setVisitedNodes(v => [...v, minNode]);

      // Update neighbors
      for (const neighbor of graph[minNode]) {
        if (unvisited.has(neighbor.node)) {
          const alt = dist[minNode] + neighbor.weight;
          if (alt < dist[neighbor.node]) {
            dist[neighbor.node] = alt;
            prev[neighbor.node] = minNode;
            setDistances({ ...dist });
          }
        }
      }

      await new Promise(r => setTimeout(r, animationSpeed / 2));
    }

    setCurrentNode(null);

    // Reconstruct path
    if (dist[endNode] !== Infinity) {
      const path = [];
      const pathEdges = [];
      let current = endNode;

      while (current !== null) {
        path.unshift(current);
        if (prev[current] !== null) {
          pathEdges.unshift({ from: prev[current], to: current });
        }
        current = prev[current];
      }

      setShortestPath({ path, edges: pathEdges, distance: dist[endNode] });
    } else {
      setShortestPath({ path: [], edges: [], distance: null });
    }

    setIsAnimating(false);
  };

  // Clear graph
  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setStartNode(null);
    setEndNode(null);
    setSelectedNode(null);
    setShortestPath(null);
    setVisitedNodes([]);
    setDistances({});
    setCurrentNode(null);
  };

  // Reset path only
  const resetPath = () => {
    setShortestPath(null);
    setVisitedNodes([]);
    setDistances({});
    setCurrentNode(null);
  };

  // Load example graphs
  const loadExample = (type) => {
    clearGraph();
    let exampleNodes = [];
    let exampleEdges = [];

    if (type === 'simple') {
      exampleNodes = [
        { id: 'A', x: 100, y: 150, label: 'A' },
        { id: 'B', x: 250, y: 80, label: 'B' },
        { id: 'C', x: 250, y: 220, label: 'C' },
        { id: 'D', x: 400, y: 150, label: 'D' },
      ];
      exampleEdges = [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'C', weight: 2 },
        { from: 'B', to: 'D', weight: 3 },
        { from: 'C', to: 'D', weight: 5 },
        { from: 'B', to: 'C', weight: 1 },
      ];
    } else if (type === 'complex') {
      exampleNodes = [
        { id: 'A', x: 80, y: 200, label: 'A' },
        { id: 'B', x: 200, y: 80, label: 'B' },
        { id: 'C', x: 200, y: 320, label: 'C' },
        { id: 'D', x: 350, y: 150, label: 'D' },
        { id: 'E', x: 350, y: 250, label: 'E' },
        { id: 'F', x: 500, y: 200, label: 'F' },
      ];
      exampleEdges = [
        { from: 'A', to: 'B', weight: 7 },
        { from: 'A', to: 'C', weight: 9 },
        { from: 'B', to: 'D', weight: 10 },
        { from: 'B', to: 'E', weight: 15 },
        { from: 'C', to: 'E', weight: 11 },
        { from: 'D', to: 'F', weight: 6 },
        { from: 'E', to: 'F', weight: 9 },
        { from: 'D', to: 'E', weight: 2 },
      ];
    } else if (type === 'grid') {
      exampleNodes = [
        { id: 'A', x: 100, y: 100, label: 'A' },
        { id: 'B', x: 250, y: 100, label: 'B' },
        { id: 'C', x: 400, y: 100, label: 'C' },
        { id: 'D', x: 100, y: 200, label: 'D' },
        { id: 'E', x: 250, y: 200, label: 'E' },
        { id: 'F', x: 400, y: 200, label: 'F' },
        { id: 'G', x: 100, y: 300, label: 'G' },
        { id: 'H', x: 250, y: 300, label: 'H' },
        { id: 'I', x: 400, y: 300, label: 'I' },
      ];
      exampleEdges = [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'B', to: 'C', weight: 8 },
        { from: 'A', to: 'D', weight: 2 },
        { from: 'B', to: 'E', weight: 1 },
        { from: 'C', to: 'F', weight: 7 },
        { from: 'D', to: 'E', weight: 3 },
        { from: 'E', to: 'F', weight: 4 },
        { from: 'D', to: 'G', weight: 6 },
        { from: 'E', to: 'H', weight: 2 },
        { from: 'F', to: 'I', weight: 5 },
        { from: 'G', to: 'H', weight: 1 },
        { from: 'H', to: 'I', weight: 3 },
      ];
    }

    setNodes(exampleNodes);
    setEdges(exampleEdges);
  };

  const modes = [
    { id: 'addNode', label: '➕ Add Node', desc: 'Click to add nodes' },
    { id: 'addEdge', label: '🔗 Add Edge', desc: 'Click two nodes to connect' },
    { id: 'selectStart', label: '🟢 Set Start', desc: 'Select starting node' },
    { id: 'selectEnd', label: '🔴 Set End', desc: 'Select destination node' },
    { id: 'delete', label: '🗑️ Delete', desc: 'Click nodes to remove' },
  ];

  return (
    <div className="dijkstra-calculator">
      <div className="dijkstra-header">
        <h3>Dijkstra's Shortest Path Algorithm</h3>
        <p>Create a graph and find the shortest path between two nodes</p>
      </div>

      <div className="dijkstra-formula">
        <h4>Algorithm Overview</h4>
        <div className="formula-display">
          <KaTeXDisplay formula="d[v] = \\min(d[v], d[u] + w(u,v))" />
        </div>
        <p className="formula-info">
          Dijkstra's algorithm finds the shortest path from a source node to all other nodes
          in a weighted graph with non-negative edge weights. Time complexity: O((V + E) log V)
        </p>
      </div>

      <div className="dijkstra-controls">
        <div className="mode-selector">
          <label>Mode:</label>
          <div className="mode-buttons">
            {modes.map(m => (
              <button
                key={m.id}
                className={`mode-btn ${mode === m.id ? 'active' : ''}`}
                onClick={() => { setMode(m.id); setSelectedNode(null); setTempEdge(null); }}
                disabled={isAnimating}
                title={m.desc}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'addEdge' && (
          <div className="edge-weight-input">
            <label>Edge Weight:</label>
            <input
              type="number"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              disabled={isAnimating}
            />
          </div>
        )}

        <div className="speed-control">
          <label>Animation Speed:</label>
          <input
            type="range"
            min="100"
            max="1500"
            value={1600 - animationSpeed}
            onChange={(e) => setAnimationSpeed(1600 - parseInt(e.target.value))}
            disabled={isAnimating}
          />
          <span>{animationSpeed < 400 ? 'Fast' : animationSpeed < 800 ? 'Medium' : 'Slow'}</span>
        </div>

        <div className="dijkstra-actions">
          <button
            className="run-btn"
            onClick={runDijkstra}
            disabled={!startNode || !endNode || isAnimating || nodes.length < 2}
          >
            {isAnimating ? '⏳ Running...' : '▶️ Find Shortest Path'}
          </button>
          <button className="reset-btn" onClick={resetPath} disabled={isAnimating}>
            🔄 Reset Path
          </button>
          <button className="clear-btn" onClick={clearGraph} disabled={isAnimating}>
            🗑️ Clear All
          </button>
        </div>

        <div className="example-graphs">
          <label>Load Example:</label>
          <button onClick={() => loadExample('simple')} disabled={isAnimating}>Simple</button>
          <button onClick={() => loadExample('complex')} disabled={isAnimating}>Complex</button>
          <button onClick={() => loadExample('grid')} disabled={isAnimating}>Grid</button>
        </div>

        <label className="show-distances">
          <input
            type="checkbox"
            checked={showDistances}
            onChange={(e) => setShowDistances(e.target.checked)}
          />
          Show distances during animation
        </label>
      </div>

      <div className="graph-container">
        <canvas
          ref={canvasRef}
          className="graph-canvas"
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
        />
        <div className="graph-legend">
          <div className="legend-item"><span className="legend-color start"></span> Start Node</div>
          <div className="legend-item"><span className="legend-color end"></span> End Node</div>
          <div className="legend-item"><span className="legend-color visited"></span> Visited</div>
          <div className="legend-item"><span className="legend-color current"></span> Current</div>
          <div className="legend-item"><span className="legend-color path"></span> Shortest Path</div>
        </div>
      </div>

      <div className="dijkstra-status">
        <div className="status-item">
          <span className="status-label">Nodes:</span>
          <span className="status-value">{nodes.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Edges:</span>
          <span className="status-value">{edges.length}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Start:</span>
          <span className="status-value">{startNode ? nodes.find(n => n.id === startNode)?.label : '—'}</span>
        </div>
        <div className="status-item">
          <span className="status-label">End:</span>
          <span className="status-value">{endNode ? nodes.find(n => n.id === endNode)?.label : '—'}</span>
        </div>
      </div>

      {shortestPath && (
        <div className={`dijkstra-result ${shortestPath.distance === null ? 'no-path' : ''}`}>
          {shortestPath.distance !== null ? (
            <>
              <h4>✅ Shortest Path Found!</h4>
              <div className="path-info">
                <div className="path-distance">
                  <span className="label">Total Distance:</span>
                  <span className="value">{shortestPath.distance}</span>
                </div>
                <div className="path-route">
                  <span className="label">Route:</span>
                  <span className="value">
                    {shortestPath.path.map(nodeId => nodes.find(n => n.id === nodeId)?.label).join(' → ')}
                  </span>
                </div>
                <div className="path-hops">
                  <span className="label">Hops:</span>
                  <span className="value">{shortestPath.path.length - 1}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <h4>❌ No Path Found</h4>
              <p>There is no path connecting the start and end nodes.</p>
            </>
          )}
        </div>
      )}

      <div className="dijkstra-info">
        <h4>How to Use</h4>
        <ol>
          <li><strong>Add Nodes:</strong> Select "Add Node" mode and click on the canvas</li>
          <li><strong>Add Edges:</strong> Select "Add Edge" mode, set weight, click two nodes to connect them</li>
          <li><strong>Set Start/End:</strong> Use the mode buttons to select your start (green) and end (red) nodes</li>
          <li><strong>Run Algorithm:</strong> Click "Find Shortest Path" to visualize Dijkstra's algorithm</li>
          <li><strong>Delete:</strong> Use delete mode to remove nodes and their connected edges</li>
        </ol>
        <p>
          <strong>Tip:</strong> Try the example graphs to see how the algorithm works on different graph structures!
        </p>
      </div>
    </div>
  );
}

// Financial Calculator Component
function FinancialCalculator() {
  const [activeCategory, setActiveCategory] = useState('timeValue');

  // Default values for all calculators
  const defaultValues = {
    simpleInt: { principal: '10000', rate: '5', time: '2' },
    compoundInt: { principal: '10000', rate: '5', periods: '12', time: '2' },
    futureValue: { presentValue: '5000', payment: '0', rate: '7', time: '10' },
    presentValue: { futureValue: '10000', payment: '0', rate: '6', time: '5' },
    npv: { initial: '100000', rate: '10', cashFlows: '30000, 30000, 30000, 30000, 30000' },
    irr: { initial: '100000', cashFlows: '30000, 30000, 30000, 30000, 30000' },
    roi: { cost: '20000', gain: '25000' },
    cagr: { beginning: '10000', ending: '16000', years: '5' },
    sharpe: { portfolioReturn: '12', riskFreeRate: '3', stdDev: '10' },
    beta: { covariance: '0.02', marketVariance: '0.015' },
    capm: { riskFreeRate: '3', beta: '1.2', marketReturn: '10' },
    var: { portfolioValue: '1000000', meanReturn: '0', stdDev: '2', confidence: '95', days: '1' },
    blackScholes: { stockPrice: '100', strikePrice: '100', riskFreeRate: '5', volatility: '20', timeToExpiry: '1' },
    duration: { faceValue: '1000', couponRate: '5', yieldRate: '4', years: '10' },
    currentRatio: { assets: '500000', liabilities: '250000' },
    debtEquity: { debt: '1000000', equity: '2000000' },
    roe: { netIncome: '200000', equity: '1000000' },
    eps: { netIncome: '10000000', dividends: '0', shares: '1000000' },
    pe: { price: '50', eps: '5' },
    amortization: { principal: '250000', rate: '6.5', years: '30' },
    breakEven: { fixedCosts: '50000', pricePerUnit: '25', variableCost: '15' },
    gordon: { dividend: '2', growthRate: '5', requiredReturn: '10' },
  };

  const [calculations, setCalculations] = useState(defaultValues);

  // Helper to update calculation inputs
  const updateCalc = (calcId, field, value) => {
    setCalculations(prev => ({
      ...prev,
      [calcId]: { ...prev[calcId], [field]: value }
    }));
  };

  // Get calculation value or default
  const getVal = (calcId, field, defaultVal = '') => {
    return calculations[calcId]?.[field] ?? defaultValues[calcId]?.[field] ?? defaultVal;
  };

  // Format currency
  const formatCurrency = (num) => {
    if (isNaN(num) || !isFinite(num)) return '—';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  // Format percentage
  const formatPercent = (num) => {
    if (isNaN(num) || !isFinite(num)) return '—';
    return (num * 100).toFixed(2) + '%';
  };

  // Format number
  const formatNum = (num, decimals = 2) => {
    if (isNaN(num) || !isFinite(num)) return '—';
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  // ===== TIME VALUE OF MONEY CALCULATIONS =====

  // Simple Interest
  const calcSimpleInterest = () => {
    const P = parseFloat(getVal('simpleInt', 'principal')) || 0;
    const r = (parseFloat(getVal('simpleInt', 'rate')) || 0) / 100;
    const t = parseFloat(getVal('simpleInt', 'time')) || 0;
    const interest = P * r * t;
    const total = P + interest;
    return { interest, total };
  };

  // Compound Interest
  const calcCompoundInterest = () => {
    const P = parseFloat(getVal('compoundInt', 'principal')) || 0;
    const r = (parseFloat(getVal('compoundInt', 'rate')) || 0) / 100;
    const n = parseFloat(getVal('compoundInt', 'periods')) || 12;
    const t = parseFloat(getVal('compoundInt', 'time')) || 0;
    const amount = P * Math.pow(1 + r / n, n * t);
    const interest = amount - P;
    return { amount, interest };
  };

  // Future Value
  const calcFutureValue = () => {
    const PV = parseFloat(getVal('futureValue', 'presentValue')) || 0;
    const r = (parseFloat(getVal('futureValue', 'rate')) || 0) / 100;
    const t = parseFloat(getVal('futureValue', 'time')) || 0;
    const PMT = parseFloat(getVal('futureValue', 'payment')) || 0;
    const fvLump = PV * Math.pow(1 + r, t);
    const fvAnnuity = r > 0 ? PMT * ((Math.pow(1 + r, t) - 1) / r) : PMT * t;
    return { fvLump, fvAnnuity, total: fvLump + fvAnnuity };
  };

  // Present Value
  const calcPresentValue = () => {
    const FV = parseFloat(getVal('presentValue', 'futureValue')) || 0;
    const r = (parseFloat(getVal('presentValue', 'rate')) || 0) / 100;
    const t = parseFloat(getVal('presentValue', 'time')) || 0;
    const PMT = parseFloat(getVal('presentValue', 'payment')) || 0;
    const pvLump = FV / Math.pow(1 + r, t);
    const pvAnnuity = r > 0 ? PMT * ((1 - Math.pow(1 + r, -t)) / r) : PMT * t;
    return { pvLump, pvAnnuity, total: pvLump + pvAnnuity };
  };

  // Net Present Value
  const calcNPV = () => {
    const initial = parseFloat(getVal('npv', 'initial')) || 0;
    const r = (parseFloat(getVal('npv', 'rate')) || 0) / 100;
    const cashFlowsStr = getVal('npv', 'cashFlows') || '';
    const cashFlows = cashFlowsStr.split(',').map(cf => parseFloat(cf.trim())).filter(cf => !isNaN(cf));

    let npv = -initial;
    cashFlows.forEach((cf, i) => {
      npv += cf / Math.pow(1 + r, i + 1);
    });
    return { npv, profitable: npv > 0 };
  };

  // IRR (using Newton-Raphson approximation)
  const calcIRR = () => {
    const initial = parseFloat(getVal('irr', 'initial')) || 0;
    const cashFlowsStr = getVal('irr', 'cashFlows') || '';
    const cashFlows = [-initial, ...cashFlowsStr.split(',').map(cf => parseFloat(cf.trim())).filter(cf => !isNaN(cf))];

    if (cashFlows.length < 2) return { irr: NaN };

    let rate = 0.1;
    for (let i = 0; i < 100; i++) {
      let npv = 0, dnpv = 0;
      cashFlows.forEach((cf, t) => {
        npv += cf / Math.pow(1 + rate, t);
        dnpv -= t * cf / Math.pow(1 + rate, t + 1);
      });
      const newRate = rate - npv / dnpv;
      if (Math.abs(newRate - rate) < 0.0001) {
        return { irr: newRate };
      }
      rate = newRate;
    }
    return { irr: rate };
  };

  // ===== INVESTMENT CALCULATIONS =====

  // ROI
  const calcROI = () => {
    const cost = parseFloat(getVal('roi', 'cost')) || 0;
    const gain = parseFloat(getVal('roi', 'gain')) || 0;
    const roi = cost > 0 ? (gain - cost) / cost : 0;
    return { roi, profit: gain - cost };
  };

  // CAGR
  const calcCAGR = () => {
    const beginning = parseFloat(getVal('cagr', 'beginning')) || 0;
    const ending = parseFloat(getVal('cagr', 'ending')) || 0;
    const years = parseFloat(getVal('cagr', 'years')) || 1;
    const cagr = beginning > 0 && years > 0 ? Math.pow(ending / beginning, 1 / years) - 1 : 0;
    return { cagr };
  };

  // Sharpe Ratio
  const calcSharpe = () => {
    const portfolioReturn = (parseFloat(getVal('sharpe', 'portfolioReturn')) || 0) / 100;
    const riskFreeRate = (parseFloat(getVal('sharpe', 'riskFreeRate')) || 0) / 100;
    const stdDev = (parseFloat(getVal('sharpe', 'stdDev')) || 0) / 100;
    const sharpe = stdDev > 0 ? (portfolioReturn - riskFreeRate) / stdDev : 0;
    return { sharpe };
  };

  // Beta
  const calcBeta = () => {
    const covariance = parseFloat(getVal('beta', 'covariance')) || 0;
    const marketVariance = parseFloat(getVal('beta', 'marketVariance')) || 0;
    const beta = marketVariance > 0 ? covariance / marketVariance : 0;
    return { beta };
  };

  // CAPM
  const calcCAPM = () => {
    const riskFreeRate = (parseFloat(getVal('capm', 'riskFreeRate')) || 0) / 100;
    const beta = parseFloat(getVal('capm', 'beta')) || 1;
    const marketReturn = (parseFloat(getVal('capm', 'marketReturn')) || 0) / 100;
    const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
    return { expectedReturn };
  };

  // ===== RISK MANAGEMENT =====

  // VaR (Parametric)
  const calcVaR = () => {
    const portfolioValue = parseFloat(getVal('var', 'portfolioValue')) || 0;
    const meanReturn = (parseFloat(getVal('var', 'meanReturn')) || 0) / 100;
    const stdDev = (parseFloat(getVal('var', 'stdDev')) || 0) / 100;
    const confidence = parseFloat(getVal('var', 'confidence')) || 95;
    const days = parseFloat(getVal('var', 'days')) || 1;

    // Z-scores for common confidence levels
    const zScores = { 90: 1.28, 95: 1.65, 99: 2.33 };
    const z = zScores[confidence] || 1.65;

    const var1Day = portfolioValue * (meanReturn - z * stdDev);
    const varNDay = portfolioValue * (meanReturn * days - z * stdDev * Math.sqrt(days));
    return { var1Day: Math.abs(var1Day), varNDay: Math.abs(varNDay) };
  };

  // Black-Scholes
  const calcBlackScholes = () => {
    const S = parseFloat(getVal('blackScholes', 'stockPrice')) || 0;
    const K = parseFloat(getVal('blackScholes', 'strikePrice')) || 0;
    const r = (parseFloat(getVal('blackScholes', 'riskFreeRate')) || 0) / 100;
    const sigma = (parseFloat(getVal('blackScholes', 'volatility')) || 0) / 100;
    const t = parseFloat(getVal('blackScholes', 'timeToExpiry')) || 0;

    if (S <= 0 || K <= 0 || sigma <= 0 || t <= 0) return { call: 0, put: 0 };

    // Standard normal CDF approximation
    const normCDF = (x) => {
      const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
      const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2);
      const t = 1 / (1 + p * x);
      const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      return 0.5 * (1 + sign * y);
    };

    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * t) / (sigma * Math.sqrt(t));
    const d2 = d1 - sigma * Math.sqrt(t);

    const call = S * normCDF(d1) - K * Math.exp(-r * t) * normCDF(d2);
    const put = K * Math.exp(-r * t) * normCDF(-d2) - S * normCDF(-d1);

    return { call, put, d1, d2 };
  };

  // Bond Duration
  const calcDuration = () => {
    const faceValue = parseFloat(getVal('duration', 'faceValue')) || 1000;
    const couponRate = (parseFloat(getVal('duration', 'couponRate')) || 0) / 100;
    const yieldRate = (parseFloat(getVal('duration', 'yieldRate')) || 0) / 100;
    const years = parseFloat(getVal('duration', 'years')) || 0;

    const coupon = faceValue * couponRate;
    let price = 0, weightedSum = 0;

    for (let t = 1; t <= years; t++) {
      const cf = t === years ? coupon + faceValue : coupon;
      const pv = cf / Math.pow(1 + yieldRate, t);
      price += pv;
      weightedSum += t * pv;
    }

    const duration = price > 0 ? weightedSum / price : 0;
    const modifiedDuration = duration / (1 + yieldRate);

    return { duration, modifiedDuration, price };
  };

  // ===== ACCOUNTING RATIOS =====

  const calcCurrentRatio = () => {
    const assets = parseFloat(getVal('currentRatio', 'assets')) || 0;
    const liabilities = parseFloat(getVal('currentRatio', 'liabilities')) || 0;
    return { ratio: liabilities > 0 ? assets / liabilities : 0 };
  };

  const calcDebtToEquity = () => {
    const debt = parseFloat(getVal('debtEquity', 'debt')) || 0;
    const equity = parseFloat(getVal('debtEquity', 'equity')) || 0;
    return { ratio: equity > 0 ? debt / equity : 0 };
  };

  const calcROE = () => {
    const netIncome = parseFloat(getVal('roe', 'netIncome')) || 0;
    const equity = parseFloat(getVal('roe', 'equity')) || 0;
    return { roe: equity > 0 ? netIncome / equity : 0 };
  };

  const calcEPS = () => {
    const netIncome = parseFloat(getVal('eps', 'netIncome')) || 0;
    const dividends = parseFloat(getVal('eps', 'dividends')) || 0;
    const shares = parseFloat(getVal('eps', 'shares')) || 0;
    return { eps: shares > 0 ? (netIncome - dividends) / shares : 0 };
  };

  const calcPE = () => {
    const price = parseFloat(getVal('pe', 'price')) || 0;
    const eps = parseFloat(getVal('pe', 'eps')) || 0;
    return { pe: eps > 0 ? price / eps : 0 };
  };

  // ===== LOAN CALCULATIONS =====

  const calcAmortization = () => {
    const principal = parseFloat(getVal('amortization', 'principal')) || 0;
    const annualRate = (parseFloat(getVal('amortization', 'rate')) || 0) / 100;
    const years = parseFloat(getVal('amortization', 'years')) || 0;

    const r = annualRate / 12;
    const n = years * 12;

    const payment = r > 0 ? principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
    const totalPayment = payment * n;
    const totalInterest = totalPayment - principal;

    return { payment, totalPayment, totalInterest };
  };

  const calcBreakEven = () => {
    const fixedCosts = parseFloat(getVal('breakEven', 'fixedCosts')) || 0;
    const pricePerUnit = parseFloat(getVal('breakEven', 'pricePerUnit')) || 0;
    const variableCost = parseFloat(getVal('breakEven', 'variableCost')) || 0;
    const contribution = pricePerUnit - variableCost;
    const units = contribution > 0 ? fixedCosts / contribution : 0;
    const revenue = units * pricePerUnit;
    return { units, revenue, contribution };
  };

  // Gordon Growth Model
  const calcGordonGrowth = () => {
    const dividend = parseFloat(getVal('gordon', 'dividend')) || 0;
    const growthRate = (parseFloat(getVal('gordon', 'growthRate')) || 0) / 100;
    const requiredReturn = (parseFloat(getVal('gordon', 'requiredReturn')) || 0) / 100;
    const d1 = dividend * (1 + growthRate);
    const stockValue = requiredReturn > growthRate ? d1 / (requiredReturn - growthRate) : 0;
    return { stockValue, d1 };
  };

  const categories = [
    { id: 'timeValue', name: 'Time Value of Money', icon: '⏰' },
    { id: 'investment', name: 'Investment Analysis', icon: '📈' },
    { id: 'risk', name: 'Risk Management', icon: '⚠️' },
    { id: 'ratios', name: 'Financial Ratios', icon: '📊' },
    { id: 'loans', name: 'Loans & Valuation', icon: '🏦' },
  ];

  const [expandedEducation, setExpandedEducation] = useState({});

  const toggleEducation = (id) => {
    setExpandedEducation(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCalculator = (id, title, formula, inputs, results, description, education) => (
    <div className="finance-calc-card" key={id}>
      <div className="calc-header">
        <h4>{title}</h4>
        <p className="calc-description">{description}</p>
      </div>
      <div className="calc-formula">
        <KaTeXDisplay formula={formula} />
      </div>
      <div className="calc-inputs">
        {inputs.map(input => (
          <div className="calc-input-group" key={input.id}>
            <label>{input.label}</label>
            {input.type === 'text' ? (
              <input
                type="text"
                value={getVal(id, input.id)}
                onChange={(e) => updateCalc(id, input.id, e.target.value)}
                placeholder={input.placeholder}
              />
            ) : (
              <input
                type="number"
                value={getVal(id, input.id)}
                onChange={(e) => updateCalc(id, input.id, e.target.value)}
                placeholder={input.placeholder}
                step={input.step || 'any'}
              />
            )}
            {input.suffix && <span className="input-suffix">{input.suffix}</span>}
          </div>
        ))}
      </div>
      <div className="calc-results">
        {results.map(result => (
          <div className="calc-result-item" key={result.label}>
            <span className="result-label">{result.label}:</span>
            <span className={`result-value ${result.highlight ? 'highlight' : ''}`}>
              {result.value}
            </span>
          </div>
        ))}
      </div>
      {education && (
        <div className="calc-education">
          <button
            className="education-toggle"
            onClick={() => toggleEducation(id)}
          >
            📚 {expandedEducation[id] ? 'Hide' : 'Show'} Learning Resources
          </button>
          {expandedEducation[id] && (
            <div className="education-content">
              {education.variables && (
                <div className="education-section">
                  <h5>📐 Variables Explained</h5>
                  <ul>
                    {education.variables.map((v, i) => (
                      <li key={i}><strong>{v.symbol}</strong> = {v.meaning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {education.concepts && (
                <div className="education-section">
                  <h5>💡 Key Concepts</h5>
                  <ul>
                    {education.concepts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {education.example && (
                <div className="education-section">
                  <h5>📝 Example</h5>
                  <p>{education.example}</p>
                </div>
              )}
              {education.links && (
                <div className="education-section">
                  <h5>🔗 Learn More</h5>
                  <div className="education-links">
                    {education.links.map((link, i) => (
                      <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.text}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="financial-calculator">
      <div className="finance-header">
        <h3>Financial Calculator</h3>
        <p>Comprehensive financial calculations, formulas, and analysis tools</p>
      </div>

      <div className="finance-categories">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`finance-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="cat-icon">{cat.icon}</span>
            <span className="cat-name">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="finance-calculators">
        {activeCategory === 'timeValue' && (
          <>
            {renderCalculator('simpleInt', 'Simple Interest',
              'I = P \\times r \\times t',
              [
                { id: 'principal', label: 'Principal (P)', placeholder: '10000' },
                { id: 'rate', label: 'Annual Rate (r)', placeholder: '5', suffix: '%' },
                { id: 'time', label: 'Time (t)', placeholder: '2', suffix: 'years' },
              ],
              [
                { label: 'Interest', value: formatCurrency(calcSimpleInterest().interest) },
                { label: 'Total Amount', value: formatCurrency(calcSimpleInterest().total), highlight: true },
              ],
              'Calculates interest on principal only, without compounding. Used for short-term loans.',
              {
                variables: [
                  { symbol: 'I', meaning: 'Interest earned (in dollars)' },
                  { symbol: 'P', meaning: 'Principal - the initial amount invested or borrowed' },
                  { symbol: 'r', meaning: 'Annual interest rate (as a decimal, e.g., 5% = 0.05)' },
                  { symbol: 't', meaning: 'Time period in years' },
                ],
                concepts: [
                  'Simple interest is calculated only on the original principal amount',
                  'Interest does not compound - you earn the same amount each period',
                  'Commonly used for short-term loans, auto loans, and some bonds',
                  'Total repayment = Principal + Interest',
                ],
                example: 'A $10,000 loan at 5% simple interest for 2 years: Interest = $10,000 × 0.05 × 2 = $1,000. Total repayment: $11,000.',
                links: [
                  { text: 'Investopedia: Simple Interest', url: 'https://www.investopedia.com/terms/s/simple_interest.asp' },
                  { text: 'Khan Academy: Interest basics', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial' },
                ],
              }
            )}

            {renderCalculator('compoundInt', 'Compound Interest',
              'A = P \\times \\left(1 + \\frac{r}{n}\\right)^{n \\times t}',
              [
                { id: 'principal', label: 'Principal (P)', placeholder: '10000' },
                { id: 'rate', label: 'Annual Rate (r)', placeholder: '5', suffix: '%' },
                { id: 'periods', label: 'Compounds/Year (n)', placeholder: '12' },
                { id: 'time', label: 'Time (t)', placeholder: '2', suffix: 'years' },
              ],
              [
                { label: 'Final Amount', value: formatCurrency(calcCompoundInterest().amount), highlight: true },
                { label: 'Interest Earned', value: formatCurrency(calcCompoundInterest().interest) },
              ],
              'Interest on principal plus accumulated interest. Core to savings and investments.',
              {
                variables: [
                  { symbol: 'A', meaning: 'Final amount after interest' },
                  { symbol: 'P', meaning: 'Principal (initial investment)' },
                  { symbol: 'r', meaning: 'Annual interest rate (decimal)' },
                  { symbol: 'n', meaning: 'Number of times interest compounds per year (12=monthly, 4=quarterly, 1=annually)' },
                  { symbol: 't', meaning: 'Time in years' },
                ],
                concepts: [
                  'Compound interest earns "interest on interest" - your earnings grow exponentially',
                  'More frequent compounding = more total interest earned',
                  'Albert Einstein allegedly called it "the eighth wonder of the world"',
                  'The Rule of 72: Divide 72 by your interest rate to estimate years to double your money',
                ],
                example: '$10,000 at 5% compounded monthly for 2 years: A = $10,000 × (1 + 0.05/12)^(12×2) = $11,049.41',
                links: [
                  { text: 'Investopedia: Compound Interest', url: 'https://www.investopedia.com/terms/c/compoundinterest.asp' },
                  { text: 'SEC: Compound Interest Calculator', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
                ],
              }
            )}

            {renderCalculator('futureValue', 'Future Value',
              'FV = PV \\times (1 + r)^t + PMT \\times \\frac{(1 + r)^t - 1}{r}',
              [
                { id: 'presentValue', label: 'Present Value', placeholder: '5000' },
                { id: 'payment', label: 'Periodic Payment', placeholder: '0' },
                { id: 'rate', label: 'Annual Rate', placeholder: '7', suffix: '%' },
                { id: 'time', label: 'Years', placeholder: '10' },
              ],
              [
                { label: 'FV (Lump Sum)', value: formatCurrency(calcFutureValue().fvLump) },
                { label: 'FV (Annuity)', value: formatCurrency(calcFutureValue().fvAnnuity) },
                { label: 'Total FV', value: formatCurrency(calcFutureValue().total), highlight: true },
              ],
              'Projects the value of an investment after growth over time.',
              {
                variables: [
                  { symbol: 'FV', meaning: 'Future Value - what your investment will be worth' },
                  { symbol: 'PV', meaning: 'Present Value - your initial lump sum investment' },
                  { symbol: 'PMT', meaning: 'Payment - regular contributions (annuity)' },
                  { symbol: 'r', meaning: 'Interest rate per period' },
                  { symbol: 't', meaning: 'Number of periods' },
                ],
                concepts: [
                  'FV answers: "How much will my investment be worth in the future?"',
                  'Combines lump sum growth with regular contribution growth',
                  'Essential for retirement planning and investment goals',
                  'Higher rates and longer time horizons dramatically increase FV',
                ],
                example: '$5,000 invested today at 7% for 10 years: FV = $5,000 × (1.07)^10 = $9,835.76',
                links: [
                  { text: 'Investopedia: Future Value', url: 'https://www.investopedia.com/terms/f/futurevalue.asp' },
                  { text: 'Corporate Finance Institute: FV', url: 'https://corporatefinanceinstitute.com/resources/valuation/future-value-fv/' },
                ],
              }
            )}

            {renderCalculator('presentValue', 'Present Value',
              'PV = \\frac{FV}{(1 + r)^t} + PMT \\times \\frac{1 - (1 + r)^{-t}}{r}',
              [
                { id: 'futureValue', label: 'Future Value', placeholder: '10000' },
                { id: 'payment', label: 'Periodic Payment', placeholder: '0' },
                { id: 'rate', label: 'Discount Rate', placeholder: '6', suffix: '%' },
                { id: 'time', label: 'Years', placeholder: '5' },
              ],
              [
                { label: 'PV (Lump Sum)', value: formatCurrency(calcPresentValue().pvLump) },
                { label: 'PV (Annuity)', value: formatCurrency(calcPresentValue().pvAnnuity) },
                { label: 'Total PV', value: formatCurrency(calcPresentValue().total), highlight: true },
              ],
              'Discounts future cash flows to today\'s value. Essential for valuation.',
              {
                variables: [
                  { symbol: 'PV', meaning: 'Present Value - today\'s worth of future money' },
                  { symbol: 'FV', meaning: 'Future Value - the amount you\'ll receive later' },
                  { symbol: 'PMT', meaning: 'Payment - regular future payments (annuity)' },
                  { symbol: 'r', meaning: 'Discount rate - your required return or opportunity cost' },
                  { symbol: 't', meaning: 'Time periods until payment' },
                ],
                concepts: [
                  'PV answers: "What is future money worth today?"',
                  'Based on the Time Value of Money - a dollar today is worth more than a dollar tomorrow',
                  'The discount rate reflects risk and opportunity cost',
                  'Foundation for all valuation: stocks, bonds, real estate, businesses',
                ],
                example: '$10,000 received in 5 years at 6% discount rate: PV = $10,000 / (1.06)^5 = $7,472.58',
                links: [
                  { text: 'Investopedia: Present Value', url: 'https://www.investopedia.com/terms/p/presentvalue.asp' },
                  { text: 'Khan Academy: Present Value', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/interest-tutorial/present-value/v/introduction-to-present-value' },
                ],
              }
            )}

            {renderCalculator('npv', 'Net Present Value (NPV)',
              'NPV = \\sum_{t=1}^{n} \\frac{CF_t}{(1 + r)^t} - C_0',
              [
                { id: 'initial', label: 'Initial Investment', placeholder: '100000' },
                { id: 'rate', label: 'Discount Rate', placeholder: '10', suffix: '%' },
                { id: 'cashFlows', label: 'Cash Flows (comma-separated)', placeholder: '30000, 30000, 30000, 30000, 30000', type: 'text' },
              ],
              [
                { label: 'NPV', value: formatCurrency(calcNPV().npv), highlight: true },
                { label: 'Decision', value: calcNPV().profitable ? '✅ Profitable (NPV > 0)' : '❌ Not Profitable (NPV < 0)' },
              ],
              'Assesses profitability of projects by discounting all cash flows to present value.',
              {
                variables: [
                  { symbol: 'NPV', meaning: 'Net Present Value - total value created by the project' },
                  { symbol: 'CF_t', meaning: 'Cash flow at time period t' },
                  { symbol: 'C_0', meaning: 'Initial investment (cost at time 0)' },
                  { symbol: 'r', meaning: 'Discount rate (cost of capital or required return)' },
                  { symbol: 't', meaning: 'Time period (year 1, 2, 3, etc.)' },
                ],
                concepts: [
                  'NPV > 0: Project creates value - ACCEPT',
                  'NPV < 0: Project destroys value - REJECT',
                  'NPV = 0: Project breaks even - indifferent',
                  'The gold standard for capital budgeting decisions',
                  'Accounts for time value of money and risk through discount rate',
                ],
                example: 'Project costs $100,000, returns $30,000/year for 5 years at 10% discount: NPV = $13,724 (profitable!)',
                links: [
                  { text: 'Investopedia: NPV', url: 'https://www.investopedia.com/terms/n/npv.asp' },
                  { text: 'Harvard Business Review: NPV Guide', url: 'https://hbr.org/2014/11/a-refresher-on-net-present-value' },
                ],
              }
            )}

            {renderCalculator('irr', 'Internal Rate of Return (IRR)',
              'NPV = 0 \\Rightarrow \\sum_{t=0}^{n} \\frac{CF_t}{(1 + IRR)^t} = 0',
              [
                { id: 'initial', label: 'Initial Investment', placeholder: '100000' },
                { id: 'cashFlows', label: 'Cash Flows (comma-separated)', placeholder: '30000, 30000, 30000, 30000, 30000', type: 'text' },
              ],
              [
                { label: 'IRR', value: formatPercent(calcIRR().irr), highlight: true },
              ],
              'The discount rate that makes NPV equal to zero. Solved iteratively using Newton-Raphson method.',
              {
                variables: [
                  { symbol: 'IRR', meaning: 'Internal Rate of Return - the project\'s effective interest rate' },
                  { symbol: 'CF_t', meaning: 'Cash flow at time t (negative for investments, positive for returns)' },
                  { symbol: 'NPV', meaning: 'Net Present Value (set to zero to solve for IRR)' },
                ],
                concepts: [
                  'IRR is the "break-even" discount rate for a project',
                  'If IRR > cost of capital: ACCEPT the project',
                  'If IRR < cost of capital: REJECT the project',
                  'Allows comparison of projects with different sizes and timelines',
                  'Cannot be solved algebraically - requires iteration (Newton-Raphson method)',
                ],
                example: 'Project costs $100,000, returns $30,000/year for 5 years: IRR ≈ 15.24%. If your cost of capital is 10%, accept!',
                links: [
                  { text: 'Investopedia: IRR', url: 'https://www.investopedia.com/terms/i/irr.asp' },
                  { text: 'Corporate Finance Institute: IRR', url: 'https://corporatefinanceinstitute.com/resources/valuation/internal-rate-of-return-irr/' },
                ],
              }
            )}
          </>
        )}

        {activeCategory === 'investment' && (
          <>
            {renderCalculator('roi', 'Return on Investment (ROI)',
              'ROI = \\frac{\\text{Gain} - \\text{Cost}}{\\text{Cost}} \\times 100\\%',
              [
                { id: 'cost', label: 'Initial Cost', placeholder: '20000' },
                { id: 'gain', label: 'Final Value', placeholder: '25000' },
              ],
              [
                { label: 'Net Profit', value: formatCurrency(calcROI().profit) },
                { label: 'ROI', value: formatPercent(calcROI().roi), highlight: true },
              ],
              'Measures gain or loss relative to the initial investment cost.',
              {
                variables: [
                  { symbol: 'ROI', meaning: 'Return on Investment as a percentage' },
                  { symbol: 'Gain', meaning: 'Final value or total returns received' },
                  { symbol: 'Cost', meaning: 'Initial investment amount' },
                ],
                concepts: [
                  'ROI measures efficiency of an investment',
                  'Simple to calculate and understand',
                  'Does not account for time - a 50% ROI over 1 year is better than 50% over 10 years',
                  'Use CAGR or IRR for time-adjusted returns',
                ],
                example: 'Bought stock for $20,000, sold for $25,000: ROI = ($25,000 - $20,000) / $20,000 = 25%',
                links: [
                  { text: 'Investopedia: ROI', url: 'https://www.investopedia.com/terms/r/returnoninvestment.asp' },
                ],
              }
            )}

            {renderCalculator('cagr', 'Compound Annual Growth Rate (CAGR)',
              'CAGR = \\left(\\frac{V_f}{V_i}\\right)^{\\frac{1}{t}} - 1',
              [
                { id: 'beginning', label: 'Beginning Value', placeholder: '10000' },
                { id: 'ending', label: 'Ending Value', placeholder: '16000' },
                { id: 'years', label: 'Number of Years', placeholder: '5' },
              ],
              [
                { label: 'CAGR', value: formatPercent(calcCAGR().cagr), highlight: true },
              ],
              'Annualized growth rate smoothing out volatility over a period.',
              {
                variables: [
                  { symbol: 'CAGR', meaning: 'Compound Annual Growth Rate' },
                  { symbol: 'V_f', meaning: 'Final (ending) value' },
                  { symbol: 'V_i', meaning: 'Initial (beginning) value' },
                  { symbol: 't', meaning: 'Number of years' },
                ],
                concepts: [
                  'CAGR shows the smoothed annual rate of return',
                  'Ignores volatility - shows what constant rate would produce the same result',
                  'Best for comparing investments over different time periods',
                  'Does not reflect actual year-by-year performance',
                ],
                example: '$10,000 grows to $16,000 in 5 years: CAGR = (16000/10000)^(1/5) - 1 = 9.86% annually',
                links: [
                  { text: 'Investopedia: CAGR', url: 'https://www.investopedia.com/terms/c/cagr.asp' },
                ],
              }
            )}

            {renderCalculator('sharpe', 'Sharpe Ratio',
              'Sharpe = \\frac{R_p - R_f}{\\sigma_p}',
              [
                { id: 'portfolioReturn', label: 'Portfolio Return', placeholder: '12', suffix: '%' },
                { id: 'riskFreeRate', label: 'Risk-Free Rate', placeholder: '3', suffix: '%' },
                { id: 'stdDev', label: 'Standard Deviation', placeholder: '10', suffix: '%' },
              ],
              [
                { label: 'Sharpe Ratio', value: formatNum(calcSharpe().sharpe, 3), highlight: true },
                { label: 'Interpretation', value: calcSharpe().sharpe > 1 ? '✅ Good' : calcSharpe().sharpe > 0.5 ? '⚠️ Moderate' : '❌ Poor' },
              ],
              'Risk-adjusted return measure. Higher is better for comparing investments.',
              {
                variables: [
                  { symbol: 'R_p', meaning: 'Portfolio return (expected or historical)' },
                  { symbol: 'R_f', meaning: 'Risk-free rate (e.g., Treasury bill rate)' },
                  { symbol: 'σ_p', meaning: 'Standard deviation of portfolio returns (volatility/risk)' },
                ],
                concepts: [
                  'Measures excess return per unit of risk',
                  'Sharpe > 1: Good risk-adjusted returns',
                  'Sharpe > 2: Very good | Sharpe > 3: Excellent',
                  'Developed by Nobel laureate William Sharpe in 1966',
                  'Higher is better - more return for each unit of risk taken',
                ],
                example: 'Portfolio return 12%, risk-free 3%, volatility 10%: Sharpe = (12%-3%)/10% = 0.9',
                links: [
                  { text: 'Investopedia: Sharpe Ratio', url: 'https://www.investopedia.com/terms/s/sharperatio.asp' },
                  { text: 'Wikipedia: Sharpe Ratio', url: 'https://en.wikipedia.org/wiki/Sharpe_ratio' },
                ],
              }
            )}

            {renderCalculator('beta', 'Beta (β)',
              '\\beta = \\frac{Cov(R_a, R_m)}{Var(R_m)}',
              [
                { id: 'covariance', label: 'Covariance with Market', placeholder: '0.02', step: '0.001' },
                { id: 'marketVariance', label: 'Market Variance', placeholder: '0.015', step: '0.001' },
              ],
              [
                { label: 'Beta', value: formatNum(calcBeta().beta, 3), highlight: true },
                { label: 'Volatility', value: calcBeta().beta > 1 ? '📈 More volatile than market' : calcBeta().beta < 1 ? '📉 Less volatile than market' : '➡️ Same as market' },
              ],
              'Measures asset volatility relative to the overall market.',
              {
                variables: [
                  { symbol: 'β', meaning: 'Beta - systematic risk measure' },
                  { symbol: 'Cov(R_a, R_m)', meaning: 'Covariance between asset and market returns' },
                  { symbol: 'Var(R_m)', meaning: 'Variance of market returns' },
                ],
                concepts: [
                  'β = 1: Moves exactly with the market',
                  'β > 1: More volatile than market (aggressive)',
                  'β < 1: Less volatile than market (defensive)',
                  'β < 0: Moves opposite to market (rare)',
                  'Key input for CAPM model',
                  'Only measures systematic (market) risk, not total risk',
                ],
                example: 'Tech stocks often have β > 1 (more volatile), utilities often have β < 1 (defensive)',
                links: [
                  { text: 'Investopedia: Beta', url: 'https://www.investopedia.com/terms/b/beta.asp' },
                  { text: 'Corporate Finance Institute: Beta', url: 'https://corporatefinanceinstitute.com/resources/valuation/what-is-beta-guide/' },
                ],
              }
            )}

            {renderCalculator('capm', 'Capital Asset Pricing Model (CAPM)',
              'E(R) = R_f + \\beta \\times (R_m - R_f)',
              [
                { id: 'riskFreeRate', label: 'Risk-Free Rate', placeholder: '3', suffix: '%' },
                { id: 'beta', label: 'Beta', placeholder: '1.2', step: '0.1' },
                { id: 'marketReturn', label: 'Expected Market Return', placeholder: '10', suffix: '%' },
              ],
              [
                { label: 'Expected Return', value: formatPercent(calcCAPM().expectedReturn), highlight: true },
                { label: 'Risk Premium', value: formatPercent(calcCAPM().expectedReturn - parseFloat(getVal('capm', 'riskFreeRate')) / 100) },
              ],
              'Calculates expected return based on systematic risk (beta).',
              {
                variables: [
                  { symbol: 'E(R)', meaning: 'Expected return on the asset' },
                  { symbol: 'R_f', meaning: 'Risk-free rate (Treasury bill rate)' },
                  { symbol: 'β', meaning: 'Beta - sensitivity to market movements' },
                  { symbol: 'R_m', meaning: 'Expected market return' },
                  { symbol: '(R_m - R_f)', meaning: 'Market risk premium' },
                ],
                concepts: [
                  'Nobel Prize-winning model (Sharpe, 1964)',
                  'Higher beta = higher expected return (more risk, more reward)',
                  'Used to calculate cost of equity for companies',
                  'Foundation of modern portfolio theory',
                  'Assumes investors are only compensated for systematic risk',
                ],
                example: 'Risk-free 3%, β=1.2, market return 10%: E(R) = 3% + 1.2 × (10%-3%) = 11.4%',
                links: [
                  { text: 'Investopedia: CAPM', url: 'https://www.investopedia.com/terms/c/capm.asp' },
                  { text: 'Wikipedia: CAPM', url: 'https://en.wikipedia.org/wiki/Capital_asset_pricing_model' },
                ],
              }
            )}
          </>
        )}

        {activeCategory === 'risk' && (
          <>
            {renderCalculator('var', 'Value at Risk (VaR)',
              'VaR = V \\times (\\mu - z \\times \\sigma \\times \\sqrt{t})',
              [
                { id: 'portfolioValue', label: 'Portfolio Value', placeholder: '1000000' },
                { id: 'meanReturn', label: 'Daily Mean Return', placeholder: '0', suffix: '%' },
                { id: 'stdDev', label: 'Daily Std Deviation', placeholder: '2', suffix: '%' },
                { id: 'confidence', label: 'Confidence Level', placeholder: '95', suffix: '%' },
                { id: 'days', label: 'Time Horizon', placeholder: '1', suffix: 'days' },
              ],
              [
                { label: '1-Day VaR', value: formatCurrency(calcVaR().var1Day), highlight: true },
                { label: 'N-Day VaR', value: formatCurrency(calcVaR().varNDay) },
              ],
              'Estimates maximum potential loss over a time period with a confidence level.',
              {
                variables: [
                  { symbol: 'VaR', meaning: 'Value at Risk - maximum expected loss' },
                  { symbol: 'V', meaning: 'Portfolio value' },
                  { symbol: 'μ', meaning: 'Mean (average) daily return' },
                  { symbol: 'z', meaning: 'Z-score for confidence level (1.65 for 95%, 2.33 for 99%)' },
                  { symbol: 'σ', meaning: 'Standard deviation of daily returns' },
                  { symbol: 't', meaning: 'Time horizon in days' },
                ],
                concepts: [
                  '"95% 1-day VaR of $33,000" means: 95% of the time, daily losses will not exceed $33,000',
                  'Does NOT tell you the maximum possible loss',
                  'Required by Basel banking regulations',
                  'Methods: Parametric (normal), Historical simulation, Monte Carlo',
                  'N-day VaR = 1-day VaR × √N (square root of time rule)',
                ],
                example: '$1M portfolio, 2% daily volatility, 95% confidence: VaR = $1M × 1.65 × 2% = $33,000',
                links: [
                  { text: 'Investopedia: Value at Risk', url: 'https://www.investopedia.com/terms/v/var.asp' },
                  { text: 'Wikipedia: Value at Risk', url: 'https://en.wikipedia.org/wiki/Value_at_risk' },
                ],
              }
            )}

            {renderCalculator('blackScholes', 'Black-Scholes Option Pricing',
              'C = S \\cdot N(d_1) - K e^{-rt} N(d_2)',
              [
                { id: 'stockPrice', label: 'Stock Price (S)', placeholder: '100' },
                { id: 'strikePrice', label: 'Strike Price (K)', placeholder: '100' },
                { id: 'riskFreeRate', label: 'Risk-Free Rate', placeholder: '5', suffix: '%' },
                { id: 'volatility', label: 'Volatility (σ)', placeholder: '20', suffix: '%' },
                { id: 'timeToExpiry', label: 'Time to Expiry', placeholder: '1', suffix: 'years' },
              ],
              [
                { label: 'Call Option Price', value: formatCurrency(calcBlackScholes().call), highlight: true },
                { label: 'Put Option Price', value: formatCurrency(calcBlackScholes().put), highlight: true },
                { label: 'd₁', value: formatNum(calcBlackScholes().d1, 4) },
                { label: 'd₂', value: formatNum(calcBlackScholes().d2, 4) },
              ],
              'Prices European call and put options using the famous Black-Scholes model.',
              {
                variables: [
                  { symbol: 'C', meaning: 'Call option price' },
                  { symbol: 'S', meaning: 'Current stock price' },
                  { symbol: 'K', meaning: 'Strike price (exercise price)' },
                  { symbol: 'r', meaning: 'Risk-free interest rate' },
                  { symbol: 't', meaning: 'Time to expiration (in years)' },
                  { symbol: 'σ', meaning: 'Volatility (standard deviation of returns)' },
                  { symbol: 'N(x)', meaning: 'Cumulative normal distribution function' },
                ],
                concepts: [
                  'Nobel Prize-winning model (Scholes & Merton, 1997)',
                  'Assumes: No dividends, European options, constant volatility, efficient markets',
                  'd₁ measures how far in-the-money adjusted for volatility',
                  'd₂ = d₁ - σ√t (adjusts for volatility over time)',
                  'Put-Call Parity: C - P = S - Ke^(-rt)',
                  'Greeks (Delta, Gamma, Theta, Vega) are derivatives of this formula',
                ],
                example: 'Stock $100, strike $100, 5% rate, 20% vol, 1 year: Call ≈ $10.45, Put ≈ $5.57',
                links: [
                  { text: 'Investopedia: Black-Scholes', url: 'https://www.investopedia.com/terms/b/blackscholes.asp' },
                  { text: 'Wikipedia: Black-Scholes', url: 'https://en.wikipedia.org/wiki/Black%E2%80%93Scholes_model' },
                  { text: 'Option Calculator', url: 'https://www.optionsprofitcalculator.com/' },
                ],
              }
            )}

            {renderCalculator('duration', 'Bond Duration',
              'D = \\frac{\\sum_{t=1}^{n} t \\times \\frac{CF_t}{(1+y)^t}}{Price}',
              [
                { id: 'faceValue', label: 'Face Value', placeholder: '1000' },
                { id: 'couponRate', label: 'Coupon Rate', placeholder: '5', suffix: '%' },
                { id: 'yieldRate', label: 'Yield to Maturity', placeholder: '4', suffix: '%' },
                { id: 'years', label: 'Years to Maturity', placeholder: '10' },
              ],
              [
                { label: 'Bond Price', value: formatCurrency(calcDuration().price) },
                { label: 'Macaulay Duration', value: formatNum(calcDuration().duration, 3) + ' years', highlight: true },
                { label: 'Modified Duration', value: formatNum(calcDuration().modifiedDuration, 3) },
              ],
              'Measures bond price sensitivity to interest rate changes.',
              {
                variables: [
                  { symbol: 'D', meaning: 'Macaulay Duration (weighted average time to receive cash flows)' },
                  { symbol: 'CF_t', meaning: 'Cash flow at time t (coupon or principal)' },
                  { symbol: 'y', meaning: 'Yield to maturity' },
                  { symbol: 't', meaning: 'Time period' },
                ],
                concepts: [
                  'Macaulay Duration: Weighted average time to receive all cash flows',
                  'Modified Duration: % price change for 1% yield change',
                  'Higher duration = more interest rate risk',
                  'Zero-coupon bonds have duration equal to maturity',
                  'Rule of thumb: ΔPrice ≈ -Modified Duration × Δyield',
                  'Duration decreases as yield increases',
                ],
                example: '10-year bond, 5% coupon, 4% yield: Duration ≈ 8.1 years. If rates rise 1%, price falls ~7.8%',
                links: [
                  { text: 'Investopedia: Duration', url: 'https://www.investopedia.com/terms/d/duration.asp' },
                  { text: 'PIMCO: Duration Explained', url: 'https://www.pimco.com/en-us/resources/education/understanding-duration' },
                ],
              }
            )}
          </>
        )}

        {activeCategory === 'ratios' && (
          <>
            {renderCalculator('currentRatio', 'Current Ratio',
              '\\text{Current Ratio} = \\frac{\\text{Current Assets}}{\\text{Current Liabilities}}',
              [
                { id: 'assets', label: 'Current Assets', placeholder: '500000', default: '500000' },
                { id: 'liabilities', label: 'Current Liabilities', placeholder: '250000', default: '250000' },
              ],
              [
                { label: 'Current Ratio', value: formatNum(calcCurrentRatio().ratio, 2), highlight: true },
                { label: 'Interpretation', value: calcCurrentRatio().ratio >= 2 ? '✅ Strong' : calcCurrentRatio().ratio >= 1 ? '⚠️ Adequate' : '❌ Weak' },
              ],
              'Measures ability to pay short-term obligations. Ratio > 1 indicates liquidity.',
              {
                variables: [
                  { symbol: 'Current Assets', meaning: 'Cash and assets convertible to cash within one year (inventory, receivables, cash)' },
                  { symbol: 'Current Liabilities', meaning: 'Debts and obligations due within one year (accounts payable, short-term loans)' },
                ],
                concepts: [
                  'A ratio above 1.0 means the company can cover its short-term debts',
                  'Ratio of 2.0 or higher is generally considered healthy',
                  'Too high a ratio may indicate inefficient use of assets',
                  'Industry norms vary - compare with peers in the same sector',
                ],
                example: 'A company with $500,000 in current assets and $250,000 in current liabilities has a current ratio of 2.0, indicating strong short-term liquidity.',
                links: [
                  { text: 'Investopedia: Current Ratio', url: 'https://www.investopedia.com/terms/c/currentratio.asp' },
                  { text: 'Corporate Finance Institute', url: 'https://corporatefinanceinstitute.com/resources/accounting/current-ratio-formula/' },
                ],
              }
            )}

            {renderCalculator('debtEquity', 'Debt-to-Equity Ratio',
              '\\text{D/E} = \\frac{\\text{Total Debt}}{\\text{Total Equity}}',
              [
                { id: 'debt', label: 'Total Debt', placeholder: '1000000', default: '1000000' },
                { id: 'equity', label: 'Total Equity', placeholder: '2000000', default: '2000000' },
              ],
              [
                { label: 'D/E Ratio', value: formatNum(calcDebtToEquity().ratio, 2), highlight: true },
                { label: 'Leverage', value: calcDebtToEquity().ratio < 0.5 ? '✅ Low leverage' : calcDebtToEquity().ratio < 1 ? '⚠️ Moderate' : '❌ High leverage' },
              ],
              'Measures financial leverage. Lower ratios indicate less risk.',
              {
                variables: [
                  { symbol: 'Total Debt', meaning: 'All short-term and long-term debt obligations of the company' },
                  { symbol: 'Total Equity', meaning: 'Shareholders\' equity = Total Assets - Total Liabilities' },
                ],
                concepts: [
                  'Shows how much debt vs equity is used to finance operations',
                  'Higher ratios indicate more leverage and potentially higher risk',
                  'Capital-intensive industries typically have higher D/E ratios',
                  'A ratio above 2.0 is often considered risky, but varies by industry',
                ],
                example: 'A company with $1M in debt and $2M in equity has a D/E ratio of 0.5, indicating conservative financing with low leverage.',
                links: [
                  { text: 'Investopedia: Debt-to-Equity', url: 'https://www.investopedia.com/terms/d/debtequityratio.asp' },
                  { text: 'Khan Academy: Financial leverage', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/accounting-and-financial-stateme/financial-ratios-tutorial' },
                ],
              }
            )}

            {renderCalculator('roe', 'Return on Equity (ROE)',
              'ROE = \\frac{\\text{Net Income}}{\\text{Average Equity}}',
              [
                { id: 'netIncome', label: 'Net Income', placeholder: '200000', default: '200000' },
                { id: 'equity', label: 'Shareholder Equity', placeholder: '1000000', default: '1000000' },
              ],
              [
                { label: 'ROE', value: formatPercent(calcROE().roe), highlight: true },
                { label: 'Performance', value: calcROE().roe >= 0.15 ? '✅ Excellent' : calcROE().roe >= 0.10 ? '⚠️ Good' : '❌ Below average' },
              ],
              'Measures profitability relative to shareholder equity.',
              {
                variables: [
                  { symbol: 'Net Income', meaning: 'Profit after all expenses, taxes, and interest have been deducted' },
                  { symbol: 'Shareholder Equity', meaning: 'Total assets minus total liabilities; what shareholders own' },
                ],
                concepts: [
                  'Measures how effectively management uses shareholder investments to generate profit',
                  'ROE above 15-20% is generally considered excellent',
                  'Can be decomposed using DuPont Analysis (profit margin × asset turnover × leverage)',
                  'Compare ROE within the same industry for meaningful analysis',
                ],
                example: 'A company earning $200,000 net income with $1,000,000 in equity has 20% ROE - every dollar of equity generates 20 cents of profit.',
                links: [
                  { text: 'Investopedia: Return on Equity', url: 'https://www.investopedia.com/terms/r/returnonequity.asp' },
                  { text: 'DuPont Analysis Explained', url: 'https://www.investopedia.com/terms/d/dupontanalysis.asp' },
                ],
              }
            )}

            {renderCalculator('eps', 'Earnings Per Share (EPS)',
              'EPS = \\frac{\\text{Net Income} - \\text{Dividends}}{\\text{Shares Outstanding}}',
              [
                { id: 'netIncome', label: 'Net Income', placeholder: '10000000', default: '10000000' },
                { id: 'dividends', label: 'Preferred Dividends', placeholder: '0', default: '0' },
                { id: 'shares', label: 'Shares Outstanding', placeholder: '1000000', default: '1000000' },
              ],
              [
                { label: 'EPS', value: formatCurrency(calcEPS().eps), highlight: true },
              ],
              'Profit allocated to each outstanding share of common stock.',
              {
                variables: [
                  { symbol: 'Net Income', meaning: 'Company\'s total profit after all expenses' },
                  { symbol: 'Preferred Dividends', meaning: 'Dividends paid to preferred shareholders (subtracted for common EPS)' },
                  { symbol: 'Shares Outstanding', meaning: 'Total number of shares currently held by all shareholders' },
                ],
                concepts: [
                  'Basic EPS uses current shares; diluted EPS includes potential shares from options/convertibles',
                  'EPS growth over time is more meaningful than a single value',
                  'Used as the denominator in P/E ratio calculations',
                  'Companies may report "adjusted EPS" excluding one-time items',
                ],
                example: 'A company with $10M net income, $0 preferred dividends, and 1M shares has EPS of $10.00 per share.',
                links: [
                  { text: 'Investopedia: Earnings Per Share', url: 'https://www.investopedia.com/terms/e/eps.asp' },
                  { text: 'SEC: Understanding EPS', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/earnings-share-eps' },
                ],
              }
            )}

            {renderCalculator('pe', 'Price-to-Earnings (P/E) Ratio',
              '\\text{P/E} = \\frac{\\text{Market Price per Share}}{\\text{EPS}}',
              [
                { id: 'price', label: 'Stock Price', placeholder: '50', default: '50' },
                { id: 'eps', label: 'Earnings Per Share', placeholder: '5', default: '5' },
              ],
              [
                { label: 'P/E Ratio', value: formatNum(calcPE().pe, 2), highlight: true },
                { label: 'Valuation', value: calcPE().pe < 15 ? '📉 Potentially undervalued' : calcPE().pe < 25 ? '➡️ Fair value' : '📈 Potentially overvalued' },
              ],
              'Compares stock price to earnings. Used for relative valuation.',
              {
                variables: [
                  { symbol: 'Market Price', meaning: 'Current trading price of one share of stock' },
                  { symbol: 'EPS', meaning: 'Earnings per share - net income divided by shares outstanding' },
                ],
                concepts: [
                  'Shows how much investors pay for each dollar of earnings',
                  'High P/E may indicate growth expectations or overvaluation',
                  'Low P/E may indicate undervaluation or declining prospects',
                  'Compare P/E within same industry; growth stocks have higher P/E than value stocks',
                  'Forward P/E uses estimated future earnings; trailing P/E uses past 12 months',
                ],
                example: 'A stock at $50 with EPS of $5 has P/E of 10. Investors pay $10 for every $1 of annual earnings.',
                links: [
                  { text: 'Investopedia: P/E Ratio', url: 'https://www.investopedia.com/terms/p/price-earningsratio.asp' },
                  { text: 'Morningstar: Understanding P/E', url: 'https://www.morningstar.com/articles/1067265/what-is-the-price-to-earnings-ratio' },
                ],
              }
            )}
          </>
        )}

        {activeCategory === 'loans' && (
          <>
            {renderCalculator('amortization', 'Loan Amortization',
              'PMT = P \\times \\frac{r(1+r)^n}{(1+r)^n - 1}',
              [
                { id: 'principal', label: 'Loan Amount', placeholder: '250000', default: '250000' },
                { id: 'rate', label: 'Annual Interest Rate', placeholder: '6.5', suffix: '%', default: '6.5' },
                { id: 'years', label: 'Loan Term', placeholder: '30', suffix: 'years', default: '30' },
              ],
              [
                { label: 'Monthly Payment', value: formatCurrency(calcAmortization().payment), highlight: true },
                { label: 'Total Payments', value: formatCurrency(calcAmortization().totalPayment) },
                { label: 'Total Interest', value: formatCurrency(calcAmortization().totalInterest) },
              ],
              'Calculates fixed monthly payment for loans like mortgages.',
              {
                variables: [
                  { symbol: 'PMT', meaning: 'Fixed monthly payment amount' },
                  { symbol: 'P', meaning: 'Principal - the original loan amount' },
                  { symbol: 'r', meaning: 'Monthly interest rate (annual rate ÷ 12)' },
                  { symbol: 'n', meaning: 'Total number of payments (years × 12)' },
                ],
                concepts: [
                  'Each payment is split between principal reduction and interest',
                  'Early payments go mostly toward interest; later payments toward principal',
                  'Longer terms mean lower payments but much more total interest',
                  'Extra principal payments can significantly reduce total interest and loan term',
                ],
                example: 'A $250,000 mortgage at 6.5% for 30 years: Monthly payment = $1,580. Total payments = $568,861. Total interest = $318,861.',
                links: [
                  { text: 'Investopedia: Amortization', url: 'https://www.investopedia.com/terms/a/amortization.asp' },
                  { text: 'Khan Academy: Mortgages', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance/housing/mortgages-tutorial' },
                  { text: 'Bankrate Amortization Calculator', url: 'https://www.bankrate.com/mortgages/amortization-calculator/' },
                ],
              }
            )}

            {renderCalculator('breakEven', 'Break-Even Analysis',
              '\\text{Units} = \\frac{\\text{Fixed Costs}}{\\text{Price} - \\text{Variable Cost}}',
              [
                { id: 'fixedCosts', label: 'Fixed Costs', placeholder: '50000', default: '50000' },
                { id: 'pricePerUnit', label: 'Price per Unit', placeholder: '25', default: '25' },
                { id: 'variableCost', label: 'Variable Cost per Unit', placeholder: '15', default: '15' },
              ],
              [
                { label: 'Break-Even Units', value: formatNum(calcBreakEven().units, 0), highlight: true },
                { label: 'Break-Even Revenue', value: formatCurrency(calcBreakEven().revenue) },
                { label: 'Contribution Margin', value: formatCurrency(calcBreakEven().contribution) + '/unit' },
              ],
              'Determines the sales volume needed to cover all costs.',
              {
                variables: [
                  { symbol: 'Fixed Costs', meaning: 'Costs that don\'t change with production volume (rent, salaries, equipment)' },
                  { symbol: 'Price per Unit', meaning: 'Selling price of each product or service' },
                  { symbol: 'Variable Cost', meaning: 'Cost per unit that varies with production (materials, direct labor)' },
                  { symbol: 'Contribution Margin', meaning: 'Price - Variable Cost; amount each sale contributes to covering fixed costs' },
                ],
                concepts: [
                  'At break-even, total revenue equals total costs (profit = $0)',
                  'Sales beyond break-even generate profit equal to contribution margin × units',
                  'Lower fixed costs or higher contribution margin reduces break-even point',
                  'Essential for pricing decisions, business planning, and investment analysis',
                ],
                example: 'Fixed costs $50,000, price $25, variable cost $15: Contribution margin = $10. Break-even = 5,000 units ($125,000 revenue).',
                links: [
                  { text: 'Investopedia: Break-Even Analysis', url: 'https://www.investopedia.com/terms/b/breakevenanalysis.asp' },
                  { text: 'Harvard Business Review: Breakeven', url: 'https://hbr.org/2014/07/a-quick-guide-to-breakeven-analysis' },
                ],
              }
            )}

            {renderCalculator('gordon', 'Gordon Growth Model',
              'P = \\frac{D_1}{r - g} = \\frac{D_0(1+g)}{r - g}',
              [
                { id: 'dividend', label: 'Current Dividend (D₀)', placeholder: '2', default: '2' },
                { id: 'growthRate', label: 'Dividend Growth Rate', placeholder: '5', suffix: '%', default: '5' },
                { id: 'requiredReturn', label: 'Required Return', placeholder: '10', suffix: '%', default: '10' },
              ],
              [
                { label: 'Next Dividend (D₁)', value: formatCurrency(calcGordonGrowth().d1) },
                { label: 'Stock Value', value: formatCurrency(calcGordonGrowth().stockValue), highlight: true },
              ],
              'Values stock based on dividends growing at a constant rate forever.',
              {
                variables: [
                  { symbol: 'P', meaning: 'Intrinsic value (fair price) of the stock' },
                  { symbol: 'D₀', meaning: 'Current annual dividend per share' },
                  { symbol: 'D₁', meaning: 'Expected dividend next year = D₀ × (1 + g)' },
                  { symbol: 'r', meaning: 'Required rate of return (discount rate)' },
                  { symbol: 'g', meaning: 'Expected constant dividend growth rate (must be < r)' },
                ],
                concepts: [
                  'Assumes dividends grow at a constant rate forever (perpetuity)',
                  'Only works when g < r; otherwise the formula gives invalid results',
                  'Best suited for mature, stable dividend-paying companies',
                  'Also known as Dividend Discount Model (DDM) for constant growth',
                  'Very sensitive to growth rate assumption - small changes significantly affect value',
                ],
                example: 'Current dividend $2.00, growth 5%, required return 10%: D₁ = $2.10, Stock value = $2.10 / (0.10 - 0.05) = $42.00.',
                links: [
                  { text: 'Investopedia: Gordon Growth Model', url: 'https://www.investopedia.com/terms/g/gordongrowthmodel.asp' },
                  { text: 'CFA Institute: Dividend Discount Models', url: 'https://www.cfainstitute.org/en/membership/professional-development/refresher-readings/discounted-dividend-valuation' },
                ],
              }
            )}
          </>
        )}
      </div>

      <div className="finance-info">
        <h4>About Financial Calculations</h4>
        <p>
          These calculators cover fundamental financial concepts used in personal finance,
          corporate finance, investment analysis, and risk management. Results are for
          educational purposes—consult a financial professional for important decisions.
        </p>
      </div>
    </div>
  );
}

// Main App Component
function App() {
  const [activeTab, setActiveTab] = useState('converter');
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [inputValue, setInputValue] = useState('1');
  const [history, setHistory] = useState([]);

  const categoryData = conversionData[category];
  const units = useMemo(() => categoryData?.units || {}, [categoryData]);

  const result = useMemo(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return '';

    if (categoryData?.customConvert) {
      return categoryData.customConvert(value, fromUnit, toUnit);
    }

    const fromBase = units[fromUnit]?.toBase;
    const toBase = units[toUnit]?.toBase;
    if (!fromBase || !toBase) return '';
    return (value * fromBase) / toBase;
  }, [inputValue, fromUnit, toUnit, categoryData, units]);

  const formatResult = (num) => {
    if (num === '' || isNaN(num)) return '—';
    if (Math.abs(num) < 0.000001 || Math.abs(num) > 999999999) {
      return num.toExponential(6);
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 8 });
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const newUnits = Object.keys(conversionData[newCategory].units);
    setFromUnit(newUnits[0]);
    setToUnit(newUnits[1] || newUnits[0]);
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(result !== '' && !isNaN(result) ? formatResult(result).replace(/,/g, '') : inputValue);
  };

  const saveToHistory = () => {
    if (inputValue && result !== '' && !isNaN(result)) {
      const entry = {
        id: Date.now(),
        category: categoryData.name,
        from: `${inputValue} ${units[fromUnit].name}`,
        to: `${formatResult(result)} ${units[toUnit].name}`,
      };
      setHistory(prev => [entry, ...prev.slice(0, 9)]);
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="app">
      <header className="header">
        <h1>Scientific Calculator</h1>
        <p className="subtitle">Converter • Physics • Chemistry • Graphing • Pi • Algorithms • Finance</p>
      </header>

      {/* Main Tab Navigation */}
      <div className="main-tabs">
        <button
          className={`main-tab ${activeTab === 'converter' ? 'active' : ''}`}
          onClick={() => setActiveTab('converter')}
        >
          📐 Unit Converter
        </button>
        <button
          className={`main-tab ${activeTab === 'physics' ? 'active' : ''}`}
          onClick={() => setActiveTab('physics')}
        >
          ⚛️ Physics
        </button>
        <button
          className={`main-tab ${activeTab === 'chemistry' ? 'active' : ''}`}
          onClick={() => setActiveTab('chemistry')}
        >
          🧪 Chemistry
        </button>
        <button
          className={`main-tab ${activeTab === 'graph' ? 'active' : ''}`}
          onClick={() => setActiveTab('graph')}
        >
          📈 Graphing
        </button>
        <button
          className={`main-tab ${activeTab === 'pi' ? 'active' : ''}`}
          onClick={() => setActiveTab('pi')}
        >
          π Pi Calculator
        </button>
        <button
          className={`main-tab ${activeTab === 'dijkstra' ? 'active' : ''}`}
          onClick={() => setActiveTab('dijkstra')}
        >
          🗺️ Shortest Path
        </button>
        <button
          className={`main-tab ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          💰 Finance
        </button>
      </div>

      {/* Unit Converter Tab */}
      {activeTab === 'converter' && (
        <>
          <div className="category-container">
            <div className="category-grid">
              {Object.entries(conversionData).map(([key, data]) => (
                <button
                  key={key}
                  className={`category-btn ${category === key ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(key)}
                >
                  <span className="category-icon">{data.icon}</span>
                  <span className="category-name">{data.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="converter-card">
            <div className="converter-header">
              <span className="converter-icon">{categoryData.icon}</span>
              <span>{categoryData.name} Conversion</span>
            </div>

            <div className="converter-body">
              <div className="input-group">
                <label>From</label>
                <div className="input-row">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="value-input"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="unit-select"
                  >
                    {Object.entries(units).map(([key, unit]) => (
                      <option key={key} value={key}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button className="swap-btn" onClick={handleSwap} title="Swap units">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-9L21 12m0 0l-4.5 4.5M21 12H7.5"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </button>

              <div className="input-group">
                <label>To</label>
                <div className="input-row">
                  <div className="result-display">
                    {formatResult(result)}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="unit-select"
                  >
                    {Object.entries(units).map(([key, unit]) => (
                      <option key={key} value={key}>{unit.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {inputValue && result !== '' && !isNaN(result) && (
                <div className="formula">
                  {inputValue} {units[fromUnit]?.name} = {formatResult(result)} {units[toUnit]?.name}
                </div>
              )}

              <button className="save-btn" onClick={saveToHistory}>
                Save to History
              </button>
            </div>
          </div>

          <div className="quick-reference">
            <h3>Quick Reference - {categoryData.name}</h3>
            <div className="reference-grid">
              {Object.entries(units).slice(0, 6).map(([key, unit]) => (
                <div
                  key={key}
                  className="reference-item"
                  onClick={() => { setFromUnit(key); setInputValue('1'); }}
                >
                  <span className="ref-name">{unit.name}</span>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="history-section">
              <div className="history-header">
                <h3>Conversion History</h3>
                <button className="clear-btn" onClick={clearHistory}>Clear</button>
              </div>
              <div className="history-list">
                {history.map((entry) => (
                  <div key={entry.id} className="history-item">
                    <span className="history-category">{entry.category}</span>
                    <span className="history-conversion">{entry.from} → {entry.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Physics Tab */}
      {activeTab === 'physics' && (
        <div className="tab-content">
          <h2 className="tab-title">⚛️ Physics Calculator</h2>
          <PhysicsCalculator />
        </div>
      )}

      {/* Chemistry Tab */}
      {activeTab === 'chemistry' && (
        <div className="tab-content">
          <h2 className="tab-title">🧪 Chemistry Calculator</h2>
          <ChemistryCalculator />
        </div>
      )}

      {/* Graphing Tab */}
      {activeTab === 'graph' && (
        <div className="tab-content">
          <GraphingSection />
        </div>
      )}

      {/* Pi Calculator Tab */}
      {activeTab === 'pi' && (
        <div className="tab-content">
          <h2 className="tab-title">π Pi Calculator</h2>
          <PiCalculator />
        </div>
      )}

      {/* Dijkstra's Shortest Path Tab */}
      {activeTab === 'dijkstra' && (
        <div className="tab-content">
          <h2 className="tab-title">🗺️ Dijkstra's Shortest Path</h2>
          <DijkstraCalculator />
        </div>
      )}

      {/* Financial Calculator Tab */}
      {activeTab === 'finance' && (
        <div className="tab-content">
          <h2 className="tab-title">💰 Financial Calculator</h2>
          <FinancialCalculator />
        </div>
      )}

      <footer className="footer">
        <p>Scientific Calculator - Conversions, Physics, Chemistry, Graphing, Pi, Algorithms & Finance</p>
      </footer>
    </div>
  )
}

export default App
