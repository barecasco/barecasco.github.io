// ------------------------------------------------------------------------------
// constants
const pi = Math.PI;

const Integrator = function(new_config) {
    const self = this;
    self.time               = 0; // seconds
    self.step_index         = 0;
    self.timestep           = 1;
    self.step_horizon       = 1;
    self.events             = [];
    self.update_listeners   = [];
    self.is_active          = False;
    self.is_started         = False;
    self.init_time_string   = '2024-04-01 00:00:00';
    self.init_time          = new Date(self.init_time_string);

    self.addListener        = function(listener) {
        self.update_listeners.push(listener);
    }

    self.get_date_time      = function() {
        const run_time      = dayjs(self.init_time).add(self.time, 'second').toDate();
        return run_time;
    };

 }