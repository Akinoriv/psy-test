// src/tests/stress-burnout/index.js
import config from './config.js'
import StressCalculator from './calculator.js'
import StressInterpreter from './interpreter.js'

export default {
  config,
  calculator: new StressCalculator(),
  interpreter: new StressInterpreter()
}