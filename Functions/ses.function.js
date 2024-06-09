const { convertDateDotFormat, convertDateToISOFormat, compareDates } = require("../helpers/date.helper");
const { getCoffSES, updateCoff } = require("../query");

const sesValidation = async ({ coffNo, sesEndDate }) => {
  const coffDetailsInDB = await getCoffSES(coffNo);

  if (coffDetailsInDB) {
    coffDetailsInDB.sesEndDate = convertDateDotFormat(
      coffDetailsInDB.sesEndDate,
    );
    if (compareDates(sesEndDate, coffDetailsInDB.sesEndDate)) {
      await updateCoff(
        [
          {
            key: 'sesEndDate',
            value: convertDateToISOFormat(sesEndDate),
            oldValue: coffDetailsInDB.sesEndDate,
          },
        ],
        coffNo,
      );
      console.log('SES End Date Updated Against Coff No.', coffNo, sesEndDate);
    }
  } else {
    console.log('COFF Not Found while updated SES End Date : ', coffNo);
  }
};

 const updateSesFromExcel = async (data) => {
  if (data == -1) {
    return 0;
  }
  for (let i = 0; i < data.length; i++) {
    await sesValidation(data[i]);
  }
  console.log("Update SES End Date from Excel - Completed")
};

module.exports = updateSesFromExcel
