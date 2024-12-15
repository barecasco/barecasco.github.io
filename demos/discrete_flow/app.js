// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// Agent is run by the integrator




// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// constants
const pi = Math.PI;



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// CLASS Agent
const Agent      = function(name) {
    // integrator: Integrator, name: String
    const self                  = this;
    self.name                   = name;
    self.event_updates          = {};
    self.event_update_states    = {};
    self.updates                = {};
    self.update_states          = {};    
    self.active                 = true;


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
    };


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
    self.init_time          = dayjs(self.init_time_string);

    
    self.add_listener        = function(listener) {
        self.update_listeners.push(listener);
    }


    self.get_date_time      = function() {
        const dt      = self.init_time.add(self.time, 'second');
        return dt;
    };


    self.get_date_time_string   = function() {
        const dt                = self.init_time.add(self.time, 'second');
        const styear            = dt.get('year').toString().padStart(2, '0');
        const stmonth           = dt.get('month').toString().padStart(2, '0');
        const stdate            = dt.get('date').toString().padStart(2, '0');
        const sthour            = dt.get('hour').toString().padStart(2, '0');
        const stminute          = dt.get('minute').toString().padStart(2, '0');
        const stsecond          = dt.get('second').toString().padStart(2, '0');
        const timestring        = `${styear}-${stmonth}-${stdate} ${sthour}:${stminute}:${stsecond}`; 
        return timestring
    };


    self.timestamp_from_unit = function(unit_time) {
        const dt                = self.init_time.add(unit_time, 'second');
        const styear            = dt.get('year').toString().padStart(2, '0');
        const stmonth           = dt.get('month').toString().padStart(2, '0');
        const stdate            = dt.get('date').toString().padStart(2, '0');
        const sthour            = dt.get('hour').toString().padStart(2, '0');
        const stminute          = dt.get('minute').toString().padStart(2, '0');
        const timestring        = `d${stdate} ${sthour}:${stminute}`; 
        return timestring
    }


    self.duration_from_unit = function(unit_time) {
        const dt                = self.init_time.add(unit_time, 'second');
        const styear            = dt.get('year').toString().padStart(2, '0');
        const stmonth           = dt.get('month').toString().padStart(2, '0');
        const stdate            = dt.get('date').toString();
        const sthour            = dt.get('hour').toString();
        const stminute          = dt.get('minute').toString();
        const timestring        = `${stdate}d ${sthour}h ${stminute}m`; 
        return timestring
    }



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
    };


    self.reset_time         = function() {
        // reset time stepper
        self.time           = 0;
        self.step_index     = 0;
    }


    self.pause_simulation   = function(msg) {
        self.is_active      = false;
        console.log("simulation is paused", msg);
        console.log("time:", self.time);
    };

 }

 

// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// ENTITIES
const integrator            = new Integrator();
integrator.step_horizon     = 30 * 24 * 60;
integrator.timestep         = 60;
let global_grouped_df_dict  = {};

simulation                  = new Agent("simulator");
integrator.add_listener(simulation);
// -------------------------------------------------------------------------------
// kilang_1
const kilang_1          = new Agent("kilang_1");
kilang_1.name           = "kilang_1";

kilang_1.prop           = {
    "timestamp"         : integrator.get_date_time_string(),
    "hourly_rate"       : 47.0,
    "total_outflow"     : 0,
    "outflow"           : 0,
    "stock"             : 0,
    "is_discharging"    : false,
    "target_tank"       : "null"  
};

kilang_1.log_state      = function() {
    kilang_1.prop.timestamp     = integrator.get_date_time_string();
    kilang_1.history[integrator.get_date_time_string()] = structuredClone(kilang_1.prop);
}
integrator.add_listener(kilang_1);

kilang_1.history        = {};

kilang_1.get_log_history = function() { 
    let index_count         = 0;
    const timestamps        = [];
    const indices           = [];
    const total_outflows    = [];
    const outflows          = [];
    const stocks            = [];
    const target_tanks      = [];
    const hourly_rates      = [];
    const is_dischargings   = [];

    for (const key in kilang_1.history) {
        if (kilang_1.history.hasOwnProperty(key)) {
            const hist      = kilang_1.history[key];
            timestamps.push(hist.timestamp);
            total_outflows.push(hist.total_outflow);
            outflows.push(hist.outflow);
            stocks.push(hist.stock);
            target_tanks.push(hist.target_tank);
            hourly_rates.push(hist.hourly_rate);
            is_dischargings.push(hist.is_discharging);
            indices.push(index_count);
            index_count     += 1;
        }
    }

    const log = {
        "timestamps"        : timestamps,
        "indices"           : indices,
        "total_outflows"    : total_outflows,
        "outflows"          : outflows,
        "stocks"            : stocks,
        "target_tanks"      : target_tanks,
        "hourly_rates"      : hourly_rates,
        "is_dischargings"   : is_dischargings
    }

    return log;
};



// -------------------------------------------------------------------------------
// tangki_1
const tangki_1          = new Agent("tangki_1");
tangki_1.name           = "tangki_1";
tangki_1.prop           = {
    "timestamp"         : integrator.get_date_time_string(),
    "stock"             : 0,
    "capacity"          : 5600,
    "hourly_rate"       : 250.0,
    "is_discharging"    : false,
    "in_schedule"       : false,
    "in_analysis"       : false,
    "target_tank"       : "null",
    "total_outflow"     : 0
};

tangki_1.log_state    = function() {
    tangki_1.prop.timestamp     = integrator.get_date_time_string();
    tangki_1.history[integrator.get_date_time_string()] = structuredClone(tangki_1.prop);
}
integrator.add_listener(tangki_1);

tangki_1.history        = {};


// tangki_1.agent.log_state = tangki_1.log_state; 

tangki_1.get_log_history = function() {
    let index_count         = 0;
    const timestamps        = [];
    const indices           = [];
    const stocks            = [];
    const is_dischargings   = [];
    const in_schedules      = [];
    const in_analyses       = [];
    const total_outflows    = [];
    const hourly_rates      = [];
    const target_tanks      = [];


    for (const key in tangki_1.history) {
        if (tangki_1.history.hasOwnProperty(key)) {
            const hist      = tangki_1.history[key];
            timestamps.push(hist.timestamp);
            stocks.push(hist.stock);
            is_dischargings.push(hist.is_discharging);
            in_schedules.push(hist.in_schedules);
            in_analyses.push(hist.in_analysis);
            total_outflows.push(hist.total_outflow);
            hourly_rates.push(hist.hourly_rate);
            target_tanks.push(hist.target_tank);
            indices.push(index_count);
            index_count     += 1;
        }
    }

    const log = {
        "timestamps"        : timestamps,
        "indices"           : indices,
        "stocks"            : stocks,
        "is_dischargings"   : is_dischargings,
        "in_schedules"      : in_schedules,
        "in_analyses"       : in_analyses,
        "total_outflows"    : total_outflows,
        "hourly_rates"      : hourly_rates,
        "target_tanks"      : target_tanks
    }

    return log;
};

tangki_1.in_analysis    = function() {
    return tangki_1.prop.in_analysis;
}

tangki_1.in_schedule    = function() {
    return tangki_1.prop.in_schedule;
}



// -------------------------------------------------------------------------------
// tangki_2
const tangki_2          = new Agent("tangki_2");
tangki_2.name           = "tangki_2";

tangki_2.prop           = {
    "timestamp"         : integrator.get_date_time_string(),
    "stock"             : 0,
    "capacity"          : 10000,
    "hourly_rate"       : 250.0,
    "is_discharging"    : false,
    "in_analysis"       : false,
    "in_schedule"       : false,
    "target_tank"       : "null",
    "total_outflow"     : 0
};

tangki_2.log_state    = function() {
    tangki_2.prop.timestamp     = integrator.get_date_time_string();
    tangki_2.history[integrator.get_date_time_string()] = structuredClone(tangki_2.prop);
}
integrator.add_listener(tangki_2);
tangki_2.history        = {};


tangki_2.get_log_history = function() {
    let index_count         = 0;
    const timestamps        = [];
    const indices           = [];
    const stocks            = [];
    const is_dischargings   = [];
    const in_schedules      = [];
    const in_analyses       = [];
    const total_outflows    = [];
    const hourly_rates      = [];
    const target_tanks      = [];

    for (const key in tangki_2.history) {
        if (tangki_2.history.hasOwnProperty(key)) {
            const hist      = tangki_2.history[key];
            timestamps.push(hist.timestamp);
            stocks.push(hist.stock);
            is_dischargings.push(hist.is_discharging);
            in_schedules.push(hist.in_schedule);
            in_analyses.push(hist.in_analysis);
            total_outflows.push(hist.total_outflow);
            hourly_rates.push(hist.hourly_rate);
            target_tanks.push(hist.target_tank);
            indices.push(index_count);
            index_count     += 1;
        }
    }

    const log = {
        "timestamps"        : timestamps,
        "indices"           : indices,
        "stocks"            : stocks,
        "is_dischargings"   : is_dischargings,
        "in_schedules"      : in_schedules,
        "in_analyses"       : in_analyses,
        "total_outflows"    : total_outflows,
        "hourly_rates"      : hourly_rates,
        "target_tanks"      : target_tanks
    }

    return log;
};


tangki_2.in_analysis    = function() {
    return tangki_2.prop.in_analysis;
}

tangki_2.in_schedule    = function() {
    return tangki_2.prop.in_schedule;
}


// -------------------------------------------------------------------------------
// reservoir
const reservoir          = new Agent("reservoir");
reservoir.name           = "reservoir";

reservoir.prop           = {
    "timestamp"         : integrator.get_date_time_string(),
    "stock"             : 0,
    "capacity"          : 10e7,
    "total_outflow"     : 0,
    "delivery_source"   : null
};

reservoir.log_state    = function() {
    reservoir.prop.timestamp     = integrator.get_date_time_string();
    reservoir.history[integrator.get_date_time_string()] = structuredClone(reservoir.prop);
}
integrator.add_listener(reservoir);
reservoir.history        = {};


reservoir.get_log_history = function() {
    let index_count         = 0;
    const timestamps        = [];
    const indices           = [];
    const stocks            = [];
    const total_outflows    = [];

    for (const key in reservoir.history) {
        if (reservoir.history.hasOwnProperty(key)) {
            const hist      = reservoir.history[key];
            timestamps.push(hist.timestamp);
            stocks.push(hist.stock);
            total_outflows.push(hist.total_outflow);
            indices.push(index_count);
            index_count     += 1;
        }
    }

    const log = {
        "timestamps"        : timestamps,
        "indices"           : indices,
        "stocks"            : stocks,
        "total_outflows"    : total_outflows,
    }

    return log;
};

// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// SCHEDULE OBJECTS
const schedule                  = {};
schedule.schedule_dict          = [
    "2024-04-08T01:00:00 3600",
    "2024-04-12T01:00:00 2000",
    "2024-04-15T01:00:00 3800",
    "2024-04-20T01:00:00 4000",
    "2024-04-27T01:00:00 3600"
];
schedule.deliveries             = [];
schedule.current_delivery_id    = null;

schedule.prop       = {
    "analysis_run_time" : 60 * 60 * 10,
    "delivery_rate"     : 250.0  
};

for (const line of schedule.schedule_dict) {
    const sched               = line.split(/\s+/);
    let transport_start       = dayjs(sched[0]);
    let analysis_end          = transport_start;
    let analysis_start        = analysis_end.add(-schedule.prop.analysis_run_time, 'second');
    const target_volume       = parseInt(sched[1]);
    let transport_delta_end   = parseInt(3600 * target_volume/schedule.prop.delivery_rate); 
    let transport_end         = transport_start.add(transport_delta_end, 'second');

    schedule.deliveries.push({
        "transport_start"   : transport_start,
        "transport_end"     : transport_end,
        "analysis_start"    : analysis_start,
        "analysis_end"      : analysis_end,
        "target_volume"     : target_volume,
        "delivery_id"       : sched[0],
        "volume_delivered"  : 0.0,
        "is_done"           : false,
        "porter"            : null
    });
}


schedule.is_in_analysis     = function() {
    const test_date         = integrator.get_date_time();
    for (const delivery of schedule.deliveries) {
        const isWithinRange = test_date.isAfter(delivery.analysis_start) && test_date.isBefore(delivery.analysis_end);
        if (isWithinRange) {
            schedule.current_delivery_id    = delivery.delivery_id;
            // console.log("now is in schedule dimwit!");
            return true;
        }
    }
    return false;
}


schedule.is_in_schedule     = function() {
    const test_date         = integrator.get_date_time();
    for (const delivery of schedule.deliveries) {
        const isWithinRange = test_date.isAfter(delivery.transport_start) && test_date.isBefore(delivery.transport_end);
        if (isWithinRange) {
            // console.log("A schedule should start now!");
            // schedule.current_delivery_id    = delivery.delivery_id;
            return true;
        }
    }
    return false;
}



schedule.set_current_transport_end  = function(input_rate) {
    for (const delivery of schedule.deliveries) {
        if (delivery.delivery_id == schedule.current_delivery_id) {
            const start             = delivery.transport_start;
            const tgtvol            = delivery.target_volume;
            const dt                = parseInt(3600 * tgtvol/input_rate)
            delivery.transport_end  =  start.add(dt, 'second');
        }
    }
}

tank_map = {};
tank_map[kilang_1.name]     = kilang_1;
tank_map[tangki_1.name]     = tangki_1;
tank_map[tangki_2.name]     = tangki_2;
tank_map[reservoir.name]    = reservoir;



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// SIMULATION SETUP

kilang_1.prop.target_tank =  tangki_1.name;
tangki_1.prop.target_tank = reservoir.name;
tangki_2.prop.target_tank = reservoir.name;


// update function for kilang 1
function kilang_1_update(){
    const delta_rate    = kilang_1.prop.hourly_rate * integrator.timestep/3600;
    const tgtank_name   = kilang_1.prop.target_tank;
    const tgtank        = tank_map[tgtank_name];
    kilang_1.prop.is_discharging = false;

    if (!tgtank) {
        return 1;
    }

    let target_is_full  = ((tgtank.prop.stock + delta_rate) > tgtank.prop.capacity);
    let tg_discharging  = tgtank.prop.is_discharging;
    let tg_in_analysis  = tgtank.prop.in_analysis;

    //if target is full, attempt to change target
    if (target_is_full || tg_in_analysis || tg_discharging) {
        if (tgtank.name == tangki_1.name) {
            // console.log(tgtank_name, "is occupied");
            kilang_1.prop.target_tank = tangki_2.name;
        }
        else if (tgtank.name == tangki_2.name) {
            // console.log(tgtank_name, "is occupied");
            kilang_1.prop.target_tank = tangki_1.name;
        }
        return 1;
    }

    // if current target is discharging, stop
    if (tg_discharging) {
        return 1;
    }

    tgtank.prop.stock               += delta_rate;
    kilang_1.prop.total_outflow     += delta_rate;
    kilang_1.prop.outflow            = delta_rate;
    kilang_1.prop.is_discharging     = true;
    return 0;
}


//update function for tangki 1
function tangki_1_update() {

    function deliver_schedule_flow(delta_rate){
        const test_date     = integrator.get_date_time();
        for (const delivery of schedule.deliveries) {
            if (test_date.isAfter(delivery.transport_start) && (delivery.volume_delivered < delivery.target_volume)) {
                if ((delivery.volume_delivered + delta_rate) >= delivery.target_volume) {
                    delivery.volume_delivered = delivery.target_volume;
                    console.log("volume delivered!");
                }
                else {
                    delivery.volume_delivered += delta_rate;
                }
                break;
            }

        }

    }

    function transact(delta_rate) {
        reservoir.prop.stock        += delta_rate;
        tangki_1.prop.stock         -= delta_rate;
        tangki_1.prop.total_outflow += delta_rate;
        deliver_schedule_flow(delta_rate);
        tangki_1.prop.is_discharging = true;
    }


    const delta_rate                = tangki_1.prop.hourly_rate * integrator.timestep / 3600;
    const stock_is_empty            = (tangki_1.prop.stock - delta_rate) < 0;
    tangki_1.prop.is_discharging    = false;

    if (stock_is_empty) {
        reservoir.prop.delivery_source = null;
        tangki_1.prop.is_discharging   = false;
        tangki_1.prop.target_tank      = "null";
        return 1;
    }

    if (!tangki_1.in_schedule()) {
        return 1;
    }

    if (tangki_1.in_analysis()) {
        return 1;
    }

    reservoir.prop.delivery_source  = tangki_1.name;
    tangki_1.prop.target_tank       = reservoir.name;
    transact(delta_rate);

    return 0;
}


function tangki_2_update() {
    function deliver_schedule_flow(delta_rate){
        const test_date     = integrator.get_date_time();
        for (const delivery of schedule.deliveries) {
            if (test_date.isAfter(delivery.transport_start) && (delivery.volume_delivered < delivery.target_volume)) {
                if ((delivery.volume_delivered + delta_rate) >= delivery.target_volume) {
                    delivery.volume_delivered = delivery.target_volume;
                    console.log("volume delivered!");
                }
                else {
                    delivery.volume_delivered += delta_rate;
                }
                break;
            }

        }
    }    


    function transact(delta_rate) {
        reservoir.prop.stock        += delta_rate;
        tangki_2.prop.stock         -= delta_rate;
        tangki_2.prop.total_outflow += delta_rate;
        deliver_schedule_flow(delta_rate);
        tangki_2.prop.is_discharging = true;
    }


    const delta_rate                = tangki_2.prop.hourly_rate * integrator.timestep / 3600;
    const stock_is_empty            = (tangki_2.prop.stock - delta_rate) < 0;
    tangki_2.prop.is_discharging    = false;

    if (stock_is_empty) {
        reservoir.prop.delivery_source = null;
        tangki_2.prop.is_discharging   = false;
        tangki_2.prop.target_tank      = "null";
        return 1;
    }

    if (!tangki_2.in_schedule()) {
        return 1;
    }

    if (tangki_2.in_analysis()) {
        return 1;
    }

    reservoir.prop.delivery_source  = tangki_2.name;
    tangki_2.prop.target_tank       = reservoir.name;
    transact(delta_rate);

    return 0;
};



function delivery_update() {
    const in_analysis = schedule.is_in_analysis();
    const in_schedule = schedule.is_in_schedule();

    if (in_analysis) {
        tangki_1.prop.in_schedule = false;
        tangki_2.prop.in_schedule = false;

        if (tangki_1.in_analysis() || tangki_2.in_analysis()) {
            return 0;
        }

        if (tangki_1.prop.stock/tangki_1.prop.capacity > tangki_2.prop.stock/tangki_2.prop.capacity) {
            tangki_1.prop.in_analysis = true;
            schedule.set_current_transport_end(tangki_1.prop.hourly_rate);
            return 0;
        }
        else {
            tangki_2.prop.in_analysis = true;
            schedule.set_current_transport_end(tangki_2.prop.hourly_rate);
            return 0;
        }
    } 

    if (in_schedule) {
        if (tangki_1.in_schedule() || tangki_2.in_schedule()) {
            return 0;
        }

        if (tangki_1.in_analysis()) {
            tangki_1.prop.in_schedule = true;
            tangki_1.prop.in_analysis = false;
            return 0;
        }

        if (tangki_2.in_analysis()) {
            tangki_2.prop.in_schedule = true;
            tangki_2.prop.in_analysis = false;
            return 0;
        }
    }
    else {
        tangki_1.prop.in_schedule = false;
        tangki_2.prop.in_schedule = false;
        return 0;
    }


}



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// SIMULATION SEQUENCE
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +

simulation.add_update("kilang_1_update", kilang_1_update);
simulation.set_active("kilang_1_update", true);

simulation.add_update("tangki_1_update", tangki_1_update);
simulation.set_active("tangki_1_update", true);

simulation.add_update("tangki_2_update", tangki_2_update);
simulation.set_active("tangki_2_update", true);

// activate states
simulation.add_update("delivery_update", delivery_update)
simulation.set_active("delivery_update", true)



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// VISUALIZATION TOOL
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
function plot_history() {
    const traces                = [];

    const conv_displayConfig    = {
        displayModeBar  : false,
        responsive      : true
    };

    // layout overrides the css given in  the index.html
    let layout   = {
        // autosize  : true,
        height          : 400,
        width           : 1000,
        hovermode       : "x unified",
        plot_bgcolor    : '#f5f5f5',
        legend: {
            orientation: 'h',
            x: 1.,
            y: 1.2,
            xanchor: "right"
        },
        dragmode        : false,
        title           : {
            text        : "Stock History",
            standoff    : 0,
            font        : {
                size    : 18,
            }
        },
        xaxis: {
            tickmode: 'linear',
            title           : "Date",
            // tickangle       : 45,
            tickformat      : "%e",
            showgrid        : true,   
            range           : ["2024-03-01T00:00:00", "2024-03-31T00:00:00"],
            zeroline        : true,
            showline        : true,
            linecolor       : 'rgba(100, 100, 100, 0.5)', // Red line color
            linewidth       : 2, 
        },
        yaxis: {
            title           : 'Stock',
            nticks          : 10,
            showticklabels  : true,
            autorange       : true,
            showgrid        : true,
            zeroline        : true,
            // domain          : [0.2, 0.9],
            showline        :true,
            linecolor       : 'rgba(100, 100, 100, 0.5)', // Red line color
            linewidth       : 2, 
            ticksuffix      : '  ',
            tickprefix      : '    '
        }
    };
    

    // ---------------
    // KILANG 1
    // ---------------
    const kilang_history = kilang_1.get_log_history();

    let kilang_outflow_trace = {
        showlegend  : true,
        name        : "Outflow Kilang",
        x           : kilang_history.timestamps,
        y           : kilang_history.total_outflows,
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '##6699ff',
            width: 2,
        }
    };

    const targets       = kilang_history.target_tanks;
    const t1_as_targets = [];
    const t2_as_targets = [];
    for (const target of targets) {
        if (target == "tangki_1") {
            t1_as_targets.push(5000);
            t2_as_targets.push(0);
        }
        else if (target == "tangki_2") {
            t1_as_targets.push(0);
            t2_as_targets.push(5000);
        }
        else {
            t1_as_targets.push(0);
            t2_as_targets.push(0);            
        }
    }

    let kilang_t1flow_trace = {
        showlegend  : true,
        name        : "Outflow to Tangki_1",
        x           : kilang_history.timestamps,
        y           : t1_as_targets,
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '##aacc00',
            width: 2,
        }
    };


    let kilang_t2flow_trace = {
        showlegend  : true,
        name        : "Outflow to Tangki_2",
        x           : kilang_history.timestamps,
        y           : t2_as_targets,
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '##123212',
            width: 2,
        }
    };

    // traces.push(kilang_t1flow_trace);
    // traces.push(kilang_t2flow_trace);
    // traces.push(kilang_outflow_trace);


    // ---------------
    // TANGKI 1
    // --------------- 
    const tangki_1_history = tangki_1.get_log_history();
    let tangki_1_trace = {
        showlegend  : true,
        name        : "Stock Tangki 1",
        x           : tangki_1_history.timestamps,
        y           : tangki_1_history.stocks.map(val => Math.ceil(val)),
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: 'ff0066',
            width: 2,
        },
        hovertemplate: '%{y:.0f}' 
    };
    traces.push(tangki_1_trace);


    // ---------------
    // TANGKI 2
    // --------------- 
    const tangki_2_history = tangki_2.get_log_history();

    let tangki_2_schedules_trace = {
        showlegend  : true,
        name        : "In Schedule Tangki 2",
        x           : tangki_2_history.timestamps,
        y           : tangki_2_history.in_schedules.map(val => val * 5000),
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '#00ccaa',
            width: 2,
        }
    };

    let tangki_2_analyses_trace = {
        showlegend  : true,
        name        : "In Analysis Tangki 2",
        x           : tangki_2_history.timestamps,
        y           : tangki_2_history.in_analyses.map(val => val * 5000),
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '#00cc00',
            width: 2,
        }
    };

    let tangki_2_stocks_trace = {
        showlegend  : true,
        name        : "Stock Tangki 2",
        x           : tangki_2_history.timestamps,
        y           : tangki_2_history.stocks.map(val => Math.ceil(val)),
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '#bb332d',
            width: 2,
        },
        hovertemplate: '%{y:.0f}' 
    };
    traces.push(tangki_2_stocks_trace);


    // ---------------
    // RESERVOIR
    // --------------- 
    const reservoir_history = reservoir.get_log_history();

    let reservoir_stock_trace = {
        showlegend  : true,
        name        : "Delivered Stock",
        x           : reservoir_history.timestamps,
        y           : reservoir_history.stocks.map(val => Math.ceil(val)),
        mode        : 'lines',
        type        : 'scatter',
        line        : {
            color: '#22aa25',
            width: 2,
        },
        hovertemplate: '%{y:.0f}' 
    };

    traces.push(reservoir_stock_trace);



    Plotly.newPlot("disperse-plot", traces, layout, conv_displayConfig);  
}


function plot_gantt_chart() {
    const tank_names    = ["kilang_1", "tangki_1", "tangki_2"];
    const gantt         = [];

    for (const tank_name of tank_names) {
        const tank_gantt            = [];
        const log                   = tank_map[tank_name].get_log_history();
        let  interval_started    = false;
        let  minute_start        = 0;
        let  minute_end          = 0;
        let  start_rate          = 0;
        let  timestamp_start     = null;
        let  timestamp_end       = null;
        let  outflow_target      = "";
        let  init_outflow        = 0;
        let  total_outflow       = 0   ;
        let  prev_outflow        = 0;
        let  curr_target         = log.target_tanks[0];
        //--
        let unit_start          = 0;
        let unit_end            = 0;
        let unit_duration       = 0.0;
        let duration            = 0.0;     
        let volume              = 0.0;

        const log_length          = log.indices.length;
        for (let i = 0; i < log_length; i++) {
            let rate              = log.hourly_rates[i];
            let unit_time         = i * 60;
            let is_discharging    = log.is_dischargings[i];
            let total_outflow     = log.total_outflows[i];
            let outflow_target    = log.target_tanks[i];

            if (!is_discharging) {
                outflow_target = "null";
            }

            if (!interval_started) {
                unit_start          = unit_time;
                minute_start        = unit_time/60;
                timestamp_start     = integrator.init_time.add(minute_start, 'minute');
                interval_started    = true;
                init_outflow        = prev_outflow;
                start_rate          = rate;
                curr_target         = outflow_target;
            }
            else if (interval_started && (outflow_target != curr_target || i == (log.indices.length-1))){
                interval_started        = false;
                unit_end                = unit_time;
                minute_end              = unit_time/60;
                timestamp_end           = integrator.init_time.add(minute_end, 'minute');
                unit_duration           = unit_end - unit_start;
                duration                = minute_end - minute_start;
                volume                  = Math.ceil(total_outflow - init_outflow);
                const gdict             = {
                    "tank"       : tank_name,
                    "start"      : unit_start,
                    "start_time" : timestamp_start,
                    "end"        : unit_end,
                    "end_time"   : timestamp_end,
                    "duration"   : unit_duration,
                    "volume"     : volume,
                    "target"     : curr_target   
                } 
                tank_gantt.push(gdict);
                curr_target     = outflow_target;
                prev_outflow    = total_outflow;
            }
        }
        
        if (tank_gantt.length == 0) {
            interval_started        = false;
            unit_end            = unit_time;
            minute_end              = unit_end/60;
            timestamp_end           = integrator.init_time.add(minute_end, "minute_end");
            unit_duration           = unit_end - unit_start - 1;
            duration                = minute_end - minute_start - 1;
            volume                  = Math.ceil(duration * start_rate/60);
            const gdict             = {
                "tank"       : tank_name,
                "start"      : unit_start,
                "start_time" : timestamp_start,
                "end"        : unit_end,
                "end_time"   : timestamp_end,
                "duration"   : unit_duration,
                "volume"     : volume,
                "target"     : curr_target   
            } 
            tank_gantt.push(gdict);
        }

        gantt.push(tank_gantt);
    }

    const grouped_df_dict = {
        "kilang_1"  : gantt[0],
        "tangki_1"  : gantt[1],
        "tangki_2"  : gantt[2]
    };
    
    global_grouped_df_dict = grouped_df_dict;

    let layout   = {
        barmode         : "stack",
        bargap          : 0.2,
        autosize        : true,
        dragmode        : false,
        height          : 400,
        width           : 1000,
        plot_bgcolor    : '#ffffff',
        title           : {
            text        : "Outflow Gantt Chart",
            standoff    : -100,
            font        : {
                size    : 18,
            }
        },
        xaxis: {
            // automargin          : true,
            showgrid            : true,
            title               : "Date",
            dtick              : 1,
            // rangeslider         : {},
            side                : "bottom",
            // tickmode            : "array",
            zeroline            : false,
            ticks               : "outside",
            tickson             : "boundaries",
            tickwidth           : 0.1, 
            layer               : "below traces",
            ticklen             : 6,
            range               : [1,31],
            tickfont            : {
                family      : "Arial",
                size        : 12,
                color       : "gray"
            }
        },
        yaxis: {
            automargin      : true,
            title           : "",
            ticklen         : 0,
            showgrid        : false,
            zeroline        : false,
            showticklabels  : true,
            ticksuffix      : '  ',
            tickfont        : {
                family  : "Arial",
                // size    : 16,
                // color   : "gray"
            }

        }
    };

    const sorted_tank_names = [
        "tangki_2",
        "tangki_1",
        "kilang_1"
    ];
    
    const target_tank_map = {
        "kilang_1"  : "orchid",
        "tangki_1"  : "orange",
        "tangki_2"  : "orchid",
        "reservoir" : "tomato",
        "null"      : "f5f5f5"
    };
    
    const bar_outline_map = {
        "kilang_1"  : 1,
        "tangki_1"  : 1,
        "tangki_2"  : 1,
        "reservoir" : 1,
        "null"      : 1
    }

    const traces             = [];
    const display_config     = {
        displayModeBar  : false,
        responsive      : false
    };

    for (const tank_name of sorted_tank_names) {
        const gdicts        = grouped_df_dict[tank_name];
        const tank_df       = new dfd.DataFrame(gdicts);
        const colors        = tank_df.target.values.map(target => target_tank_map[target] || "white");
        const outlines      = tank_df.target.values.map(target => bar_outline_map[target] || 0);
        const hovertexts    = [];
        const volume_values = tank_df.volume.values;
        const volume_texts  = [];

        // console.log(tank_name)
        // console.log(tank_df.target.values);
        // console.log(colors);
        tank_df.print();

        for (const vol of volume_values) {
            if (vol < 10) {
                volume_texts.push("");
            }
            else {
                volume_texts.push(Math.ceil(vol/100) * 100);
            }
        }
        
        // for (const gdict of gdicts) {
        for (let i = 0; i < gdicts.length; i++) {
            const gdict         = gdicts[i];
            const voltext       = volume_texts[i];
            const target        = gdict.target;
            const start         = integrator.timestamp_from_unit(gdict.start);
            const end           = integrator.timestamp_from_unit(gdict.end);
            const duration      = integrator.duration_from_unit(gdict.duration);
            let info            = "";
            if (target == "null") {
                info          = `No target <br>start    ${start} <br>end      ${end}<br>duration ${duration}`;               
            }
            else {
                info          = `deliver ${voltext} to ${target} <br>start    ${start} <br>end      ${end}<br>duration ${duration}`;
            }
            hovertexts.push(info); 
        }

        const trace = {
            x               : tank_df.duration.values.map(val => val/86400.),
            y               : tank_df.tank.values,
            base            : tank_df.start.values.map(val => (1+val/86400.)),
            marker          : {
                color: colors,
                line: {
                    color: 'black',  
                    width: outlines
                }
            },
            hovertext       : hovertexts,
            hoverlabel: {
                font: {
                  family: 'monospace', // Or any other font family you prefer
                  size: 12,
                  color: 'black'
                }
            },
            hoverinfo       : "text",
            text            : volume_texts,
            textposition    : 'auto',
            textfont    : { 
                family: 'monospace',
                size: 14,
            },
            orientation     : 'h',
            showlegend      : false,
            name            : tank_name,
            type            : "bar"
        }
        traces.push(trace);

    }

    Plotly.newPlot("gantt-plot", traces, layout, display_config);  
}


function plot_table() {
    let layout   = {
        // autosize  : true,
        height: document.documentElement.clientHeight * 1.1,
        width    : 800,
        margin    : {
            l : 20,
            r : 20,
            b : 0,
            t : 50,
        },
        title           : {
            text        : "Schedule Table",
            standoff    : 0,
            font        : {
                size    : 18,
            },
            x: 0.5,  
            y: 1.2,
            xanchor: 'center',
            yanchor: 'top'
        },
    };

    const values  = [
        [], // source
        [], // target
        [], // start
        [], // end
        [], // duration
        []  // volume
    ]; 

    for (const tank_name of ["kilang_1", "tangki_1", "tangki_2"]) {
        const df      = global_grouped_df_dict[tank_name];

        for (const log of df) {
            let target      = log.target;
            let start       = integrator.timestamp_from_unit(log.start);
            let end         = integrator.timestamp_from_unit(log.end);
            let duration    = integrator.duration_from_unit(log.duration);

            let volume      = Math.ceil(log.volume/100) * 100;
            if (target == "null") {
                continue;
            }
            values[0].push(tank_name);
            values[1].push(target);
            values[2].push(start);
            values[3].push(end);
            values[4].push(duration);
            values[5].push(volume);
        }

    }

    var data = [{
        type: 'table',
        header: {
            values: [
                ["<b>Source</b>"], 
                ["<b>Target</b>"], 
                ["<b>Start</b>"], 
                ["<b>End</b>"],
                ["<b>Duration</b>"], 
                ["<b>Volume</b>"]
            ],
            align: "center",
            line: {width: 1, color: 'black'},
            fill: {color: "grey"},
            font: {family: "Monospace", size: 15, color: "white"}
        },
        cells: {
            values: values,
            align: "center",
            height: 30,
            line: {color: "black", width: 1},
            font: {family: "Monospace", size: 13, color: ["black"]}
        }
    }];

    const div_name = "table-plot";
    Plotly.newPlot(div_name, data, layout); 
}

// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
// RUN SIMULATION
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + +
const inputElement = document.getElementById("textInput");
inputElement.value = "\
d8 h1 m0 v3600\n\
d12 h1 m0 v2000\n\
d15 h1 m0 v3800\n\
d20 h1 m0 v4000\n\
d27 h1 m0 v3600\n\
";

document.getElementById('logButton').addEventListener('click', function() {
    const inputText = document.getElementById('textInput').value;
    integrator.run_simulation();
    plot_history();
    plot_gantt_chart();
    plot_table();
});

