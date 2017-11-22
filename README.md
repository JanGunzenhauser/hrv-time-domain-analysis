hrv-time-domain-analysis
=
**Computes time domain metrics of heart rate variability based on a series of RR intervals.**

Currently supported metrics:
- RMSSD (root mean square of successive interval differences)
- SDNN (standard deviation of successive rr intervals) 
- PNN50 (percentage of successive interval differences larger than 50ms) 

Scientific accuracy is not guaranteed.

-------

### **How to use**: 

Create a new instance and configure it using the available options. 
```
// import
var HRVAnalysis = require('hrv-time-domain-analysis');

// create and configure HRV Analysis instance (default values below)
var hrv = new HRVAnalysis({
  windowSize: 40, // size of moving analysis timeframe in seconds
  rrTimeFormat: 's', // time format of rr intervals: 's' (seconds) or 'ms' (milliseconds)
  rmssdLog: true, // apply natural logarithm to rmssd 
  rmssdFactor: 20 // multiply rmssd value by this factor
});
```

Upon receiving rr intervals from a heart rate monitoring device, add them to the analysis window.
```
hrv.addRRs(rrs) // where rrs is an array of (usually 1 or 2) rr intervals
```

Listen for analysis results. Once there is enough value (depends on size of analysis window) a 'data' event is emitted including the available hrv time domain metrics.  
```
hrv.on('data', ({ rmssd, sdnn, pnn50 }) => {
  // do things with the metrics, e.g. display in graph, create recording etc.
})
```

That's it, enjoy!

-------
Brought to you by http://jg7.co