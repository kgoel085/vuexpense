const filters = (function(){
    // Constants
    let strLength = 6;

    const filterObj = {
        username: {
            value: null, 
            rules:[
                v => !!v || 'Name is required',
                v => (v && v.length >= strLength) || `Name must be greater than ${strLength} characters`
            ]
        },
        email: {
            value: null, 
            rules:[
                v => !!v || 'E-mail is required',
                v => /.+@.+/.test(v) || 'E-mail must be valid'
            ]
        },
        password: {
            value: null,
            showPass: false, 
            rules:[
                v => !!v || 'Password is required',
                v => (v && v.length > strLength) || `Password must be greater than ${strLength} characters`
            ]
        },
        confirmPassword: {
            value: null, 
            showPass: false,
            rules:[
                v => (!!v && v) === filterObj.password.value || 'Password does not matches'
            ]
        }
    };

    return {
        // Returns the filters based on options array
        getFilters: function(arr = [], lengthChk = 0){
            const returnArr = [];
            if(typeof arr == 'object' && arr.length > 0){
                // Replace current length check values
                if(lengthChk) strLength = lengthChk;

                // Get the requested filters
                arr.forEach(filter => {
                    if(filterObj.hasOwnProperty(filter)){
                        returnArr.push(filterObj[filter]);
                    }
                });
            }

            return returnArr;
        } 
    }
})();

export default filters;