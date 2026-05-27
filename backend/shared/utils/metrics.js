import client from "prom-client"

const collectDefaultMetrics=client.collectDefaultMetrics;
collectDefaultMetrics();

export const httpRequestTotal=new client.Counter({
    name:"http_reques_total",
    help:"Total HTTP requests",
    labelNames:["method","route","status"],
});

// request duration 
export const httpRequestDuration = new client.Histogram({
    name:"http_request_duration_seconds",
    help:"Request duration",
    labelNames:["method","route","status"],
    buckets:[0.1,0.5,1,2,5]
})


export const register=client.register;