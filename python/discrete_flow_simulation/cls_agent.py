

class Agent(object):
    def __init__(self, integrator, name):
        self.name                   = name

        self.event_updates          = {}
        self.updates                = {}
        self.fixed_updates          = {}

        self.event_update_states    = {}
        self.update_states          = {}
        self.fixed_update_states    = {}

        self.active                 = True
        self.integrator = integrator
        self.integrator.add_listener(self)

    
    def log_state(self):
        pass


    def set_active(self, func_name, state):
        if func_name in self.event_update_states:
            self.event_update_states[func_name] = state

        if func_name in self.update_states:
            self.update_states[func_name] = state

        if func_name in self.fixed_update_states:
            self.fixed_update_states[func_name] = state

    
    def get_active_state(self, func_name) :
        if func_name in self.event_update_states:
            return self.event_update_states[func_name]

        if func_name in self.update_states:
            return self.update_states[func_name]

        if func_name in self.fixed_update_states:
           return self.fixed_update_states[func_name]
        
        return None


    def add_schedules(self, time_mark, flow_set):
        self.flow_schedules.append((time_mark, flow_set))


    def add_event_update(self, funcname, func, state=False):
        if funcname in self.event_updates:
            print("warning: adding existing worker to event_updates")
        self.event_updates[funcname]        = func
        self.event_update_states[funcname]  = state


    def add_update(self, funcname, func, state=False):
        if funcname in self.updates:
            print("warning: adding existing worker to updates")
        self.updates[funcname]       = func
        self.update_states[funcname] = state
                

    def add_fixed_updates(self, funcname, func, state=False):
        if funcname in self.fixed_updates:
            print("warning: adding existing worker to fixed_updates")
        self.fixed_updates[funcname]        = func
        self.fixed_update_states[funcname] = state


    def bound_update(self):
        if not self.active: return
        if self.updates:
            for name, func in self.updates.items():
                if self.update_states[name]: func(self)


    def bound_fixed_update(self):
        if not self.active: return
        if self.fixed_updates:
            for name, func in self.fixed_updates.items():
               if self.fixed_update_states[name]: func()


    def bound_event_update(self, events):
        if not self.active: return

        if self.event_updates:
            for name, func in self.event_updates.items():
                if self.event_update_states[name] : func(self, events)
        