const helpers = require('./helpers/helpers')

class Fields {
    /**
     * Creates empty fields object
     */
    constructor(){
        this.fields = new Set();
    }
    /**
     * Sets new item in fields object if it is not already there
     * @param {string} item 
     */
    setItem = (item)=>{
        if (!helpers.isString(item)){
            throw new SyntaxError('Invalid item. Must be string value');
        }
        if (!this.fields.has(item)){
            this.fields.add(item);
        }
    }
    /**
     * Returns string representation of fields for request
     * @returns {string} String value for 'fields' query param
     */
    getAsString = ()=>{
        let val = [];
        this.fields.forEach((item)=>{
            val.push(item);
        });
        return val.join(',');
    }
    
}

module.exports = {
    Fields: Fields
}



