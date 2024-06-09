

const { convertToFloat } = require('./helpers/convertToFloat.helper');

var XLSX = require('xlsx');
const {
  isCorrectDateFormat,
  convertDateDotFormat,
  compareDates,
} = require('./helpers/date.helper');
const updateContractsFromExcel = require('./Functions/contracts.function');
const updateCoffsFromExcel = require('./Functions/coffs.function');
const updateSesFromExcel = require('./Functions/ses.function')


const readExcelFile = async (fileName) => {
  if (fileName == 'contracts.XLS') {
    const data = await readContractFile();
    if (data != -1) await updateContractsFromExcel(data);
  } else if (fileName == 'coffs.XLS') {
    const data = await readCoffFile();
    if (data != -1) await updateCoffsFromExcel(data);
  } else if (fileName == 'ses.XLS') {
    const data = await readSESFile();
    if (data != -1) await updateSesFromExcel(data)
  } else console.log('File Name not Found in readExcelFile');
};

const readContractFile = async () => {
  const requiredExcelHeaders = [
    'Purchase doc / Agreement',
    'Text Contract Object',
    'Vendor Code',
    'Vendor Name',
    'Contract Manager',
    'Val. Start',
    'VPer.End',
    'Contract Trx Value',
    'Crcy',
    'Open Value',
  ];
  const contractHeaderKeys = [
    'contractNo',
    'title',
    'vendorCode',
    'vendorName',
    'sectionCode',
    'startDate',
    'endDate',
    'contractTRXValue',
    'contractCurrency',
    'contractOpenValue',
  ];

  let workbook = XLSX.readFile('./data/contracts.XLS');
  let sheet_name_list = workbook.SheetNames;

  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
    header: [
      '1',
      contractHeaderKeys[0],
      '3',
      contractHeaderKeys[1],
      contractHeaderKeys[2],
      contractHeaderKeys[3],
      contractHeaderKeys[4],
      contractHeaderKeys[5],
      contractHeaderKeys[6],
      contractHeaderKeys[7],
      contractHeaderKeys[8],
      contractHeaderKeys[9],
    ],
    raw: false,
  });

  const headerFieldsInExcelFile = xlData[3];
  for (let i = 0; i < requiredExcelHeaders.length; i++) {
    if (
      headerFieldsInExcelFile[contractHeaderKeys[i]]?.trim() !=
      requiredExcelHeaders[i]
    ) {
      console.log(
        'Error in Excel File Headers : ' +
          headerFieldsInExcelFile[contractHeaderKeys[i]] +
          ' column should not be present in excel file',
      );
      return -1;
    }
  }

  xlData = xlData.splice(4, xlData.length);

  xlData = xlData.filter((x) => {
    if (x.contractTRXValue != undefined) return x;
  });

  xlData = xlData.map((x) => {
    x.contractTRXValue = convertToFloat(x.contractTRXValue);
    x.contractOpenValue = convertToFloat(x.contractOpenValue);
    if (!x.title) {
      x.title = 'Contract Title ' + x.contractNo;
    }
    if (isCorrectDateFormat(x.startDate, 'D/M/YY')) {
      x.startDate = convertDateDotFormat(x.startDate, 'D/M/YY');
    }
    if (isCorrectDateFormat(x.endDate, 'D/M/YY')) {
      x.endDate = convertDateDotFormat(x.endDate, 'D/M/YY');
    }
    return x;
  });

  return xlData;
};

const readCoffFile = async () => {
  const requiredExcelHeaders = [
    'Agreement',
    'Purch.Doc.',
    'Short Text',
    'Name of Vendor',
    'VP Start',
    'VPer.End',
    'Net price',
    'To be inv.',
    'To be del.',
    'Crcy',
  ];
  const coffHeaderKeys = [
    'contractNo',
    'coffNo',
    'title',
    'vendorName',
    'startDate',
    'endDate',
    'coffAmount',
    'amountToBeInvoiced',
    'amountToBeDelivered',
    'coffCurrency',
  ];
  let workbook = XLSX.readFile('./data/coffs.XLS');
  let sheet_name_list = workbook.SheetNames;
  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
    header: [
      '1',
      coffHeaderKeys[0],
      coffHeaderKeys[1],
      coffHeaderKeys[2],
      coffHeaderKeys[3],
      coffHeaderKeys[4],
      coffHeaderKeys[5],
      coffHeaderKeys[6],
      coffHeaderKeys[7],
      coffHeaderKeys[8],
      coffHeaderKeys[9],
    ],
    raw: false,
  });
  let headerFieldsInExcelFile = xlData[0];
  let invalidHeaderFlag = false;
  for (let i = 0; i < requiredExcelHeaders.length; i++) {
    if (
      headerFieldsInExcelFile[coffHeaderKeys[i]]?.trim() !=
      requiredExcelHeaders[i]
    ) {
    invalidHeaderFlag = true;
    break;
    }
  }

  if(invalidHeaderFlag)
    xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
      header: [
        coffHeaderKeys[0],
        coffHeaderKeys[1],
        coffHeaderKeys[2],
        coffHeaderKeys[3],
        coffHeaderKeys[4],
        coffHeaderKeys[5],
        coffHeaderKeys[6],
        coffHeaderKeys[7],
        coffHeaderKeys[8],
        coffHeaderKeys[9],
      ],
      raw: false,
    });
    headerFieldsInExcelFile = xlData[0];
    {
      for (let i = 0; i < requiredExcelHeaders.length; i++) {
        if (
          headerFieldsInExcelFile[coffHeaderKeys[i]]?.trim() !=
          requiredExcelHeaders[i]
        ) {
          console.log(
            'Error in Excel File Headers : ' +
              headerFieldsInExcelFile[coffHeaderKeys[i]]?.trim() +
              requiredExcelHeaders[i] +
              'should not be present in excel file',
          );
          return -1;
        }
      } 
    }

  xlData = xlData.splice(1, xlData.length);
  const updatedCoffData = [];

  xlData = xlData.map((x) => {
    x.coffAmount = convertToFloat(x.coffAmount);
    x.amountToBeInvoiced = convertToFloat(x.amountToBeInvoiced);
    x.amountToBeDelivered = convertToFloat(x.amountToBeDelivered);
    if (isCorrectDateFormat(x.startDate, 'D/M/YY')) {
      x.startDate = convertDateDotFormat(x.startDate, 'D/M/YY');
    }
    if (isCorrectDateFormat(x.endDate, 'D/M/YY')) {
      x.endDate = convertDateDotFormat(x.endDate, 'D/M/YY');
    }
    let coffFoundFlag = false;
    updatedCoffData.map((y) => {
      if (y.coffNo == x.coffNo) {
        y.coffAmount += x.coffAmount;
        y.amountToBeInvoiced += x.amountToBeInvoiced;
        y.amountToBeDelivered += x.amountToBeDelivered;
        y.coffAmountPaid =
          y.coffAmount - (y.amountToBeInvoiced + y.amountToBeDelivered);
        coffFoundFlag = true;
      }
      if (coffFoundFlag == true) {
        return 0;
      }
    });

    if (!coffFoundFlag) {
      x.coffAmountPaid =
        x.coffAmount - (x.amountToBeInvoiced + x.amountToBeDelivered);
      updatedCoffData.push(x);
    }
  });

  updatedCoffData.map((x) => {
    x.coffAmount = parseFloat(x.coffAmount.toFixed(2));
    x.amountToBeInvoiced = parseFloat(x.amountToBeInvoiced.toFixed(2));
    x.amountToBeDelivered = parseFloat(x.amountToBeDelivered.toFixed(2));
    return x;
  });
  return updatedCoffData;
};

const readSESFile = async () => {
  const requiredExcelHeaders = ['Entry Sh.', 'End'];
  const sesHeaderKeys = ['no', 'sesEndDate'];

  const workbook = XLSX.readFile('./data/ses.XLS');
  const sheet_name_list = workbook.SheetNames;
  let xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
    header: ['1', sesHeaderKeys[0], sesHeaderKeys[1]],
    raw: false,
  });
  const data = [];
  let currentCoffNo = '';
  let headerFieldsInExcelFile = xlData[2];
  let invalidHeaderFlag = false
  for (let i = 0; i < requiredExcelHeaders.length; i++) {
    if (headerFieldsInExcelFile[sesHeaderKeys[i]] != requiredExcelHeaders[i]) {
     invalidHeaderFlag = true;
     break;
    }
  }
  if(invalidHeaderFlag)
  {
    xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {
      header: [sesHeaderKeys[0], sesHeaderKeys[1]],
      raw: false,
    });
   
    headerFieldsInExcelFile = xlData[2];
    for (let i = 0; i < requiredExcelHeaders.length; i++) {
      if (headerFieldsInExcelFile[sesHeaderKeys[i]] != requiredExcelHeaders[i]) {
        console.log(
          'Error in Excel File Headers : ' +
            headerFieldsInExcelFile[sesHeaderKeys[i]] +
            'should not be present in excel file',
        );
        console.log('Invalid Header Fields in Excel File');
        return -1;
      }
    }
  }

  xlData = xlData.slice(3, xlData.length);
  xlData = xlData.map((x) => {
    //This is call-off
    if (x.no.startsWith('4500')) {
      currentCoffNo = x.no;
      let coffFoundFlag = false;
      if (data.some((y) => y.coffNo == x.no)) {
        coffFoundFlag = true;
      }
      if (!coffFoundFlag) {
        data.push({
          coffNo: x.no,
          sesEndDate: '01.01.1900',
        });
      }
    }

    if (currentCoffNo) {
      //It is an SES
      if (x.sesEndDate) {
        if (isCorrectDateFormat(x.sesEndDate, 'D/M/YY')) {
          x.sesEndDate = convertDateDotFormat(x.sesEndDate, 'D/M/YY');
        }
        const coffIndex = data.findIndex((y) => y.coffNo == currentCoffNo);
        {
          if (compareDates(x.sesEndDate, data[coffIndex].sesEndDate)) {
            data[coffIndex].sesEndDate = x.sesEndDate;
          }
        }
      }
    }
  });

  return data;
};

module.exports = {
  readExcelFile,
};
