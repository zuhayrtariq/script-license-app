

const { convertDateDotFormat, convertDateToISOFormat } = require("../helpers/date.helper");
const { getContract, updateContract, addContract } = require("../query");




const contractValidation = async(contractDetails) =>{
const {contractNo} = contractDetails;
const contractDetailsDB = await getContract(contractNo); 

if(contractDetailsDB)
{

    contractDetailsDB.startDate = convertDateDotFormat(contractDetailsDB.startDate)
    contractDetailsDB.endDate = convertDateDotFormat(contractDetailsDB.endDate)

    const updateData = []
    const valuesToCheck = ['sectionCode','startDate','endDate','contractTRXValue','contractCurrency','contractOpenValue'];
    
    valuesToCheck.map(key =>{
        if(contractDetails[key] != contractDetailsDB[key])
        {
            if(key == 'startDate' || key == 'endDate' )
            {
                updateData.push(
                    {
                        key,
                        value: convertDateToISOFormat(contractDetails[key]),
                        oldValue:convertDateToISOFormat(contractDetailsDB[key])
                    }
                ) 
            }
            else{
                updateData.push(
                    {
                        key,
                        value: contractDetails[key],
                        oldValue:contractDetailsDB[key]
                    }
                ) 
            }
           
        }
    })


    if(updateData.length)
    {
       console.log(updateData)
       await updateContract(updateData,contractNo)   
    }
    return 0;
}

//If Contract does not exist in database then add it
contractDetails.startDate = convertDateToISOFormat(contractDetails.startDate);
contractDetails.endDate = convertDateToISOFormat(contractDetails.endDate);
await addContract(contractDetails)
}



const updateContractsFromExcel = async(data) =>{
    for(let i = 0 ; i < data?.length ; i++)
    {
        const requiredKeys = ['contractNo','title','vendorCode','vendorName','sectionCode','startDate','endDate','contractTRXValue','contractCurrency','contractOpenValue'];
        const hasAllKeys = requiredKeys.every(key => data[i].hasOwnProperty(key))
       
       if(hasAllKeys)
           await contractValidation(data[i]);
      
    }
}
module.exports = updateContractsFromExcel