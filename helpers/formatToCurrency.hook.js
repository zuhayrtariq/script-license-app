 const formatToCurrency = (amount,currency = 'USD') =>{
    if(currency == 'USD' || currency == 'USDPK')
    {
      return '$' + amount.toLocaleString()
    }
    else if(currency == 'PKR')
    {
      return amount.toLocaleString() + ' PKR'
    }
    else if(currency == 'EUR')
    {
      return '€' + amount.toLocaleString()
    }
    else{
      
        return '$' + amount.toLocaleString()
      
    }
  }

  module.exports = formatToCurrency