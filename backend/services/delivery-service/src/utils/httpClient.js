import axios from "axios";

import axiosRetry from "axios-retry";

const client=axios.create({
    timeout:5000,  //5s
});

axiosRetry(client,{
    retries:3,
    retryDelay:axiosRetry.exponentialDelay,
});

export default client;