const helpers = require("./helpers/helpers")

/** Class representing query param 'fields' for dicovery request. */
class DiscoveryFields {
    /**
     * Create a DiscoveryFields
     * @param {Object} fields object with the following string properties: userName,startDate,endDate,after
     * @param {string} fields.userName The userName of the instagram account to query (required)
     * @param {string} fields.startDate Start date of request in ISO Layout 'YYYY-MM-DD'
     * @param {string} fields.endDate End date of request in ISO Layout 'YYYY-MM-DD'
     * @param {string} fields.after After cursor for request, if any
     */
    constructor(fields){
        let uName= ''
        let sDate = ''
        let eDate = ''
        let aCursor = ''
        if (fields && typeof fields === 'object'){
            if (helpers.isString(fields.userName))
                uName = fields.userName;
            if (helpers.isString(fields.startDate))
                sDate = fields.startDate
            if (helpers.isString(fields.endDate))
                eDate = fields.endDate
            if (helpers.isString(fields.after))
                aCursor = fields.after
        }
        this.userName = uName;
        this.startDate = sDate;
        this.endDate = eDate;
        this.after = aCursor;
    }

    setUserName = (userName) =>{
        if (!helpers.isString(userName)){
            throw new SyntaxError('Invalid userName');
        }
        this.userName = userName;
    }

    setAfter = (after) =>{
        if (!helpers.isString(after)){
            throw new SyntaxError('Invalid after cursor');
        }
        this.after = after;
    }

    setStartDate  = (startDate) =>{
        if (!helpers.isString(startDate)){
            throw new SyntaxError('Invalid startDate');
        }
        this.startDate = startDate;
    }

    setEndDate = (endDate) =>{
        if (!helpers.isString(endDate)){
            throw new SyntaxError('Invalid endDate');
        }
        this.endDate = endDate;
    }

    /**
     * Get string for query param 'fields'
     * @return {string} 'fields' query param value
     */
    format = ()=>{
        //console.log(this.userName,':',this.startDate,':',this.endDate)
        let stringFields = `business_discovery.username(${this.userName}){media`;
        if (this.startDate === '' && this.endDate === ''){
            stringFields+= `.since(${helpers.getStartDate()})`
        }else {
            stringFields +=(this.startDate === ''?'':`.since(${this.startDate})`);
            stringFields +=(this.endDate === ''?'':`.until(${this.endDate})`);
        }
        stringFields += (this.after === ''?'':`.after(${this.after})`);
        stringFields += '{timestamp,caption,media_type,children{media_url}}}';
        return stringFields
    }
}

module.exports = {
    DiscoveryFields: DiscoveryFields
}