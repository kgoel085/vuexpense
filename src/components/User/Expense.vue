<template>
    <v-flex xs12 class="py-2">
        <v-form v-model="formValid" ref="addForm" name="addForm">
            <v-layout row wrap>
                <v-flex class="grow pa-1" v-for="(field, indx) in addFields" :key="indx">
                    <template v-if="field.hasOwnProperty('input')">
                        <v-text-field
                            v-model="field.value"
                            :label="field.display"
                            :type="field.type"
                            :rules="field.rules"
                            :disable="disableFields"
                        ></v-text-field>
                    </template>
                    <template v-if="field.hasOwnProperty('select')">
                        <v-select
                            :items="field.options"
                            v-model="field.value"
                            :label="field.display"
                            :rules="field.rules"
                            :disable="disableFields"
                        ></v-select>
                    </template>
                </v-flex>
                <v-flex class="shrink">
                    <v-btn flat class="primary" @click="checkData" :disabled="!formValid || disableFields">Add</v-btn>
                </v-flex>
            </v-layout>
        </v-form>
    </v-flex>
</template>

<script>
export default {
    data(){
        return {
            addFields:{
                title:{
                    value: null,
                    display: 'Title',
                    input: true,
                    type: 'text',
                    rules:[
                        v => !!v || 'Title is required',
                        v => v && v.length >= 3  || 'Name must be greater than equal to 3 characters'
                    ]
                },
                value:{
                    value: null,
                    display: 'Value',
                    input: true,
                    type: 'number',
                    rules:[
                        v => !!v || 'Value is required and must be a number',
                        v => parseInt(v) && v > 0  || 'Value must be a valid number or greater than zero'
                    ]
                },
                type:{
                    value: false,
                    display: 'Type',
                    select: true,
                    options: ['Debit', 'Credit'],
                    rules:[
                        v => !!v || 'Type is required',
                    ]
                }
            },
            formValid: false,
            disableFields: false
        }
    },
    watch:{
        // Communicate current field state with parent
        disableFields(val){
            this.$emit('disableFields', val);
        }
    },
    computed:{
        // Current user object
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        },

        // User expense document
        expenseDoc(){

            // Return the document instance, if available
            if(this.userObj) return this.$__firebase.firestore.collection('expenses').doc(this.userObj.uid);

            return false;
        },

        // Expense date
        expenseDate(){
            return this.date
        }
    },
    methods:{
        // Check data
        checkData(){
            this.disableFields = true;

            // Create ref. to data collection
            let expenseCollection = this.expenseDoc.collection('data');

            // Apply filter
            let dtArr = ['year', 'month', 'date'];
            this.expenseDate.split('-').forEach((key, indx) => expenseCollection = expenseCollection.where(dtArr[indx], '==', parseInt(key)));

            // Apply title filter
            expenseCollection.where('title', '==', this.addFields.title.value).get().then(doc => {  
                // Add data to document if not exists
                if(!doc.exists) this.addData();
                else this.disableFields = false;
            });
        },

        // Add data to the document
        addData(){
            let objVal = {};
            
            // Process all the field values
            Object.keys(this.addFields).forEach(key => {
                let obj = this.addFields[key];
                if(obj.value) objVal[key] = (parseInt(obj.value)) ? parseInt(obj.value) : obj.value.toLowerCase();
            });

            // If any value is there
            if(Object.keys(objVal).length > 0 && this.expenseDate){
                let [year, month, date] = this.expenseDate.split('-');

                if(year) objVal['year'] = parseInt(year);
                if(month) objVal['month'] = parseInt(month);
                if(date) objVal['date'] = parseInt(date);

                if(Object.keys(objVal).length > 0){
                    // Create ref. to data collection
                    let expenseCollection = this.expenseDoc.collection('data');

                    // Add data to the ref. collection
                    expenseCollection.add(objVal).then(resp => {
                        // this.$refs.addForm.resetValidation();
                        this.$refs.addForm.reset();
                        this.$store.commit('setSnackMsg', 'Item added');

                        this.disableFields = false;
                    }).catch(err => {
                        this.$store.commit('setSnackMsg', err.message);
                        this.disableFields = false;
                    });
                }
            }
        }
    },
    props:{
        date:{
            default: '',
            type: String
        }
    }
}
</script>

<style>

</style>
