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
  const query = `SELECT * FROM Contract WHERE contractNo = ${contractNo}`;
  return await getQuerySingleResult(query);
};

 const getCoff = async (coffNo) => {
  const query = `SELECT * FROM Call_off WHERE coffNo = ${coffNo}`;
  return await getQuerySingleResult(query);
};

 const getCoffSES = async (coffNo) => {
  const query = `SELECT sesEndDate FROM Call_off WHERE coffNo = ${coffNo}`;
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
  const todayDate = new Date().toISOString();
  const query = `INSERT INTO Contract (contractNo,sectionCode,title,vendorCode,vendorName,startDate,endDate
        ,contractOpenValue,contractCurrency,contractTRXValue,createdAt,updatedAt) VALUES 
        (${contractNo},'${sectionCode}','${title}','${vendorCode}','${vendorName}','${startDate}','${endDate}'
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
  const todayDate = new Date().toISOString();
  const query = `INSERT INTO call_off (coffNo,contractNo,title,startDate,endDate,sesEndDate,coffAmount,
    coffCurrency,amountToBeInvoiced,amountToBeDelivered,createdAt,updatedAt) VALUES 
        (${coffNo},'${contractNo}','${title}','${startDate}','${endDate}','${startDate}',
        ${coffAmount},'${coffCurrency}',${amountToBeInvoiced},${amountToBeDelivered},'${todayDate}','${todayDate}') `;

  const result = await queryMutation(query);
  return result;
};

const updateContract = async (updateData, contractNo) => {
  const todayDate = new Date().toISOString();
  let query = 'UPDATE contract SET ';
  updateData.map((x, i) => {
    query += `${x.key} = '${x.value}' ,`;
  });

  query += `updatedAt = '${todayDate}' WHERE contractNo = '${contractNo}'`;
  const result = await queryMutation(query);

  return result;
};

const updateCoff = async (updateData, coffNo) => {
  const todayDate = new Date().toISOString();
  let query = 'UPDATE call_off SET ';
  updateData.map((x, i) => {
    query += `${x.key} = '${x.value}' ,`;
  });

  query += `updatedAt = '${todayDate}' WHERE coffNo = '${coffNo}'`;
  const result = await queryMutation(query);

  return result;
};


const getContractsExpiring = async(sectionCode) => {
  console.log("Contract Expiry Limit in Months : ",process.env.Contract_Expiry_Limit_Months)
  const expiryDate = getDateAfter(process.env.Contract_Expiry_Limit_Months,'days');

  if(sectionCode)
    {
      const query = `SELECT * FROM CONTRACT WHERE endDate = '${expiryDate}' AND emailAlerts = 1 AND archived = 0 AND sectionCode = '${sectionCode}' ORDER BY endDate `
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT * FROM CONTRACT WHERE endDate <= '${expiryDate}' AND emailAlerts = 1 AND archived = 0 ORDER BY sectionCode,endDate`
        return await getQueryResult(query)
      }

}

const getCoffsExpiring = async(sectionCode) => {
  console.log("Coff Expiry Limit in Days : ",process.env.Coff_Expiry_Limit_Days)
  const expiryDate = getDateAfter(process.env.Coff_Expiry_Limit_Days,'days');

  if(sectionCode)
    {
      const query = `SELECT call_off.*,contract.sectionCode,contract.endDate as contractEndDate,contract.vendorName,contract.contractOpenValue,contract.contractCurrency FROM call_off
      INNER JOIN Contract on Contract.contractNo = call_off.contractNo
    
       WHERE call_off.endDate = '${expiryDate}' AND call_off.emailAlerts = 1 AND call_off.archived = 0 AND sectionCode = '${sectionCode}' ORDER BY call_off.endDate,call_off.contractNo `
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT call_off.*,contract.sectionCode,contract.endDate as contractEndDate,contract.vendorName,contract.contractOpenValue,contract.contractCurrency FROM call_off
      INNER JOIN Contract on Contract.contractNo = call_off.contractNo
    
       WHERE call_off.endDate <= '${expiryDate}' AND call_off.emailAlerts = 1 AND call_off.archived = 0  ORDER BY sectionCode,call_off.endDate,call_off.contractNo `
      return await getQueryResult(query)
      }

}

//Type : 1 or 2
// 1 : on that date and before that date
// 2 : only on that date
const getSESExpiring = async(type = 1) => {
  console.log("SES Expiry Limit in Days : ",process.env.Ses_Expiry_Limit_Days)
  const expiryDate = getDateAfter(process.env.Ses_Expiry_Limit_Days,'days');
  if(type == 1)
    {
      const query = `SELECT call_off.*,contract.sectionCode,contract.vendorName FROM call_off
      INNER JOIN Contract on Contract.contractNo = call_off.contractNo
    
       WHERE call_off.sesEndDate <= '${expiryDate}' AND call_off.archived = 0 AND call_off.endDate != call_off.sesEndDate ORDER BY call_off.sesEndDate`
      return await getQueryResult(query)
    }
   else
      {
        const query = `SELECT call_off.*,contract.sectionCode,contract.vendorName FROM call_off
        INNER JOIN Contract on Contract.contractNo = call_off.contractNo
      
         WHERE call_off.sesEndDate = '${expiryDate}' AND call_off.archived = 0 AND call_off.endDate != call_off.sesEndDate ORDER BY call_off.sesEndDate`
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