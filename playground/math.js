const calculateTip = (total, tipPerc=20)=>{
    const tip = total * tipPerc/Number(100);
    return total + tip;
}

const fahrenheitToCelsius = (temp) => {
    return (temp - 32) / 1.8
}

const celsiusToFahrenheit = (temp) => {
    return (temp * 1.8) + 32
}

const add = (a,b)=>{
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            if(a<0 || b<0){
                return reject("Number must be non-negetive");
            }
            resolve(a+b);
        }, 2000)
    })
}


module.exports= {
    calculateTip, fahrenheitToCelsius, celsiusToFahrenheit,add
}