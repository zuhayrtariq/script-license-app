const convertToFloat = (str) =>{
    return parseFloat(str.replace(/,/g, ''))
}

module.exports = {convertToFloat}