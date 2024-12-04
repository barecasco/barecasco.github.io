import cls_agent
import pandas as pd
from datetime import datetime, timedelta
import numpy as np


agent           = None
integrator      = None
schedule        = None
name            = "tangki_1"



prop    = {
    "stock"             : 0,
    "capacity"          : 5600,
    "hourly_rate"       : 250.0,
    "is_discharging"    : False,
    "in_schedule"       : False,
    "in_analysis"       : False,
    "target_tank"       : "null",
    "total_outflow"     : 0
}




history = {}


def in_analysis():
    return prop["in_analysis"]


def in_schedule():
    return prop["in_schedule"]


def log_state():
    global integrator, history
    history[integrator.get_date_time()] = prop.copy()
        


def get_log_history():
    df                  = pd.DataFrame(history).transpose() 

    # real_times = []
    # for i, row in df.iterrows():
    #     unit_time = i
    #     real_time = init_time + timedelta(seconds=unit_time)
    #     real_times.append(real_time)

    # df["real_time"] = real_times
    return df

    
def init(integrator_inp):
    global integrator, log_state
    integrator      = integrator_inp
    agent           = cls_agent.Agent(integrator, name)
    agent.log_state = log_state






