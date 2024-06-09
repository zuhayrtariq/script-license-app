const { convertDateDotFormat, convertDateToISOFormat } = require("../helpers/date.helper") ;

const {  getCoff, updateCoff, addCoff } = require("../query");
 const coffValidation = async(coffDetails) =>{
    const {coffNo} = coffDetails;
    const coffDetailsInDB = await getCoff(coffNo);
    
    //Contract Already Exists
    //Check for Values that might have changed
    if(coffDetailsInDB)
    {
       
        //Storing the value that is coming from Database, can be outdated
     
        //Converting the dates into DD.MM.YYYY format
        coffDetailsInDB.startDate = convertDateDotFormat(coffDetailsInDB.startDate)
        coffDetailsInDB.endDate = convertDateDotFormat(coffDetailsInDB.endDate)
    
        
        const updateData = []
        const valuesToCheck = ['contractNo','coffNo','startDate','endDate','coffAmount','amountToBeInvoiced','amountToBeDelivered','coffCurrency'];
        valuesToCheck.map(key =>{
            if(coffDetails[key] != coffDetailsInDB[key])
        {
            if(key == 'startDate' || key == 'endDate')
            {
                updateData.push(
                    {
                        key,
                        value:  convertDateToISOFormat(coffDetails[key]), 
                        oldValue:convertDateToISOFormat(coffDetailsInDB[key])
                    }
                )
            }
            else{
                updateData.push(
                    {
                        key,
                        value:  coffDetails[key], 
                        oldValue:coffDetailsInDB[key] 
                    }
                )
            }
           
    
        }
        })    
    
    
        if(updateData.length)
        {
           console.log(updateData)
        const result = await updateCoff(updateData,coffNo);   
        if(result)
        console.log("Data Updated Against Coff No.",coffNo);
        }
       
       
        return 0;
    }
    
    //If Contract does not exist in database then add it
    coffDetails.startDate = convertDateToISOFormat(coffDetails.startDate);
    coffDetails.endDate = convertDateToISOFormat(coffDetails.endDate);
    const result = await addCoff(coffDetails)
    console.log("result",result)
    if(result == 1)
        console.log(" New call-off added in DB : ",coffDetails.coffNo)
    else
    console.log("Unable to Add Coff in DB : ",coffDetails.coffNo)
    }

    const updateCoffsFromExcel = async(data) =>{
        for(let i = 0 ; i < data?.length ; i++)
        {
            const requiredKeys = ['contractNo','coffNo','startDate','endDate','coffAmount','amountToBeInvoiced','amountToBeDelivered','coffCurrency'];
            const hasAllKeys = requiredKeys.every(key => data[i].hasOwnProperty(key))
           
           if(hasAllKeys)
               await coffValidation(data[i]);
          
        }
        console.log("Update Call-off From Excel Completed!")
    }
    module.exports = updateCoffsFromExcel