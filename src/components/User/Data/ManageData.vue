<template>
    <v-flex xs12 class="py-2">
        <v-form v-model="formValid" ref="addForm" name="addForm">
            <v-layout row wrap>
                <v-expansion-panel v-model="panel" focusable>
                    <v-expansion-panel-content>
                        <template v-slot:header>
                            <h3 class="secondary--text">{{ title }} Data</h3>
                        </template>
                        <v-card flat class="grow pa-1" >
                            <v-layout row wrap :key="documentId">
                                <v-flex class="grow pa-1" v-for="(field, indx) in dataObj" :key="indx">
                                    <template v-if="field.hasOwnProperty('input')">
                                        <v-text-field
                                            v-model="fieldValues[indx]"
                                            :label="field.display"
                                            :type="field.type"
                                            :rules="field.rules"
                                            :key="field.value"
                                        ></v-text-field>
                                    </template>
                                    <template v-if="field.hasOwnProperty('select')">
                                        <v-select
                                            :items="field.options"
                                            v-model="fieldValues[indx]"
                                            :label="field.display"
                                            :rules="field.rules"
                                            item-text="name"
                                            item-value="value"
                                            :key="field.value"
                                        ></v-select>
                                    </template>
                                </v-flex>
                                <v-flex xs12 class="text-xs-center">
                                    <v-btn flat class="primary" @click="checkData" :disabled="!formValid || disableFields">{{ title }}</v-btn>
                                    <v-btn flat class="primary" @click="resetData">Reset</v-btn>
                                </v-flex>
                            </v-layout>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </v-layout>
        </v-form>
    </v-flex>
</template>

<script>
import EventBus from '../../../helpers/EventBus';

export default {
    data(){
        return {
            // Fields value templates, creating issue with computed var so need to separate it
            fieldValues:{
                title: null,
                value: null,
                type: false
            },

            // Fields template
            addFields:{
                title:{
                    display: 'Title',
                    input: true,
                    type: 'text',
                    rules:[
                        v => !!v || 'Title is required',
                        v => v && v.length >= 3  || 'Name must be greater than equal to 3 characters'
                    ]
                },
                value:{
                    display: 'Value',
                    input: true,
                    type: 'number',
                    rules:[
                        v => !!v || 'Value is required and must be a number',
                        v => parseInt(v) && v > 0  || 'Value must be a valid number or greater than zero'
                    ]
                },
                type:{
                    display: 'Type',
                    select: true,
                    options: [{name: 'Debit', value: 'debit'}, {name: 'Credit', value: 'credit'}],
                    rules:[
                        v => !!v || 'Type is required',
                    ]
                }
            },
            formValid: false,
            disableFields: false,
            panel: 0,
            documentId: false
        }
    },
    computed:{
        // Page title
        title(){
            if(Object.keys(this.updateObj).length > 0) return 'Update';
            return 'Add';
        },

        // Update/ Add data obj
        dataObj(){
            // Fields template
            let obj = this.addFields;

            // If disable fields are provided, do not include them
            if(this.excludeFields.length > 0){
                for(let key of Object.keys(obj)){
                    const val = this.excludeFields.find(elem => elem == key);
                    if(val) this.$delete(obj, key);
                }
            }

            // If data is there to update, overwrite original values
            if(Object.keys(this.updateObj).length > 0){

                // Update values
                Object.keys(obj).forEach(key => {
                    if(this.addFields.hasOwnProperty(key)) this.$set(this.fieldValues, key, this.updateObj[key]);
                });

                // Store document id
                this.documentId = this.updateObj.id;
                this.$forceUpdate();
            }
            
            return obj;
        },
        
        // Current user object
        userObj(){
            return this.$__firebase.fireauth.currentUser;
        },

        // User expense document
        expenseDoc(){

            // Return the document instance, if available
            if(this.userObj && this.saveDoc) return this.$__firebase.firestore.collection(this.saveDoc).doc(this.userObj.uid);

            return false;
        },

        // Expense date
        expenseDate(){
            return this.date
        }
    },
    methods:{
        // Reset data
        resetData(){
            // Reset form
            this.$refs.addForm.reset();
            
            // If update data is present, reset that to
            if(this.documentId){
                this.documentId = false;
                EventBus.$emit('reset-update', true);
            }
        },

        // Check data integrity
        checkData(){
            this.disableFields = true;

            // Check for document for update
            if(this.documentId){
                if(!this.documentId){
                    this.$store.commit('setSnackMsg', 'Invalid document provided !');
                    return false;
                }
            }

            // Create ref. to data collection
            let expenseCollection = this.expenseDoc.collection('data');

            // Apply filter
            let dtArr = ['year', 'month', 'date'];
            this.expenseDate.split('-').forEach((key, indx) => expenseCollection = expenseCollection.where(dtArr[indx], '==', parseInt(key)));

            // Apply title filter
            expenseCollection.where('title', '==', this.fieldValues.title).get().then(doc => {  
                // Add data to document if not exists
                if(!doc.exists) this.addData();
                else this.disableFields = false;
            });
        },

        // Add data to the document
        addData(){
            let objVal = {};
            
            // Process all the field values
            Object.keys(this.fieldValues).forEach(key => {
                let obj = this.fieldValues[key];
                if(obj) objVal[key] = (parseInt(obj)) ? parseInt(obj) : (key == 'type') ? obj.toLowerCase() : obj;
            });

            // If any value is there
            if(Object.keys(objVal).length > 0 && this.expenseDate){
                let [year, month, date] = this.expenseDate.split('-');

                if(year) objVal['year'] = parseInt(year);
                if(month) objVal['month'] = parseInt(month);
                if(date) objVal['date'] = parseInt(date);

                if(Object.keys(objVal).length > 0){
                    objVal['delete'] = (this.updateObj && this.updateObj.hasOwnProperty('delete')) ? this.updateObj.delete : false;

                    // Create ref. to data collection
                    let expenseCollection = this.expenseDoc.collection('data');

                    // Add / Update data to the ref. collection
                    let operate = 'add';
                    let msg = 'Item added';

                    // If update document id is already there
                    if(this.documentId){
                        expenseCollection = expenseCollection.doc(this.documentId);
                        operate = 'update';
                        msg = 'Item updated'
                    }

                    expenseCollection[operate](objVal).then(resp => {
                        // this.$refs.addForm.resetValidation();
                        this.resetData();
                        this.$store.commit('setSnackMsg', msg);

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
        // Date for which to add data
        date:{},

        // Get specific document to write / update data in
        saveDoc:{
            default: null,
            type: String
        },

        // Stores the object data that to be updated
        updateObj:{
            default: {},
            type: Object
        },

        // Disable the fields which are not required
        excludeFields:{
            default: () => {return []},
            type: Array
        }
    }
}
</script>

<style>

</style>
