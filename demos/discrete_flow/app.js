// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// constants
const pi = Math.PI;



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// CLASS Agent
const Agent      = function(integrator, name) {
    // integrator: Integrator, name: String
    self.name                   = name;
    self.event_updates          = {};
    self.updates                = {};
    self.event_update_states    = {};
    self.update_states          = {};
    
    self.active                  = true;
    self.integrator              = integrator;
    self.integrator.add_listener(self);

    
    self.log_state               = function() {
        // todo: log the state
    };


    self.set_active              = function(func_name, state) {
        if (func_name in self.event_update_states) {
            self.event_update_states[func_name] = state;
        }

        if (func_name in self.update_states) {
            self.update_states[func_name] = state;
        }
    };


    self. get_active_state      = function(func_name) {
        if (func_name in self.event_update_states) {
            return self.event_update_states[func_name];
        }

        if (func_name in self.update_states) {
            return self.update_states[func_name];
        }

        return null;
    };


    self.add_schedules          = function(time_mark, flow_set) {
        // time_mark: String, flow_set: String
        self.flow_schedules.push([time_mark, flow_set]);
    };


    self.add_event_update       = function(func_name, func, state=false) {
        if (func_name in self.event_updates) {
            console.log("warning, adding existing worker to event_updates");
        }
        self.event_updates[func_name]         = func;
        self.event_update_states[func_name]   = state;
    };


    self.add_update             = function(func_name, func, state=false) {
        if (func_name in self.updates) {
            console.log("warning, adding existing worker to updates");
        }
        self.updates[func_name]         = func;
        self.update_states[func_name]   = state;
    };


    self.bound_update           = function() {
        // execute the function under updates
        if (!self.active){
            return null;
        }

        if (self.updates) {
            for (const [func_name, func] of Object.entries(self.updates)) {
                if (self.update_states[func_name]) {
                    func();
                }
            }
        }
    }


    self.bound_event_update     = function(events) {
        if (!self.active) {
            return null;
        }

        for (const [func_name, func] of Object.entries(self.event_updates)) {
            if (self.event_update_states[func_name]) {
                func(events);
            }
        }
    }

};



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// CLASS Integrator
const Integrator = function(new_config) {
    const self = this;
    self.time               = 0; // seconds
    self.step_index         = 0;
    self.timestep           = 1;
    self.step_horizon       = 1;
    self.events             = [];
    self.update_listeners   = [];
    self.is_active          = false;
    self.is_started         = false;
    self.init_time_string   = '2024-04-01 00:00:00';
    self.init_time          = new Date(self.init_time_string);

    
    self.addListener        = function(listener) {
        self.update_listeners.push(listener);
    }


    self.get_date_time      = function() {
        const run_time      = dayjs(self.init_time).add(self.time, 'second').toDate();
        return run_time;
    };


    self.raise_event        = function(msg) {
        // input string
        console.log("event raised:", msg);
        self.events.push(msg);
    }


    self.purge_events       = function() {
        self.events         = [];
    }


    self.run_loop           = function() {
        while (self.is_active) {
            // listen for announcements and fix
            for (const listener of self.update_listeners) {
                listener.bound_event_update(self.events);
            }

            // halt simulation if an agent ask for it.
            if (!self.is_active) {
                break;
            }

            // log state
            for (const listener of self.update_listeners) {
                listener.log_state();
            }

            if (self.step_index == self.step_horizon) {
                break;
            }

            self.time           += self.timestep;
            self.step_index     += 1;

            // update as per rule
            for (const listener of self.update_listeners) {
                self.purge_events();
                listener.bound_update();
            }
        }
    };


    self.run_simulation     = function() {
        self.is_active      = true;
        self.run_loop();
        // reset time stepper
        self.time           = 0;
        self.step_index     = 0;
    };


    self.pause_simulation   = function(msg) {
        self.is_active      = false;
        console.log("simulation is paused", msg);
        console.log("time:", self.time);
    };

 }

 

// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// ENTITIES
const integrator    = new Integrator();

// -------------------------------------------------------------------------------
// kilang_1
const kilang_1          = {};
kilang_1.name           = "kilang_1";

kilang_1.prop           = {
    "hourly_rate"       : 47.0,
    "total_outflow"     : 0,
    "outflow"           : 0,
    "stock"             : 0,
    "is_discharging"    : false,
    "target_tank"       : "null"  
};

kilang_1.agent          = new Agent(integrator, kilang_1.name);
kilang_1.integrator     = integrator;
kilang_1.history        = {};

kilang_1.log_state      = function() {
    kilang_1.history[integrator.get_date_time().toString()] = structuredClone(kilang_1.prop);
}

kilang_1.agent.log_state = kilang_1.log_state; 

kilang_1.get_log_history = function() {
    return kilang_1.history;
};



// -------------------------------------------------------------------------------
// tangki_1
const tangki_1          = {};
tangki_1.name           = "tangki_1";

tangki_1.prop           = {
    "stock"             : 0,
    "capacity"          : 5600,
    "hourly_rate"       : 250.0,
    "is_discharging"    : false,
    "in_schedule"       : false,
    "in_analysis"       : false,
    "target_tank"       : "null",
    "total_outflow"     : 0
};

tangki_1.agent          = new Agent(integrator, tangki_1.name);
tangki_1.integrator     = integrator;
tangki_1.history        = {};

tangki_1.log_state      = function() {
    tangki_1.history[integrator.get_date_time().toString()] = structuredClone(tangki_1.prop);
}

tangki_1.agent.log_state = kilang_1.log_state; 

tangki_1.get_log_history = function() {
    return tangki_1.history;
};

tangki_1.in_analysis    = function() {
    return tangki_1.prop.in_analysis;
}

tangki_1.in_schedule    = function() {
    return tangki_1.prop.in_schedule;
}



// -------------------------------------------------------------------------------
// tangki_2
const tangki_2          = {};
tangki_2.name           = "tangki_2";

tangki_2.prop           = {
    "stock"             : 0,
    "capacity"          : 10000,
    "hourly_rate"       : 250.0,
    "is_discharging"    : False,
    "in_analysis"       : False,
    "in_schedule"       : False,
    "target_tank"       : "null",
    "total_outflow"     : 0
};

tangki_2.agent          = new Agent(integrator, tangki_2.name);
tangki_2.integrator     = integrator;
tangki_2.history        = {};

tangki_2.log_state      = function() {
    tangki_2.history[integrator.get_date_time().toString()] = structuredClone(tangki_2.prop);
}

tangki_2.agent.log_state = tangki_2.log_state; 

tangki_2.get_log_history = function() {
    return tangki_2.history;
};

tangki_2.in_analysis    = function() {
    return tangki_2.prop.in_analysis;
}

tangki_2.in_schedule    = function() {
    return tangki_2.prop.in_schedule;
}
