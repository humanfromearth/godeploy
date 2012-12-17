var GD = {
    run: function () {
        // initializing views
        this.jobsView = new this.jobsView();
        this.logsView = new this.logsView();

        // initializing collections
        this.jobCollection = new this.jobCollection();
        this.logCollection = new this.logCollection();

        // init routers
        this.router = new this.Router();
        Backbone.history.start();
        this.router.navigate('listLogs', {trigger: true});
    }
};

/* Router */
GD.Router = Backbone.Router.extend({
    routes: {
        'listLogs': 'renderListLogs',
        'listLogs/job/:id': 'renderListLogsJob',
        'listLogs/page/:page': 'renderListLogsPage',
        'viewLog/:id': 'renderViewLog',

        'listJobs': 'renderListJobs',
        'runJob/:id': 'renderRunJob', 
        //'runAllJobs': 'renderRunAllJobs', - don't know exaclty how to implement this yet
    },
    renderListLogs: function () {
        GD.logsView.listLogs();
    },
    renderListLogsJob: function (id) {
        GD.logsView.listLogs(id);
    },
    renderListLogsPage: function (page) {
        GD.logsView.listLogs(null, page);
    },
    renderViewLog: function (id) {
        GD.logsView.viewLog(id);
    },

    renderListJobs: function () {
        GD.jobsView.listJobs();
    },
    renderRunJob: function (id) {
        GD.jobsView.runJob(id);
    },
    renderRunAllJobs: function () {
        GD.jobsView.runAllJobs();
    },
});

/* Models */
GD.jobModel = Backbone.Model.extend({
    sync: function (method, model, options) {

    }
});

GD.logModel = Backbone.Model.extend({
    sync: function (method, model, options) {

    }
})

/* Collections */
GD.jobCollection = Backbone.Collection.extend({
    model: GD.jobModel,
    url: "/jobs"
});

GD.logCollection = Backbone.Collection.extend({
    model: GD.logModel,
    url: "/logs"
});


/* Views */
GD.jobsView = Backbone.View.extend({
    el: '#main',
    listTemplate: _.template($('#jobListTemplate').html()),
    runTemplate: _.template($('#runJobTemplate').html()),
    initialize: function () {
        _.bindAll(this, 'listJobs', 'runJob', 'runAllJobs');
    },
    listJobs: function () {
        var self = this;
        GD.jobCollection.fetch({
            success: function (collection, response) {
                self.$el.html(self.listTemplate({jobs: response}));
            }
        });
    },
    runJob: function(id) {
        var self = this;
        self.$el.html(self.runTemplate());
        // run remote command and print the results in the iframe
        // WebSockets? The iframe method is to easy not to use so no WS for now.
        var frame = $("<iframe id='jobFrame' style='width: 100%; border: none' src='/run/" + id + "'>")
        $("#jobBody").append(frame);
    },
    runAllJobs: function (){
        // first display all jobs
        var self = this;
        GD.jobCollection.fetch({
            success: function (collection, response) {
                self.$el.html(self.listTemplate({jobs: response}));
                _.each(response, function(elem){
                     $.get("/run/" + elem);
                });
            }
        });
    }
});

GD.logsView = Backbone.View.extend({
    el: '#main',
    listTemplate: _.template($('#logListTemplate').html()),
    viewTemplate: _.template($('#viewLogTemplate').html()),
    previousPage: "",
    nextPage: 1,
    initialize: function () {
        _.bindAll(this, 'listLogs', 'viewLog');
    },
    listLogs: function (id, page) {
        var self = this;
        var data = {};
        page = parseInt(page);

        if (id) {
            data["job"] = id;
        }
        if (page) {
            data["page"] = page;
            self.previousPage = page - 1;
            self.nextPage = page + 1;
        }
        GD.logCollection.fetch({
            data: data,
            success: function (collection, response) {
                self.$el.html(self.listTemplate({
                   logs: response.Entries,
                   previousPage: self.previousPage,
                   nextPage: self.nextPage
                }));
            }
        });
    },
    viewLog: function (id) {
        var self = this;
        GD.logCollection.fetch({
            data: "name=" + id,
            success: function (collection, response) {
                self.$el.html(self.viewTemplate({body: response.body}));
            }
        });
    }
});

$(function () {
    GD.run();
});
