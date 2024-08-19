export const func_exchange_calc = (toCurrency: string, amount: number, rate: number) =>{
    let newAmount = 0;

    if(toCurrency === "₭"){
        newAmount = (amount * rate);
    }


    return Math.ceil(newAmount);
}