
var jetpackStartWizard = new ( Backbone.View.extend({
	id: 'wizard',
	_currentStep: false,

	initialize: function() {
		this.steps = new Backbone.Collection( [], { model: JetpackStartStep } );
		this.steps.comparator = 'sort';
		this.router = new ( Backbone.Router.extend( {
			routes: {
				'setup/step/:step_slug' : 'render',
				'*path':  'goToFirstStep'
			}
		}) );
		this.router.on(
			'route:render',
			function( step_slug ) {
				jetpackStartWizard.setStep( step_slug );
				jetpackStartWizard.render();
			}
		);
		this.router.on( 'route:goToFirstStep', function() { jetpackStartWizard.goToCurrentStep( true ); } );
	},

	currentStep: function() {
		if ( this._currentStep === false )
			this._currentStep = this.steps.first();
		return this._currentStep;
	},

	goToNextStep: function( event ) {
		event.preventDefault();
		if ( this.currentStep() == this.steps.last() ) {
			window.location = _JetpackStart['home_url'] + '?jps_wizard_end';
			return;
		}
		this._currentStep = this.steps.at( this.steps.indexOf( this._currentStep ) + 1 );
		this.goToCurrentStep();
		return this;
	},

	goToCurrentStep: function() {
		this.router.navigate( "setup/step/" + this.currentStep().get( 'slug' ), { trigger: true } );
	},

	setStep: function( step_slug ) {
		this._currentStep = this.getStep( step_slug );
	},

	getStep: function( step_slug ) {
		return this.steps.findWhere( { slug: step_slug } );
	},

	clear: function() {
		this.steps.each( function( step ) {
			step.getView().remove();
		} );
	},

	render: function() {
		this.clear();
		var currentStepView = this.currentStep().getView();
		jQuery( 'body' ).append( currentStepView.render().delegateEvents().el );
		currentStepView.afterRender();
		this.renderProgress();
		return this;
	},

	renderProgress : function() {
		var slug = this._currentStep.get( 'slug' );
		jQuery( 'header .progress li' ).each( function () {
			var li = jQuery( this ).addClass( 'done' );
			if ( li.data( 'step' ) == slug ) {
				return false;
			}
		} )
	},

	addStep: function( step ) {
		this.steps.add( step );
	}
})
);

jQuery( document ).ready( function() {
	Backbone.history.start();
});

var JetpackStartStepView = Backbone.View.extend({
	initialize: function() {
		this.templateBase = _.template( jQuery( '#step-template' ).html() );
		this.template = _.template( jQuery( this.template_id ).html() );
	},

	render: function() {
		this.$el.html( this.templateBase( this.model.toJSON() ) );
		this.$el.find( '.container').append( this.template( this.model.toJSON() ) );
		return this;
	},

	afterRender: function() {},

	goToNextStep: function( event ) {
		jetpackStartWizard.goToNextStep( event );
	},

	stopPropagation: function( event ) {
		event.stopPropagation();
	}

});

var JetpackStartStep = Backbone.Model.extend({
	defaults: {
		slug: '',
		sort: ''
	},
	getView: function() {
		if ( undefined === this.view ) {
			var View = this.get( 'view' );
			this.view = new View( { model: this } );
		}
		return this.view;
	}
});
