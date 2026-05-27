export const getBackoffTime=(attempt)=>{
    const delays=[
        60*1000,  //1 min
        5 * 60 * 1000, // 5 min
        15 * 60 * 1000 // 15 min
    ];

  return delays[attempt - 1] || null;
};