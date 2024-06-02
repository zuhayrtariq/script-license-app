const moment = require("moment");



const isCorrectDateFormat = (date,format = 'D/M/YY') =>{
  return moment(date,format,true).isValid()
}

const convertDateToISOFormat = (date,format = 'DD.MM.YYYY') =>{
  if (moment(date, format).isValid()) {
      return moment(date, format).format("YYYY-MM-DD");
    } 
    else return date;
}

const compareDates = (date1,date2,format = 'DD.MM.YYYY') =>{
  date1 = moment(date1,format).format();
  date2 = moment(date2,format).format();
  const dateIsAfter = moment(date1).isAfter(moment(date2));
  return dateIsAfter
}

const convertDateDotFormat = (date,format= 'D/M/YY') =>{

  if(format)
  return moment(date,format).format('DD.MM.YYYY')
  else
  return moment(date).format('DD.MM.YYYY');
}

const convertDateMMMFormat = (date,format= 'D/M/YY') =>{

  if(format)
  return moment(date,format).format('DD-MMM-YYYY')
  else
  return moment(date).format('DD-MMM-YYYY');
}

const getDateAfter = (number, type = "days") => {
  let date = moment().add(number, type).calendar();
  console.log(date)
  date = moment(date, "MM/DD/YYYY").format("YYYY-MM-DD");
  return date;
  // return date;
};

const getTodayDate = () => {
  return moment().format('YYYY-MM-DD')
};

module.exports = {
 
  convertDateToISOFormat,
  compareDates,
  convertDateDotFormat,
  getDateAfter,
  isCorrectDateFormat,
  getTodayDate,
  convertDateMMMFormat
};
