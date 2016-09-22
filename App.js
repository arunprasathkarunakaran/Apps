// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    // Entry Point to App
    launch: function() {
      

      console.log('our first app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      this.pulldownContainer = Ext.create('Ext.container.Container', {    // this container lets us control the layout of the pulldowns; they'll be added below
        id: 'pulldown-container-id',
        layout: {
                type: 'hbox',           // 'horizontal' layout
                align: 'stretch'
            }
      })
      
      this.add(this.pulldownContainer); // must add the pulldown container to the app to be part of the rendering lifecycle, even though it's empty at the moment

     // this._loadCheckBox();
     this._loadRules();
      this._loadIterations();
      //this._loadRules();
      
      //this._loadData();                 // we need to prefix with 'this.' so we call a method found at the app level.
    },

    _loadRules: function() {
    this.RuleComboBox = Ext.create('Rally.ui.CheckboxField', {
          fieldLabel: 'AcceptanceCriteria is NULL',
          labelAlign: 'right',
          width: 300,
          value: false,
          listeners: {
            ready: function(combobox, records) {             // on ready: during initialization of the app, once Iterations are loaded, lets go get Defect Severities
                 this._loadData();
           },
        select: function(combobox, records) {   // on select: after the app has fully loaded, when the user 'select's an iteration, lets just relaod the data
                 this._loadData();
           },
           scope: this
         }
        });
    this.pulldownContainer.add(this.RuleComboBox); 
    this.RuleComboBox1 = Ext.create('Rally.ui.CheckboxField', {
          fieldLabel: 'Story Ready to be Accepted',
          labelAlign: 'right',
          width: 300,
          value: true,
          listeners: {
            ready: function(combobox, records) {             // on ready: during initialization of the app, once Iterations are loaded, lets go get Defect Severities
                 this._loadData();
           },
        select: function(combobox, records) {   // on select: after the app has fully loaded, when the user 'select's an iteration, lets just relaod the data
                 this._loadData();
           },
           scope: this
         }
        });
    this.pulldownContainer.add(this.RuleComboBox1); 
    },

// create iteration pulldown and load iterations
    _loadIterations: function() {
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
          fieldLabel: 'Iteration',
          labelAlign: 'right',
          width: 300,
          listeners: {
            ready: function(combobox, records) {             // on ready: during initialization of the app, once Iterations are loaded, lets go get Defect Severities
                 this._loadData();
           },
        //select: function(combobox, records) {   // on select: after the app has fully loaded, when the user 'select's an iteration, lets just relaod the data
          //       this._loadData();
          // },
           scope: this
         }
        });

        this.pulldownContainer.add(this.iterComboBox);   // add the iteration list to the pulldown container so it lays out horiz, not the app!
     },

_checkFilterStatus: function(){
  
      var AcceptanceCriteriaFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'AcceptanceCriteria',
              operation: '=',
              value: null
        });
        
        var ScheduleStateFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'ScheduleState',
              operation: '=',
              value: 'Completed'
        });
  
        if (this.RuleComboBox.getValue()) {
          if (this.RuleComboBox1.getValue()) {
          var filter = AcceptanceCriteriaFilter.or(ScheduleStateFilter);
          }
          else { filter = AcceptanceCriteriaFilter;}
          }
          if (this.RuleComboBox1.getValue()) { filter = ScheduleStateFilter;}
        return filter;
    },

    // Get data from Rally
    _loadData: function() {
        var selectedIterRef = this.iterComboBox.getRecord().get('_ref'); 
        var iterationFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'Iteration',
              operation: '=',
              value: selectedIterRef
        });
        
        
       var RuleComboBoxRef = this._checkFilterStatus();
       // var RuleComboBoxRef = ScheduleStateFilter;
        //var myFilters = iterationFilter.and((AcceptanceCriteriaFilter).or(ScheduleStateFilter));
        var myFilters =  iterationFilter.and(RuleComboBoxRef);
        
        
      var myStore = Ext.create('Rally.data.wsapi.Store', {
          model: 'User Story',
          autoLoad: true,                         // <----- Don't forget to set this to true! heh
          filters: myFilters,
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', myStore, myData);
                  this._loadGrid(myStore);      // if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which does not exist.
              },
              scope: this                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name', 'ScheduleState', 'Iteration','AcceptanceCriteria']   // Look in the WSAPI docs online to see all fields available!
        });

    },

    // Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {

      var myGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'ScheduleState', 'Iteration', 'AcceptanceCriteria'
        ]
      });

      this.add(myGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

      console.log('what is this?', this);

    }

});