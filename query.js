const { getTodayDate, getDateAfter } = require("./helpers/date.helper");
const sql = require('mssql');
require('dotenv').config({ path: `./${process.env.NODE_ENV}.env` });



const dbConfig = process.env.DB_URI;

const getQuerySingleResult = async (query) => {
  try {
    await sql.connect(dbConfig);
    const { recordset: result } = await sql.query(query);
    if (result[0]) return result[0];
    else {
      return undefined;
    }
  } catch (e) {
    console.log('Error in getting query single result. Query: ', query);
    console.log('Error Message : ', e.message);
    return;
  }
};

const getQueryResult = async (query) => {
  try {
    await sql.connect(dbConfig);
    const { recordset: result } = await sql.query(query);
    return result;
    
  } catch (e) {
    console.log('Error in getting query result. Query: ', query);
    console.log('Error Message : ', e.message);
    return;
  }
};

const queryMutation = async (query) => {
  try {
    await sql.connect(dbConfig);
    const { rowsAffected } = await sql.query(query);
    return rowsAffected[0];
  } catch (e) {
    console.log('Error in mutation query. Query: ', query);
    console.log('Error Message : ', e.message);
    return e.message;
  }
};

 const getContract = async (contractNo) => {
  const query = `SELECT * FROM Contracts WHERE contractNo = ${contractNo}`;
  return await getQuerySingleResult(query);
};

 const getCoff = async (coffNo) => {
  const query = `SELECT * FROM Call_offs WHERE coffNo = ${coffNo}`;
  return await getQuerySingleResult(query);
};

 const getCoffSES = async (coffNo) => {
  const query = `SELECT sesEndDate FROM Call_offs WHERE coffNo = ${coffNo}`;
  return await getQuerySingleResult(query);
};

 const addContract = async (contractDetails) => {
  const {
    contractNo,
    sectionCode,
    title,
    vendorCode,
    vendorName,
    startDate,
    endDate,
    contractOpenValue,
    contractCurrency,
    contractTRXValue,
  } = contractDetails;
  const todayDate = await getTodayDate();
  const query = `INSERT INTO Contracts (contractNo,sectionCode,title,vendorName,startDate,endDate
        ,contractOpenValue,contractCurrency,contractTRXValue,addedOn,updatedOn) VALUES 
        (${contractNo},'${sectionCode}','${title}','${vendorCode} - ${vendorName}','${startDate}','${endDate}'
        ,${contractOpenValue},'${contractCurrency}',${contractTRXValue},'${todayDate}','${todayDate}') `;

  const result = await queryMutation(query);
  return result;
};

const addCoff = async (coffDetails) => {
  const {
    coffNo,
    contractNo,
    title,
    startDate,
    endDate,
    coffAmount,
    coffCurrency,
    amountToBeInvoiced,
    amountToBeDelivered,
  } = coffDetails;
  const todayDate = await getTodayDate();
  const query = `INSERT INTO call_offs (coffNo,contractNo,title,startDate,endDate,sesEndDate,coffAmount,
    coffCurrency,amountToBeInvoiced,amountToBeDelivered,addedOn,updatedOn) VALUES 
        (${coffNo},'${contractNo}','${title}','${startDate}','${endDate}','${startDate}',
        ${coffAmount},'${coffCurrency}',${amountToBeInvoiced},${amountToBeDelivered},'${todayDate}','${todayDate}') `;

  const result = await queryMutation(query);
  return result;
};

const updateContract = async (updateData, contractNo) => {
  const todayDate = await getTodayDate();
  let query = 'UPDATE contracts SET ';
  updateData.map((x, i) => {
    query += `${x.key} = '${x.value}' ,`;
  });

  query += `updatedOn = '${todayDate}' WHERE contractNo = '${contractNo}'`;
  const result = await queryMutation(query);

  return result;
};

const updateCoff = async (updateData, coffNo) => {
  const todayDate = await getTodayDate();
  let query = 'UPDATE call_offs SET ';
  updateData.map((x, i) => {
    query += `${x.key} = '${x.value}' ,`;
  });

  query += `updatedOn = '${todayDate}' WHERE coffNo = '${coffNo}'`;
  const result = await queryMutation(query);

  return result;
};


const getContractsExpiring = async(sectionCode) => {
  console.log(process.env.Contract_Expiry_Limit_Months)
  const expiryDate = getDateAfter(process.env.Contract_Expiry_Limit_Months,'days');

  if(sectionCode)
    {
      const query = `SELECT * FROM CONTRACTS WHERE endDate = '${expiryDate}' AND emailAlerts = 1 AND archived = 0 AND sectionCode = '${sectionCode}' ORDER BY endDate `
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT * FROM CONTRACTS WHERE endDate <= '${expiryDate}' AND emailAlerts = 1 AND archived = 0 ORDER BY sectionCode,endDate`
        return await getQueryResult(query)
      }

}

const getCoffsExpiring = async(sectionCode) => {
  console.log(process.env.Coff_Expiry_Limit_Days)
  const expiryDate = getDateAfter(process.env.Coff_Expiry_Limit_Days,'days');

  if(sectionCode)
    {
      const query = `SELECT call_offs.*,contracts.sectionCode,contracts.endDate as contractEndDate,contracts.vendorName,contracts.contractOpenValue,contracts.contractCurrency FROM call_offs
      INNER JOIN Contracts on Contracts.contractNo = call_offs.contractNo
    
       WHERE call_offs.endDate = '${expiryDate}' AND call_offs.emailAlerts = 1 AND call_offs.archived = 0 AND sectionCode = '${sectionCode}' ORDER BY call_offs.endDate,call_offs.contractNo `
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT call_offs.*,contracts.sectionCode,contracts.endDate as contractEndDate,contracts.vendorName,contracts.contractOpenValue,contracts.contractCurrency FROM call_offs
      INNER JOIN Contracts on Contracts.contractNo = call_offs.contractNo
    
       WHERE call_offs.endDate <= '${expiryDate}' AND call_offs.emailAlerts = 1 AND call_offs.archived = 0  ORDER BY sectionCode,call_offs.endDate,call_offs.contractNo `
      return await getQueryResult(query)
      }

}

//Type : 1 or 2
// 1 : on that date and before that date
// 2 : only on that date
const getSESExpiring = async(type = 1) => {
  console.log(process.env.Ses_Expiry_Limit_Days)
  const expiryDate = getDateAfter(process.env.Ses_Expiry_Limit_Days,'days');
  if(type == 1)
    {
      const query = `SELECT call_offs.*,contracts.sectionCode,contracts.vendorName FROM call_offs
      INNER JOIN Contracts on Contracts.contractNo = call_offs.contractNo
    
       WHERE call_offs.sesEndDate <= '${expiryDate}' AND call_offs.archived = 0 AND call_offs.endDate != call_offs.sesEndDate ORDER BY call_offs.sesEndDate`
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT call_offs.*,contracts.sectionCode,contracts.vendorName FROM call_offs
        INNER JOIN Contracts on Contracts.contractNo = call_offs.contractNo
      
         WHERE call_offs.sesEndDate = '${expiryDate}' AND call_offs.archived = 0 AND call_offs.endDate != call_offs.sesEndDate ORDER BY call_offs.sesEndDate`
        return await getQueryResult(query)
      }

}

const getSectionDetails = async() =>{
  const query = 'SELECT * FROM sections';
  return await getQueryResult(query)
}

module.exports = {
    addCoff,
    addContract,
    updateCoff,
    updateContract,
    getCoff,
    getContract,
    getCoffSES,
    getContractsExpiring,
    getCoffsExpiring,
    getSESExpiring,
    getSectionDetails
}