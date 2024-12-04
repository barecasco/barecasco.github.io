import pandas as pd
from datetime import datetime, timedelta

class Integrator():
    def __init__(self):
        self.time           = 0
        self.step_index     = 0
        self.timestep       = 1
        self.step_horizon   = 1
        self.events             = []
        self.update_listeners   = []
        self.is_active      = False
        self.is_started     = False
        self.init_time_string  = '2024-04-01 00:00:00'
        self.init_time         = datetime.strptime(self.init_time_string, '%Y-%m-%d %H:%M:%S')
    
    def add_listener(self, obj):
        self.update_listeners.append(obj)


    def get_date_time(self):
        run_time = self.init_time + timedelta(seconds=self.time)
        return run_time 
    

    def raise_event(self, msg):
        print("event raised:", msg)
        self.events.append(msg)


    def purge_events(self):
        self.events = []


    def run_loop(self):
        while self.is_active:
            # listen for announcement and fix
            for listener in self.update_listeners:
                listener.bound_event_update(self.events)

            if not self.is_active:
                break

            # log state state
            for listener in self.update_listeners:
                listener.log_state()

            if self.step_index == self.step_horizon:
                break

            self.time       += self.timestep
            self.step_index += 1

            # update as per rule
            for listener in self.update_listeners:
                self.purge_events()
                listener.bound_update()

            # check for constraint violation and announce event
            for listener in self.update_listeners:
                listener.bound_fixed_update()


    def run_simulation(self):
        self.is_active  = True
        self.run_loop()
        self.time       = 0
        self.step_index = 0


    # pause simulation can work
    # because it is called inside the loop
    def pause_simulation(self, msg = ""):
        self.is_active = False
        print("simulation is paused: ", msg)
        print("time: ", self.time)


            
 



        

