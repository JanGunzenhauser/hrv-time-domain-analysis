import EventEmitter from 'events'
export default class HRVAnalysis extends EventEmitter {
  constructor(props) {
    super()
    this.config = {
      windowSize: 40,
      rrTimeFormat: 's',
      rmssdLog: true,
      rmssdFactor: 20
    }
    if (props) {
      this.config = {
        windowSize: props.windowSize || this.config.windowSize,
        rrTimeFormat: props.rrTimeFormat || this.config.rrTimeFormat,
        rmssdFactor: props.rmssdFactor || this.config.rmssdFactor,
        rmssdLog: props.rmssdLog || this.config.rmssdLog
      }
    }
    this.reset()
  }

  reset() {
    this.rrList = []
    this.timeElapsed = 0
  }

  // returns root mean square of successive rr interval differences
  rmssd() {
    let factor = 1 
    if (this.config.rrTimeFormat === 's') factor = 1000
    let rmssdTotal = 0
    this.rrList.map((interval, index) => {
      if (index !== this.rrList.length - 1) rmssdTotal += Math.abs(interval * factor - this.rrList[index + 1] * factor)
    })
    let rmssd = Math.sqrt(rmssdTotal/this.rrList.length)
    if (this.config.rmssdLog) rmssd = Math.log(rmssd)
    return rmssd * this.config.rmssdFactor
  }

  // returns percentage of successive intervals that differ more than 50ms
  pnn50() {
    let factor = 1 
    if (this.config.rrTimeFormat === 's') factor = 1000
    let nnLargerThan50 = 0
    this.rrList.map((interval, index) => {
      if (index !== this.rrList.length - 1 && Math.abs(interval - this.rrList[index + 1]) > 50 * (1/factor)) nnLargerThan50++
    })
    return nnLargerThan50 / this.rrList.length * 100
  }

  // returns standard deviation of rr intervals
  sdnn() {
    let rrTotal = 0
    this.rrList.map((interval, index) => {
      rrTotal += interval
    })
    const meanRR = rrTotal / this.rrList.length
    let sdnnTotal = 0
    this.rrList.map((interval, index) => {
      sdnnTotal += Math.pow(interval - meanRR, 2)
    })
    return Math.sqrt(sdnnTotal / this.rrList.length)
  }

  addRRs(rrs) {
    this.timeElapsed++
    let previousRRSum = this.rrList.reduce((previous, current) => previous + current, 0)

    rrs.map(rr => {
      if (previousRRSum + rr >= this.config.windowSize) {
        for (var i = 0; i < 2; i++) {
          if (previousRRSum - this.rrList[i] > this.config.windowSize) {
            previousRRSum -= this.rrList[i]
            this.rrList.splice(i, 1)
          }
        }
      }
      this.rrList.push(rr)
    })

    if (this.timeElapsed > this.config.windowSize) {
      this.emit('data', {
        rmssd: this.rmssd(),
        sdnn: this.sdnn(),
        pnn50: this.pnn50()
      })
    }
  }
}