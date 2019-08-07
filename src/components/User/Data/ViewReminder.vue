<template>

</template>

<script>
const loader = () => import('@/components/Loader');

export default {
    data(){
        return {
            // Stores reminder data
            dataField:[],

            // Apply filters to data
            filters:[
                {name: 'All', value: 0}, 	// Show all records
                {name: 'Active', value: 1}, 	// Show active records only
                {name: 'Deleted', value: 2}		// Show deleted records only
            ],

            // A loader identifier
            loadingData: false,

            // Which records to show
            showRecords: 0
        }
    },
    computed:{
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        }
    },
    methods:{
        // User expense document
        reminderDoc(filter = true){

            // Return the document instance, if available
            if(this.userObj){
                // Date order
                let dtArr = ['year', 'month', 'date'];

                // Apply filter
                let doc = this.$__firebase.firestore.collection('reminders').doc(this.userObj.uid).collection('data');

                // If filter is required, only then apply it
                if(filter){
                    this.expenseDate.split('-').forEach((key, indx) => doc = doc.where(dtArr[indx], '==', parseInt(key)));

                    // Record type filter ( Active , Deleted )
                    switch(this.showRecords){
                        // Show active records only
                        case 1:
                            doc = doc.where('delete', '==', false);
                        break;

                        // Show deleted records only
                        case 2:
                            doc = doc.where('delete', '==', true);
                        break;
                    }
                }
                return doc;
            }
            return false;
        },

        // Get reminders data
        getData(refresh = false){
            // If refresh is called, reset the current data
            if(refresh) this.$set(this.dataField, []);

           this.reminderDoc().get().then(snapShot => {
                snapShot.forEach(doc => {
                    if(doc.exists){
                        let data = doc.data();
                        data['id'] = doc['id'];

                        this.createData(data);
                    }
                });
           });
        },

        // create data interface
        createData(data = false){
            if(!data) return false;

            // Check whether same document exists or not
            if(data.hasOwnProperty('id') && data.id) this.checkData(data.id);

            // Push data to main object
            this.dataField.push(data);
        },

        // Check data 
        checkData(id = false){
            if(!id) return false;

            const [found] = this.dataField.map((el, indx) => {
                if(el.id == id) return indx;
                else return false;
            });

            if(found === false) return false;

            // Delete the received index
            this.$delete(this.dataField, found);
        }
    },
    mounted(){
        // Get data first time
        this.getData();
    },
    components:{
        loader
    },
    props:{
        // Update the current view request from parent
        updateView:{
            default: 0,
            type: Number
        },

        // Perform actions for provided date data
        expenseDate:{
            default: new Date().toISOString().substr(0, 10),
        },

        // Disable elements if parent says so
        disableElem:{
            default: false,
            type: Boolean
        }
    }
}
</script>

<style>

</style>
