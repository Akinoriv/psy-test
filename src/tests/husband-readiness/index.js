// src/tests/husband-readiness/index.js - Главный файл теста

import config from './config.js'
import Calculator from './calculator.js'
import Interpreter from './interpreter.js'

const calculator = new Calculator()
const interpreter = new Interpreter()

export default {
  config,
  calculator,
  interpreter,
}
